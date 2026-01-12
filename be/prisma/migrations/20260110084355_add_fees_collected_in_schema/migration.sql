/*
  Warnings:

  - A unique constraint covering the columns `[takenById]` on the table `Fees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `takenById` to the `Fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Fees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fees" ADD COLUMN     "takenById" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Fees_takenById_key" ON "Fees"("takenById");

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_takenById_fkey" FOREIGN KEY ("takenById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
