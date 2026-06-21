/*
  Warnings:

  - You are about to drop the column `product` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `condition` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "customer" TEXT,
    "rating" INTEGER,
    "soldDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "id") SELECT "amount", "createdAt", "id" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
