-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Assistant" DROP CONSTRAINT "Assistant_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_roleOptionId_fkey";

-- DropForeignKey
ALTER TABLE "RoleOption" DROP CONSTRAINT "RoleOption_roleId_fkey";

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOption" ADD CONSTRAINT "RoleOption_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_roleOptionId_fkey" FOREIGN KEY ("roleOptionId") REFERENCES "RoleOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
