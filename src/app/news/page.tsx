// src/app/news/page.tsx
import { Poiret_One } from "next/font/google";
import NewsImage from "@/components/NewsImage";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string | null;
  image: string | null;
  language: string;
  category: string[];
  published: string;
};

async function getNews(): Promise<NewsArticle[]> {
  // Fetch directly from Currents here (server component), so this page
  // works even without going through our own /api/news route.
  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.currentsapi.services/v2/latest-news");
  url.searchParams.set("category", "economy_business_finance");
  url.searchParams.set("language", "en");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.news ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function NewsPage() {
  const articles = await getNews();

  return (
    <main
      className={`${poiretOne.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Galaxy glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            Business News
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Live economy and business headlines that move the numbers you see
            on the map.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
            No news available right now. If this keeps happening, check that
            <code className="mx-1 rounded bg-white/10 px-2 py-0.5 text-white/70">
              CURRENTS_API_KEY
            </code>
            is set correctly.
          </div>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/10"
              >
                {article.image && <NewsImage src={article.image} />}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-white/40">
                    {formatDate(article.published)}
                    {article.author ? ` \u00b7 ${article.author}` : ""}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-snug text-white transition group-hover:text-violet-200">
                    {article.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-white/60">
                    {article.description}
                  </p>
                  <span className="mt-4 text-xs text-violet-300">
                    Read more &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
