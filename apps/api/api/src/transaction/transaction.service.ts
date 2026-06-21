import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import csvParser from 'csv-parser'
import { Readable } from 'stream'
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TransactionService {
  constructor(
  private prisma: PrismaService,
  private auditService: AuditService,
) {}

  // ✅ CREATE MANUAL
  async create(body: any) {
  return this.prisma.transaction.create({
    data: {
      productName: body.productName,
      qty: Number(body.qty),
      price: Number(body.price),
      amount: Number(body.qty) * Number(body.price),
      condition: body.condition,
      platform: body.platform,
      location: body.location,
    }
  });
}

  // ✅ IMPORT CSV (FIXED)
  async importCSV(file: Express.Multer.File) {
    const results: any[] = []

    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer)

      stream
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('ROW CSV:', data) // 🔥 debug penting
          results.push(data)
        })
        .on('end', async () => {
          try {
            for (const row of results) {
              const priceRaw = row['PRICE (IDR)'] || ''

              const price = Number(
                priceRaw
                  .replace('Rp', '')
                  .replace(/\./g, '')
                  .replace(/,/g, '')
                  .trim(),
              )

              const qty = Number(row['QTY'])

              await this.prisma.transaction.create({
                data: {
                  productName: row['PRODUCT NAME'],
                  qty: qty,
                  price: price,
                  amount: qty * price,
                  condition: row['CONDITION'],
                  platform: row['SOLD VIA'],
                  location: row['PRODUCT LOCATION'],
                },
              })
            }
            
            console.log('AUDIT IMPORT JALAN');
            await this.auditService.log(
  1,
  'IMPORT_CSV',
  '/transactions/import',
  'POST',
  `Imported ${results.length} rows`,
)

            resolve({
              message: 'Import success',
              total: results.length,
            })
          } catch (err) {
            console.error(err)
            reject(err)
          }
        })
        .on('error', (err) => reject(err))
    })
  }

  // ================= DELETE 1 =================
async delete(id: number) {
  return this.prisma.transaction.delete({
    where: { id },
  })
}

// ================= DELETE MANY =================
async deleteMany(ids: number[]) {
  return this.prisma.transaction.deleteMany({
    where: {
      id: { in: ids },
    },
  })
}
async reset() {
  // hapus semua data
  await this.prisma.$executeRawUnsafe(
    `DELETE FROM "Transaction";`
  )

  // reset auto increment ID
  await this.prisma.$executeRawUnsafe(
    `DELETE FROM sqlite_sequence WHERE name='Transaction';`
  )

  return { message: 'Database reset success (SQLite)' }
}

  // ✅ GET + FILTER
  async getTransactions({
  page = 1,
  limit = 10,
  search,
  platform,
  startDate,
  endDate,
  sortField,
  sortOrder,
}: any) {
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.productName = {
        contains: search,
      }
    }

    if (platform) {
      where.platform = platform
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const orderBy: any =
  sortField && sortOrder
    ? { [sortField]: sortOrder }
    : { id: 'asc' }

    const data = await this.prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    })

    const total = await this.prisma.transaction.count({ where })

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }
}