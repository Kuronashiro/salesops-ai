import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Res,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express'
import { AuditService } from '../audit/audit.service';;
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

@Controller('transactions')
export class TransactionController {
  constructor(
  private readonly service: TransactionService,
  private readonly auditService: AuditService, // 🔥 TAMBAH INI
) {}

  // ================= CREATE =================
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // ================= IMPORT CSV =================
  @Post('import')
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(FileInterceptor('file'))
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    return this.service.importCSV(file);
  }

  // ================= GET =================
  @Get()
@UseGuards(AuthGuard('jwt'))
async getTransactions(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('search') search?: string,
  @Query('platform') platform?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,

  @Query('sortField') sortField?: string,
  @Query('sortOrder') sortOrder?: 'asc' | 'desc',
) {
    return this.service.getTransactions({
  page: Number(page),
  limit: Number(limit),
  search,
  platform,
  startDate,
  endDate,

  sortField,
  sortOrder,
});
  }

  // ================= EXPORT CSV =================
  @Get('export')
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
  async exportCSV(@Req() req: any, @Res() res: Response) {
    const user = req.user;

    // 🔐 hanya admin boleh export
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // ambil semua data (limit besar biar keambil semua)
    const result = await this.service.getTransactions({
      page: 1,
      limit: 10000,
    });

    const data = result.data;

    // header CSV
    const header = 'Product,Qty,Price\n';

    // isi CSV
    const rows = data.map((d: any) =>
  `${d.productName},${d.qty},${d.price}`
).join('\n');

    const csv = header + rows;

    // response sebagai file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv',
    );

await this.auditService.log(
  req.user?.userId || 0,
  'EXPORT_CSV',
  '/transactions/export',
  'GET',
);
    console.log("USER:", req.user);
    res.send(csv);
  }

  // ================= RESET =================
  @Delete('reset')
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
async reset() {
  return this.service.reset()
}

  // ================= DELETE ONE =================
  @Delete(':id')
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }

  // ================= DELETE MANY =================
  @Delete()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
  removeMany(@Body() body: { ids: number[] }) {
    return this.service.deleteMany(body.ids);
  }
}