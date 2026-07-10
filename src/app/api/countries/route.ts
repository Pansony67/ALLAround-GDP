// src/app/api/countries/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // หาปีล่าสุดที่มีข้อมูลอยู่จริงในฐานข้อมูล (แทนที่จะ hardcode ปีตายตัว)
  const latest = await prisma.gdpRecord.aggregate({
    _max: { year: true },
  });
  const year = latest._max.year;

  if (!year) {
    return NextResponse.json(
      { error: "No GDP data found in database" },
      { status: 404 }
    );
  }

  const records = await prisma.gdpRecord.findMany({
    where: { year },
    include: { country: true },
  });

  const data = records.map((r) => ({
    code: r.country.code,
    name: r.country.name,
    region: r.country.region,
    year: r.year,
    gdpUsd: r.gdpUsd,
    gdpPerCapita: r.gdpPerCapita,
    gdpGrowthPct: r.gdpGrowthPct,
  }));

  return NextResponse.json(data);
}