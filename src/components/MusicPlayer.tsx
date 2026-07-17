// src/components/MusicPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

const TRACKS = [
  { title: "Airy Space Drums", src: "/music/airy-space-drums.mp3" },
  { title: "Deeper Space Drift", src: "/music/deeper-space-drift.mp3" },
  { title: "Astronaut Drift (Lofi)", src: "/music/astronaut-drift-lofi.mp3" },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Load and (if already playing) resume playback whenever the track changes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) {
      audio.play().catch((err) => console.error("Playback failed:", err));
    }
  }, [trackIndex]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => console.error("Playback failed:", err));
      setIsPlaying(true);
    }
  }

  function nextTrack() {
    setTrackIndex((i) => (i + 1) % TRACKS.length);
  }

  function prevTrack() {
    setTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={TRACKS[trackIndex].src}
        onEnded={nextTrack}
        preload="none"
      />

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6 sm:gap-3">
        {isExpanded && (
          <div className="w-56 rounded-2xl border border-white/15 bg-black/80 p-4 text-white shadow-[0_0_30px_rgba(124,58,237,0.2)] backdrop-blur-md sm:w-64">
            <p className="text-xs text-white/40">Now playing</p>
            <p className="mt-1 truncate text-sm font-medium">
              {TRACKS[trackIndex].title}
            </p>

            <div className="mt-4 flex items-center justify-center gap-5">
              <button
                onClick={prevTrack}
                aria-label="Previous track"
                className="text-white/60 transition hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={nextTrack}
                aria-label="Next track"
                className="text-white/60 transition hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/40"
              >
                <path d="M11 5 6 9H2v6h4l5 4z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-violet-400"
                aria-label="Volume"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            aria-label="Toggle music panel"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/60 backdrop-blur-md transition hover:text-white"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
            className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition sm:h-12 sm:w-12 ${
              isPlaying
                ? "border-violet-400/50 bg-violet-500/20 text-white shadow-[0_0_20px_rgba(167,139,250,0.4)]"
                : "border-white/15 bg-black/70 text-white/80 hover:bg-black/90"
            }`}
          >
            {isPlaying ? (
              <div className="flex items-end gap-[3px]">
                <span className="h-3 w-[3px] animate-[pulse_0.8s_ease-in-out_infinite] rounded-full bg-white" />
                <span className="h-4 w-[3px] animate-[pulse_0.8s_ease-in-out_infinite_0.2s] rounded-full bg-white" />
                <span className="h-2 w-[3px] animate-[pulse_0.8s_ease-in-out_infinite_0.4s] rounded-full bg-white" />
              </div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
