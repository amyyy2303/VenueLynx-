-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'TEACHER', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN') NOT NULL DEFAULT 'TEACHER',
    `phone` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venue` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` ENUM('AUDITORIUM', 'LECTURE_THEATRE', 'BOARD_ROOM', 'SEMINAR_HALL', 'GD_ROOM', 'LANGUAGE_LAB', 'CLASSROOM', 'TUTORIAL_ROOM', 'COMPUTER_LAB', 'CIVIL_ENGINEERING_LAB', 'BASKETBALL_COURT', 'BADMINTON_COURT', 'COLLEGE_GROUND', 'OPEN_CAFETERIA') NOT NULL,
    `building` VARCHAR(191) NOT NULL,
    `floor` VARCHAR(191) NOT NULL,
    `roomNumber` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `facilities` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Venue_code_key`(`code`),
    INDEX `Venue_type_idx`(`type`),
    INDEX `Venue_building_idx`(`building`),
    INDEX `Venue_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `eventDate` DATETIME(3) NOT NULL,
    `timeFrom` VARCHAR(191) NOT NULL,
    `timeTo` VARCHAR(191) NOT NULL,
    `participants` INTEGER NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `refreshments` BOOLEAN NOT NULL DEFAULT false,
    `paSystem` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING_ADMIN', 'PENDING_REGISTRAR', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING_ADMIN',
    `adminApprovedAt` DATETIME(3) NULL,
    `adminApprovedBy` VARCHAR(191) NULL,
    `adminRemarks` VARCHAR(191) NULL,
    `registrarApprovedAt` DATETIME(3) NULL,
    `registrarApprovedBy` VARCHAR(191) NULL,
    `registrarRemarks` VARCHAR(191) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `rejectedBy` VARCHAR(191) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `qrCode` VARCHAR(191) NULL,
    `qrGeneratedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_qrCode_key`(`qrCode`),
    INDEX `Booking_venueId_idx`(`venueId`),
    INDEX `Booking_userId_idx`(`userId`),
    INDEX `Booking_eventDate_idx`(`eventDate`),
    INDEX `Booking_status_idx`(`status`),
    INDEX `Booking_venueId_eventDate_idx`(`venueId`, `eventDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `eventDate` DATETIME(3) NOT NULL,
    `timeFrom` VARCHAR(191) NOT NULL,
    `timeTo` VARCHAR(191) NOT NULL,
    `participants` INTEGER NOT NULL,
    `qrCode` VARCHAR(191) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Event_bookingId_key`(`bookingId`),
    UNIQUE INDEX `Event_qrCode_key`(`qrCode`),
    INDEX `Event_eventDate_idx`(`eventDate`),
    INDEX `Event_venueId_idx`(`venueId`),
    INDEX `Event_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherAvailability` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeacherAvailability_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `totalBookings` INTEGER NOT NULL DEFAULT 0,
    `approvedBookings` INTEGER NOT NULL DEFAULT 0,
    `rejectedBookings` INTEGER NOT NULL DEFAULT 0,
    `totalEvents` INTEGER NOT NULL DEFAULT 0,
    `mostUsedVenue` VARCHAR(191) NULL,
    `busiestDay` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AnalyticsSnapshot_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `Venue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `Venue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherAvailability` ADD CONSTRAINT `TeacherAvailability_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
