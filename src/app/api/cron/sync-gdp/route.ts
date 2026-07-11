// src/app/api/cron/sync-gdp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // ขอเวลาสูงสุด 60 วิ (Vercel อาจจำกัดต่ำกว่านี้ตาม plan)

interface WorldBankIndicatorRecord {
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function fetchLatestIndicator(indicatorCode: string, year: number) {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=400&date=${year}`;
  const res = await fetch(url);
  const json = await res.json();
  return (json[1] ?? []) as WorldBankIndicatorRecord[];
}

type Merged = {
  countryCode: string;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

function mergeInto(
  merged: Map<string, Merged>,
  records: WorldBankIndicatorRecord[],
  field: "gdpUsd" | "gdpPerCapita" | "gdpGrowthPct"
) {
  for (const r of records) {
    if (!r.countryiso3code) continue;
    const existing = merged.get(r.countryiso3code) ?? {
      countryCode: r.countryiso3code,
      gdpUsd: null,
      gdpPerCapita: null,
      gdpGrowthPct: null,
    };
    existing[field] = r.value;
    merged.set(r.countryiso3code, existing);
  }
}

export async function GET(request: NextRequest) {
  // 1. เช็ค secret ก่อน กันคนอื่นยิง endpoint นี้มั่ว
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. sync แค่ "ปีที่แล้ว" เพราะปีปัจจุบันข้อมูล World Bank มักยังไม่สมบูรณ์
  const year = new Date().getFullYear() - 1;

  const [gdpUsd, gdpPerCapita, gdpGrowth] = await Promise.all([
    fetchLatestIndicator("NY.GDP.MKTP.CD", year),
    fetchLatestIndicator("NY.GDP.PCAP.CD", year),
    fetchLatestIndicator("NY.GDP.MKTP.KD.ZG", year),
  ]);

  const merged = new Map<string, Merged>();
  mergeInto(merged, gdpUsd, "gdpUsd");
  mergeInto(merged, gdpPerCapita, "gdpPerCapita");
  mergeInto(merged, gdpGrowth, "gdpGrowthPct");

  const dbCountries = await prisma.country.findMany();
  const codeToId = new Map(dbCountries.map((c) => [c.code, c.id]));

  const updates = Array.from(merged.values()).filter(
    (r) =>
      codeToId.has(r.countryCode) &&
      (r.gdpUsd !== null || r.gdpPerCapita !== null || r.gdpGrowthPct !== null)
  );

  // 3. อัปเดตแบบ batch ทีละ 10 รายการ (เร็วกว่าทำทีละอัน แต่ไม่ยิง connection พร้อมกันเยอะเกิน)
  const CONCURRENCY = 10;
  let saved = 0;
  for (let i = 0; i < updates.length; i += CONCURRENCY) {
    const batch = updates.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((r) => {
        const countryId = codeToId.get(r.countryCode)!;
        return prisma.gdpRecord.upsert({
          where: { countryId_year: { countryId, year } },
          update: {
            gdpUsd: r.gdpUsd,
            gdpPerCapita: r.gdpPerCapita,
            gdpGrowthPct: r.gdpGrowthPct,
          },
          create: {
            countryId,
            year,
            gdpUsd: r.gdpUsd,
            gdpPerCapita: r.gdpPerCapita,
            gdpGrowthPct: r.gdpGrowthPct,
          },
        });
      })
    );
    saved += batch.length;
  }

  return NextResponse.json({ year, updated: saved });
}