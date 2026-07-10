// prisma/seed.ts
import { prisma } from "../src/lib/prisma";

const YEARS = "2020:2024"; // ช่วงปีที่จะดึงข้อมูล (5 ปีล่าสุด)

interface WorldBankCountry {
  id: string;
  name: string;
  region: { id: string; value: string };
}

interface WorldBankIndicatorRecord {
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function fetchAllCountries(): Promise<WorldBankCountry[]> {
  const res = await fetch(
    "https://api.worldbank.org/v2/country?format=json&per_page=300"
  );
  const json = await res.json();
  const countries: WorldBankCountry[] = json[1];
  // ตัด "Aggregates" (เช่น World, East Asia & Pacific) ออก เหลือแต่ประเทศจริง
  return countries.filter((c) => c.region.value.trim() !== "Aggregates");
}

async function fetchIndicator(
  indicatorCode: string
): Promise<WorldBankIndicatorRecord[]> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=20000&date=${YEARS}`;
  const res = await fetch(url);
  const json = await res.json();
  return json[1] ?? [];
}

type MergedRecord = {
  countryCode: string;
  year: number;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

function mergeIndicatorInto(
  merged: Map<string, MergedRecord>,
  records: WorldBankIndicatorRecord[],
  field: "gdpUsd" | "gdpPerCapita" | "gdpGrowthPct"
) {
  for (const r of records) {
    if (!r.countryiso3code) continue;
    const key = `${r.countryiso3code}-${r.date}`;
    const existing = merged.get(key) ?? {
      countryCode: r.countryiso3code,
      year: Number(r.date),
      gdpUsd: null,
      gdpPerCapita: null,
      gdpGrowthPct: null,
    };
    existing[field] = r.value;
    merged.set(key, existing);
  }
}

async function main() {
  console.log("1/4 Fetching country list from World Bank...");
  const countries = await fetchAllCountries();
  console.log(`   Found ${countries.length} countries`);

  console.log("2/4 Saving countries to database...");
  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.id },
      update: { name: c.name, region: c.region.value.trim() },
      create: {
        code: c.id,
        name: c.name,
        region: c.region.value.trim(),
      },
    });
  }

  console.log("3/4 Fetching GDP indicators (this may take a moment)...");
  const [gdpUsd, gdpPerCapita, gdpGrowth] = await Promise.all([
    fetchIndicator("NY.GDP.MKTP.CD"),
    fetchIndicator("NY.GDP.PCAP.CD"),
    fetchIndicator("NY.GDP.MKTP.KD.ZG"),
  ]);

  const merged = new Map<string, MergedRecord>();
  mergeIndicatorInto(merged, gdpUsd, "gdpUsd");
  mergeIndicatorInto(merged, gdpPerCapita, "gdpPerCapita");
  mergeIndicatorInto(merged, gdpGrowth, "gdpGrowthPct");

  console.log(`4/4 Saving ${merged.size} GDP records to database...`);

  // ดึง id จริงในฐานข้อมูลของแต่ละประเทศมาเตรียมไว้ล่วงหน้า กัน query ซ้ำทีละแถว
  const dbCountries = await prisma.country.findMany();
  const codeToId = new Map(dbCountries.map((c) => [c.code, c.id]));

  let saved = 0;
  for (const record of merged.values()) {
    const countryId = codeToId.get(record.countryCode);
    if (!countryId) continue; // ข้ามถ้าไม่ใช่ประเทศที่เราเก็บไว้
    if (
      record.gdpUsd === null &&
      record.gdpPerCapita === null &&
      record.gdpGrowthPct === null
    ) {
      continue; // ข้ามถ้าปีนั้นไม่มีข้อมูลอะไรเลย
    }

    await prisma.gdpRecord.upsert({
      where: {
        countryId_year: { countryId, year: record.year },
      },
      update: {
        gdpUsd: record.gdpUsd,
        gdpPerCapita: record.gdpPerCapita,
        gdpGrowthPct: record.gdpGrowthPct,
      },
      create: {
        countryId,
        year: record.year,
        gdpUsd: record.gdpUsd,
        gdpPerCapita: record.gdpPerCapita,
        gdpGrowthPct: record.gdpGrowthPct,
      },
    });
    saved++;
  }

  console.log(`Done. Saved/updated ${saved} GDP records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });