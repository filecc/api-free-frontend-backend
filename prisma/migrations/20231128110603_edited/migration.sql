/*
  Warnings:

  - Added the required column `postedById` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `postedById` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_postedById_fkey` FOREIGN KEY (`postedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
