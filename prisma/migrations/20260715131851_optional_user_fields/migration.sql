-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScreeningResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "childAge" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScreeningResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScreeningResult" ("childAge", "completed", "concerns", "createdAt", "id", "report", "strengths", "userId") SELECT "childAge", "completed", "concerns", "createdAt", "id", "report", "strengths", "userId" FROM "ScreeningResult";
DROP TABLE "ScreeningResult";
ALTER TABLE "new_ScreeningResult" RENAME TO "ScreeningResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
