// src/app/page.tsx
import WorldMap from "@/components/WorldMap";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-8">
      <WorldMap />
    </main>
  );
}
