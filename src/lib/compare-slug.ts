// src/lib/compare-slug.ts
/* Pair-slug helpers, kept apart from lib/compare.ts on purpose.

   ComparePicker is a client component, and anything it imports gets
   pulled into the browser bundle along with that module's own imports.
   lib/compare.ts imports Prisma, so importing buildPairSlug from there
   dragged Prisma, pg and node:module into the client graph and broke
   `next build` ("the chunking context does not support external
   modules"). These three are pure string functions with no imports at
   all, so both the client and the server can use them safely.

   lib/compare.ts re-exports them, so server-side import sites can keep
   importing from "@/lib/compare" as before. */

export const PAIR_SEPARATOR = "-vs-";

export function buildPairSlug(slugA: string, slugB: string): string {
  return `${slugA}${PAIR_SEPARATOR}${slugB}`;
}

export function parsePairSlug(
  pair: string
): { slugA: string; slugB: string } | null {
  const index = pair.indexOf(PAIR_SEPARATOR);
  if (index <= 0) return null;

  const slugA = pair.slice(0, index);
  const slugB = pair.slice(index + PAIR_SEPARATOR.length);
  if (!slugA || !slugB || slugA === slugB) return null;

  return { slugA, slugB };
}
