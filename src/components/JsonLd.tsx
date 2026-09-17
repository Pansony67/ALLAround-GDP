// src/components/JsonLd.tsx
/**
 * Emits one schema.org block as JSON-LD.
 *
 * This is the shape Next.js documents for structured data: a
 * <script type="application/ld+json"> whose body is the serialised
 * object. The browser never executes it - it is a data block, not code -
 * and the "<" escape below stops a stray "</script>" inside any string
 * value from closing the tag early.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
