// src/app/api/history/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country");

  if (countryCode) {
    const country = await prisma.country.findUnique({
      where: { code: countryCode },
      include: {
        gdpRecords: {
          orderBy: { year: "asc" },
        },
      },
    });

    if (!country) {
      return NextResponse.json(
        { error: `Country with code "${countryCode}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: country.code,
      name: country.name,
      region: country.region,
      records: country.gdpRecords.map((r) => ({
        year: r.year,
        gdpUsd: r.gdpUsd,
        gdpPerCapita: r.gdpPerCapita,
        gdpGrowthPct: r.gdpGrowthPct,
      })),
    });
  }

  const records = await prisma.gdpRecord.findMany({
    where: { gdpUsd: { not: null } },
    select: { year: true, gdpUsd: true },
    orderBy: { year: "asc" },
  });

  const byYear = new Map<number, { total: number; count: number }>();
  for (const r of records) {
    if (r.gdpUsd == null) continue;
    const entry = byYear.get(r.year) ?? { total: 0, count: 0 };
    entry.total += r.gdpUsd;
    entry.count += 1;
    byYear.set(r.year, entry);
  }

  const data = Array.from(byYear.entries())
    .map(([year, { total, count }]) => ({
      year,
      totalGdpUsd: total,
      countryCount: count,
    }))
    .sort((a, b) => a.year - b.year);

  if (data.length === 0) {
    return NextResponse.json(
      { error: "No GDP data found in database" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
