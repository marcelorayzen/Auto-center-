-- CreateTable
CREATE TABLE "Wash" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plate" TEXT NOT NULL,
    "washServiceId" INTEGER NOT NULL,
    "washServiceName" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized" BOOLEAN NOT NULL DEFAULT false
);
