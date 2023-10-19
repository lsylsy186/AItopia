/*
  Warnings:

  - You are about to drop the column `imgAlt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `Role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "imgAlt",
DROP COLUMN "index",
ADD COLUMN     "productLine" TEXT[];
