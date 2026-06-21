import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  await prisma.transaction.createMany({
    data: [

      {
        productName: "Product A",
        qty: 1,
        price: 500000,
        amount: 500000,
        location: "Jakarta",
        condition: "Second - Like New",
        platform: "Tokopedia",
        customer: "Customer A",
        rating: 5,
        soldDate: new Date("2026-01-10"),
      },

      {
        productName: "Product B",
        qty: 1,
        price: 300000,
        amount: 300000,
        location: "Bandung",
        condition: "Second",
        platform: "Tokopedia",
        customer: null,
        rating: null,
        soldDate: new Date("2026-02-15"),
      },

      {
        productName: "Product C",
        qty: 1,
        price: 200000,
        amount: 200000,
        location: "Jakarta",
        condition: "Like New",
        platform: "Tokopedia",
        customer: "Customer B",
        rating: 4,
        soldDate: new Date("2026-03-20"),
      }

    ],
  })

  console.log("✅ Seed data inserted")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })