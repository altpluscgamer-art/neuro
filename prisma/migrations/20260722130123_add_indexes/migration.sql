-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "courseId", "createdAt", "id", "provider", "providerId", "status", "userId") SELECT "amount", "courseId", "createdAt", "id", "provider", "providerId", "status", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Article_isPublished_idx" ON "Article"("isPublished");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_slotId_idx" ON "Booking"("slotId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "ConsultationRequest_status_idx" ON "ConsultationRequest"("status");

-- CreateIndex
CREATE INDEX "Course_isPublished_idx" ON "Course"("isPublished");

-- CreateIndex
CREATE INDEX "ScheduleSlot_date_idx" ON "ScheduleSlot"("date");

-- CreateIndex
CREATE INDEX "ScheduleSlot_isActive_idx" ON "ScheduleSlot"("isActive");

-- CreateIndex
CREATE INDEX "ScreeningResult_userId_idx" ON "ScreeningResult"("userId");

-- CreateIndex
CREATE INDEX "ScreeningResult_completed_idx" ON "ScreeningResult"("completed");

-- CreateIndex
CREATE INDEX "SiteStat_date_idx" ON "SiteStat"("date");
