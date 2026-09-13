// src/lib/country-slug.ts

/* Turns a country name into the URL segment used by /country/[slug],
   e.g. "United States" -> "united-states", "Cote d'Ivoire" -> "cote-d-ivoire".

   Slugs are derived from the name rather than the ISO code because
   /country/thailand is what people actually search for and link to,
   while /country/tha means nothing to a reader or to Google. */
export function countryNameToSlug(name: string): string {
  return name
    .normalize("NFD")
    // Strip accents so "Turkiye" and "Turkiye" (with umlaut) match.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
