// src/components/GlobeMapLazy.tsx
"use client";

import dynamic from "next/dynamic";

// react-globe.gl uses WebGL and the window object, which only exist in the
// browser. ssr: false makes Next.js skip rendering it on the server.
const GlobeMap = dynamic(() => import("./GlobeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-3xl border border-white/10 text-white/50">
      Loading globe...
    </div>
  ),
});

export default GlobeMap;