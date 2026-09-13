// src/components/SiteBackground.tsx
/**
 * The site-wide animated backdrop.
 *
 * One fixed layer that sits behind every page (z-index -10) and never
 * scrolls: a faint masked grid for structure, three very slow aurora
 * glows for depth, a fine grain for texture, and a vignette so the
 * edges of the viewport stay black.
 *
 * Deliberately plain markup - no client component, no JS, no library.
 * Everything animates with transform only, so it costs the compositor
 * almost nothing, and it goes static automatically for users who ask
 * for reduced motion (see globals.css).
 *
 * The home page keeps its own hero video and static glows, so its
 * <main> still carries bg-black and covers this layer.
 */
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      <div className="site-bg__grid" />
      <div className="site-bg__glow site-bg__glow--1" />
      <div className="site-bg__glow site-bg__glow--2" />
      <div className="site-bg__glow site-bg__glow--3" />
      <div className="site-bg__grain" />
      <div className="site-bg__vignette" />
    </div>
  );
}
