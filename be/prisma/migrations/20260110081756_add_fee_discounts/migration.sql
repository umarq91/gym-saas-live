/*
  Warnings:

  - You are about to drop the column `amount` on the `Fees` table. All the data in the column will be lost.
  - Added the required column `amountPaid` to the `Fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountApplied` to the `Fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `Fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalAmount` to the `Fees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');

-- AlterTable
ALTER TABLE "Fees" DROP COLUMN "amount",
ADD COLUMN     "amountPaid" INTEGER NOT NULL,
ADD COLUMN     "discountApplied" TEXT NOT NULL,
ADD COLUMN     "discountType" "DiscountType" NOT NULL,
ADD COLUMN     "originalAmount" INTEGER NOT NULL;
