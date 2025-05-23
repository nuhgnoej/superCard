/*
  Warnings:

  - Made the column `lastReviewAt` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextReviewAt` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "image" TEXT,
    "type" TEXT,
    "tier" INTEGER,
    "box" INTEGER,
    "superCardId" INTEGER,
    "class" TEXT,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "lastReviewAt" DATETIME NOT NULL,
    "nextReviewAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "deckId" INTEGER,
    CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("answer", "box", "class", "content", "createdAt", "deckId", "easeFactor", "id", "image", "intervalDays", "lastReviewAt", "nextReviewAt", "reviewCount", "superCardId", "tier", "title", "type", "updatedAt", "userId") SELECT "answer", "box", "class", "content", "createdAt", "deckId", "easeFactor", "id", "image", "intervalDays", "lastReviewAt", "nextReviewAt", "reviewCount", "superCardId", "tier", "title", "type", "updatedAt", "userId" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
