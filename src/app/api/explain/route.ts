// src/app/api/explain/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countryCode = searchParams.get("code");
  const language = searchParams.get("lang") ?? "en";

  if (!countryCode) {
    return NextResponse.json(
      { error: "Missing 'code' query parameter" },
      { status: 400 }
    );
  }
  if (language !== "th" && language !== "en") {
    return NextResponse.json(
      { error: "'lang' must be 'th' or 'en'" },
      { status: 400 }
    );
  }

  // 1. หาประเทศนี้ในฐานข้อมูล พร้อมข้อมูล GDP ปีล่าสุด
  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    include: {
      gdpRecords: { orderBy: { year: "desc" }, take: 1 },
      explanations: { where: { language } },
    },
  });

  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }

  // 2. เช็ค cache ก่อน — มีคำอธิบายภาษานี้อยู่แล้วไหม
  const cached = country.explanations[0];
  if (cached) {
    return NextResponse.json({ explanation: cached.content, cached: true });
  }

  // 3. ไม่มี cache -> เรียก Claude generate ใหม่
  const gdp = country.gdpRecords[0];
  if (!gdp) {
    return NextResponse.json(
      { error: "No GDP data available for this country" },
      { status: 404 }
    );
  }

  const languageInstruction =
    language === "th"
      ? "Write the explanation in Thai (ภาษาไทย)."
      : "Write the explanation in English.";

  const prompt = `You are explaining economic data to a non-expert reader.
Country: ${country.name} (${country.region})
Year: ${gdp.year}
GDP: ${gdp.gdpUsd ? `$${(gdp.gdpUsd / 1e9).toFixed(1)} billion USD` : "N/A"}
GDP per capita: ${gdp.gdpPerCapita ? `$${gdp.gdpPerCapita.toFixed(0)} USD` : "N/A"}
GDP growth: ${gdp.gdpGrowthPct ? `${gdp.gdpGrowthPct.toFixed(1)}%` : "N/A"}

Write a short, plain-language explanation (2-3 sentences) of what these
numbers mean for this country's economy. Avoid jargon. ${languageInstruction}
Do not include any preamble, just the explanation itself.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const explanationText = textBlock?.type === "text" ? textBlock.text : "";

  if (!explanationText) {
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }

  // 4. เก็บลง database เพื่อใช้เป็น cache ครั้งต่อไป
  await prisma.explanation.upsert({
    where: {
      countryId_language: { countryId: country.id, language },
    },
    update: { content: explanationText },
    create: {
      countryId: country.id,
      language,
      content: explanationText,
    },
  });

  return NextResponse.json({ explanation: explanationText, cached: false });
}