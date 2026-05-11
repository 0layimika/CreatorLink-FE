"use client";

import { useEffect, useRef, useState } from "react";
import { useProcessedBackground } from "@/hooks/useProcessedBackground";

interface ProcessedBackgroundProps {
  imageUrl?: string | null;
  fallbackColor?: string;
  textColor?: string;
  className?: string;
  children: React.ReactNode;
}

export function ProcessedBackground({
  imageUrl,
  fallbackColor,
  textColor,
  className,
  children,
}: ProcessedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const bgStyle = useProcessedBackground({
    imageUrl,
    width: size.width,
    height: size.height,
    fallbackColor,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        minHeight: "100vh",
        color: textColor,
        ...bgStyle,
      }}
    >
      {children}
    </div>
  );
}
