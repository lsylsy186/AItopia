-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Mod', 'Sell', 'User');

-- CreateEnum
CREATE TYPE "ProductLine" AS ENUM ('Normal', 'Hebao');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "productLine" "ProductLine" NOT NULL DEFAULT 'Normal',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'User';
