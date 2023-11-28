/*
  Warnings:

  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `categoryId` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `B` on the `_PostToTag` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `_PostToTag` DROP FOREIGN KEY `_PostToTag_B_fkey`;

-- AlterTable
ALTER TABLE `Category` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Post` MODIFY `categoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Tag` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_PostToTag` MODIFY `B` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostToTag` ADD CONSTRAINT `_PostToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
