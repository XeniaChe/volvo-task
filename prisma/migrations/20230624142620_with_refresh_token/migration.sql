/*
  Warnings:

  - Made the column `refreshToken` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "refreshToken" SET NOT NULL;
