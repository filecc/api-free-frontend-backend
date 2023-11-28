-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Post_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
