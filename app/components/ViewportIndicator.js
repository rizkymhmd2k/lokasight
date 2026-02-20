"use client";

import { useEffect, useState } from "react";

function getBreakpointLabel(width) {
  if (width >= 1536) return "2xl";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "xs";
}

export default function ViewportIndicator() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  const breakpoint = getBreakpointLabel(size.width);

  return (
    <div className="fixed top-4 left-4 z-[9999] rounded-xl bg-black/85 px-3 py-2 text-xs font-mono text-white backdrop-blur">
      <div className="leading-none">{size.width} x {size.height}</div>
      <div className="mt-1 opacity-80">{breakpoint}</div>
    </div>
  );
}
