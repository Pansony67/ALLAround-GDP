// src/app/api/news/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.CURRENTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "CURRENTS_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const url = new URL("https://api.currentsapi.services/v2/latest-news");
  url.searchParams.set("category", "economy_business_finance");
  url.searchParams.set("language", "en");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      // Cache for 30 minutes so we don't burn through the daily quota
      // every time someone visits the page.
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Currents API responded with ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch news:", err);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 502 }
    );
  }
}

