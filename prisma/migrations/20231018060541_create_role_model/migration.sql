/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Auth" AS ENUM ('Super', 'Admin', 'Mod', 'Sell', 'User');

-- CreateEnum
CREATE TYPE "OpType" AS ENUM ('add', 'upgrade', 'delete');

-- CreateEnum
CREATE TYPE "ApiType" AS ENUM ('openai', 'fastgpt', 'vectorvein', 'flowise');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('select', 'input', 'imageUploader', 'promptSelect');

-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('chat', 'bot');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Auth" NOT NULL DEFAULT 'User';

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Operation" (
    "id" SERIAL NOT NULL,
    "opType" "OpType" NOT NULL,
    "op" TEXT NOT NULL,
    "user" TEXT NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "img" TEXT NOT NULL,
    "imgAlt" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "example" TEXT,
    "api" "ApiType",
    "mode" "Mode",
    "systemPrompt" TEXT,
    "cost" INTEGER NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" SERIAL NOT NULL,
    "avatar" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleOption" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "width" INTEGER,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "RoleOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "prompt" TEXT,
    "roleOptionId" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_roleId_key" ON "Assistant"("roleId");

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOption" ADD CONSTRAINT "RoleOption_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_roleOptionId_fkey" FOREIGN KEY ("roleOptionId") REFERENCES "RoleOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
