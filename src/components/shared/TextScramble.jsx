"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function TextScramble({ children, text: textProp, className = "" }) {
  const text = textProp ?? String(children);
  const frameRef = useRef();
  const elementRef = useRef(null);
  const [value, setValue] = useState(text);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setValue(text);
  }, [text]);

  const scramble = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    cancelAnimationFrame(frameRef.current);
    let frame = 0;
    const totalFrames = 39;
    const update = () => {
      const progress = frame / totalFrames;
      const revealed = Math.floor((1 - (1 - progress) ** 3) * text.length);
      setValue(
        [...text]
          .map((char, index) =>
            char === " " || index < revealed
              ? char
              : CHARS[Math.floor(Math.random() * CHARS.length)],
          )
          .join(""),
      );
      if (frame++ < totalFrames) frameRef.current = requestAnimationFrame(update);
      else setValue(text);
    };

    update();
  }, [text]);

  useEffect(() => {
    const link = elementRef.current?.closest("a");
    if (!link) return undefined;

    link.addEventListener("focus", scramble);
    link.addEventListener("blur", stop);
    return () => {
      link.removeEventListener("focus", scramble);
      link.removeEventListener("blur", stop);
      cancelAnimationFrame(frameRef.current);
    };
  }, [scramble, stop]);

  return (
    <span
      ref={elementRef}
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", position: "relative" }}
      onMouseEnter={scramble}
      onMouseLeave={stop}
    >
      <span style={{ visibility: "hidden" }}>{text}</span>
      <span style={{ position: "absolute", inset: 0 }}>{value}</span>
    </span>
  );
}
