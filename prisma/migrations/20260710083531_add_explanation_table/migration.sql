-- CreateTable
CREATE TABLE "Explanation" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Explanation_countryId_language_key" ON "Explanation"("countryId", "language");

-- AddForeignKey
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
