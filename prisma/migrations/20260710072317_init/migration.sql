-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdpRecord" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "gdpUsd" DOUBLE PRECISION,
    "gdpPerCapita" DOUBLE PRECISION,
    "gdpGrowthPct" DOUBLE PRECISION,
    "countryId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GdpRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GdpRecord_countryId_year_key" ON "GdpRecord"("countryId", "year");

-- AddForeignKey
ALTER TABLE "GdpRecord" ADD CONSTRAINT "GdpRecord_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
