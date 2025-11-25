/*
  Warnings:

  - You are about to drop the `Wash` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `date` on the `WashRecord` table. All the data in the column will be lost.
  - You are about to drop the column `finalized` on the `WashRecord` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Wash";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WashRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plate" TEXT NOT NULL,
    "washServiceId" INTEGER NOT NULL,
    "washServiceName" TEXT NOT NULL,
    "employeeId" INTEGER,
    "employeeName" TEXT,
    "value" REAL NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);
INSERT INTO "new_WashRecord" ("employeeId", "employeeName", "id", "plate", "value", "washServiceId", "washServiceName") SELECT "employeeId", "employeeName", "id", "plate", "value", "washServiceId", "washServiceName" FROM "WashRecord";
DROP TABLE "WashRecord";
ALTER TABLE "new_WashRecord" RENAME TO "WashRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
