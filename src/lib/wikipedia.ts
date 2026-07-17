// src/lib/wikipedia.ts

export function wikipediaEconomyUrl(countryName: string): string {
  const slug = countryName.trim().replace(/\s+/g, "_");
  return `https://en.wikipedia.org/wiki/Economy_of_${encodeURIComponent(slug)}`;
}