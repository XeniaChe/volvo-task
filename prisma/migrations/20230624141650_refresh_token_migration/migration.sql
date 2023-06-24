/*
  Warnings:

  - The required column `refreshToken` was added to the `Customer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "refreshToken" TEXT NULL;
