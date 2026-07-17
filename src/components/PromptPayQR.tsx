// src/components/PromptPayQR.tsx
"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function PromptPayQR() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(
    null
  );

  // Reset the view every time the modal opens.
  useEffect(() => {
    if (isZoomed) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      pointers.current.clear();
      pinchStart.current = null;
      dragStart.current = null;
    }
  }, [isZoomed]);

  function clampScale(next: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
  }

  function zoomIn() {
    setScale((s) => clampScale(s + 0.5));
  }

  function zoomOut() {
    setScale((s) => {
      const next = clampScale(s - 0.5);
      if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }

  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }

  function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [p1, p2] = Array.from(pointers.current.values());
      pinchStart.current = { distance: distanceBetween(p1, p2), scale };
      dragStart.current = null;
    } else if (pointers.current.size === 1 && scale > 1) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        tx: translate.x,
        ty: translate.y,
      };
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [p1, p2] = Array.from(pointers.current.values());
      const currentDistance = distanceBetween(p1, p2);
      const ratio = currentDistance / pinchStart.current.distance;
      setScale(clampScale(pinchStart.current.scale * ratio));
    } else if (pointers.current.size === 1 && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTranslate({
        x: dragStart.current.tx + dx,
        y: dragStart.current.ty + dy,
      });
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragStart.current = null;
  }

  function handleDoubleClick() {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white p-2 transition-transform duration-200 hover:scale-105"
        aria-label="Enlarge PromptPay QR code"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/promptpay-qr.png"
          alt="PromptPay QR code"
          className="h-auto w-[200px]"
        />
      </button>
      <p className="mt-2 text-xs text-white/40">Tap to enlarge</p>

      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] flex touch-none flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomed(false);
          }}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            &#10005;
          </button>

          <div
            className="flex h-[75vh] w-full max-w-[90vw] items-center justify-center overflow-hidden"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: scale > 1 ? "grab" : "zoom-in", touchAction: "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/promptpay-qr.png"
              alt="PromptPay QR code, enlarged"
              draggable={false}
              className="max-h-[75vh] w-auto max-w-[90vw] select-none rounded-2xl"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transition: pinchStart.current || dragStart.current ? "none" : "transform 0.15s ease-out",
              }}
            />
          </div>

          {/* Zoom controls */}
          <div className="mt-4 flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition hover:bg-white/10 disabled:opacity-30"
              aria-label="Zoom out"
            >
              &minus;
            </button>
            <span className="w-12 text-center text-sm text-white/70">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition hover:bg-white/10 disabled:opacity-30"
              aria-label="Zoom in"
            >
              &#43;
            </button>
            <span className="mx-1 h-5 w-px bg-white/15" />
            <button
              type="button"
              onClick={resetZoom}
              className="rounded-full px-3 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Reset
            </button>
          </div>
          <p className="mt-3 text-xs text-white/30">
            Scroll or pinch to zoom &middot; Drag to pan &middot; Double-tap to
            toggle
          </p>
        </div>
      )}
    </>
  );
}
