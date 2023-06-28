/*
  Warnings:

  - Added the required column `codeHash` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "codeHash" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;
