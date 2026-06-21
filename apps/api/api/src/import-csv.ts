import * as fs from "fs"
import csv from "csv-parser"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function importCSV() {

  const results: any[] = []

  fs.createReadStream("./data/sales.csv")
    .pipe(csv())

    .on("data", (data) => {

      // skip row kosong
      if (!data["PRODUCT NAME"]) return

      /* ---------------- PARSE QTY ---------------- */

      const qty = parseInt(data["QTY"]) || 1


      /* ---------------- PARSE PRICE ---------------- */

      const price = parseInt(
        data["PRICE (IDR)"]
          ?.replace(/Rp/g, "")
          .replace(/\./g, "")
          .replace(/,/g, "")
          .trim()
      ) || 0


      /* ---------------- PARSE RATING ---------------- */

      let rating: number | null = null

      const ratingField = data["RATING / FEEDBACK"]

      if (ratingField) {
        const stars = ratingField.match(/⭐/g)
        rating = stars ? stars.length : null
      }


      /* ---------------- PARSE DATE ---------------- */

      let soldDate: Date | null = null

      const rawDate = data["SOLD DATE"]

      if (rawDate && !isNaN(Date.parse(rawDate))) {
        soldDate = new Date(rawDate)
      }


      /* ---------------- PUSH CLEAN DATA ---------------- */

      results.push({

        productName: data["PRODUCT NAME"].trim(),

        qty: qty,

        price: price,

        amount: qty * price,

        location: data["PRODUCT LOCATION"],

        condition: data["CONDITION"],

        platform: data["SOLD VIA"],

        customer: data["SOLD TO"] || null,

        rating: rating ?? null,

        soldDate: soldDate ?? null

      })

    })


    .on("end", async () => {

      console.log("Rows parsed:", results.length)

      await prisma.transaction.createMany({
        data: results
      })

      console.log("CSV imported successfully")

      process.exit()

    })

}

importCSV()