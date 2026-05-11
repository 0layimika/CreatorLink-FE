"use client";

import { useEffect, useRef, useState } from "react";

interface ProcessedBackgroundOptions {
  imageUrl?: string | null;
  width: number;
  height: number;
  fallbackColor?: string;
}

type BackgroundStyle = React.CSSProperties;

function clampDevicePixelRatio(dpr: number) {
  return Math.min(Math.max(dpr, 1), 2);
}

function roundSize(value: number) {
  return Math.max(1, Math.round(value));
}

export function useProcessedBackground({
  imageUrl,
  width,
  height,
  fallbackColor,
}: ProcessedBackgroundOptions) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fallbackToContain, setFallbackToContain] = useState(false);
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    if (!imageUrl || width <= 1 || height <= 1) {
      setDataUrl(null);
      setFallbackToContain(false);
      return;
    }

    const dpr = clampDevicePixelRatio(window.devicePixelRatio || 1);
    const w = roundSize(width * dpr);
    const h = roundSize(height * dpr);
    const key = `${imageUrl}|${w}x${h}`;

    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setFallbackToContain(true);
          return;
        }

        const coverScale = Math.max(w / img.width, h / img.height);
        const coverW = img.width * coverScale;
        const coverH = img.height * coverScale;
        const coverX = (w - coverW) / 2;
        const coverY = (h - coverH) / 2;

        ctx.filter = "blur(24px)";
        ctx.globalAlpha = 0;
        ctx.drawImage(img, coverX, coverY, coverW, coverH);

        const containScale = Math.min(w / img.width, h / img.height);
        const containW = img.width * containScale;
        const containH = img.height * containScale;
        const containX = (w - containW) / 2;
        const containY = (h - containH) / 2;

        ctx.filter = "none";
        ctx.globalAlpha = 1;
        ctx.drawImage(img, containX, containY, containW, containH);

        const url = canvas.toDataURL("image/jpeg", 0.9);
        setDataUrl(url);
        setFallbackToContain(false);
      } catch {
        setFallbackToContain(true);
      }
    };
    img.onerror = () => {
      if (cancelled) return;
      setFallbackToContain(true);
    };
    img.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl, width, height]);

  if (!imageUrl) {
    return {
      backgroundColor: fallbackColor,
    } as BackgroundStyle;
  }

  if (dataUrl) {
    return {
      backgroundImage: `url(${dataUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: fallbackColor,
    } as BackgroundStyle;
  }

  if (fallbackToContain) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: fallbackColor,
    } as BackgroundStyle;
  }

  return {
    backgroundColor: fallbackColor,
  } as BackgroundStyle;
}
