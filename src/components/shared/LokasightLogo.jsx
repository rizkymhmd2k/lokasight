"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const LOGO_TEXT = "LOKASIGHT";
const SCRAMBLE_INTERVAL = 40;
const HOVER_SCRAMBLE_DURATION = 500;
const INTRO_SCRAMBLE_DELAY = 300;
const INTRO_TOTAL_FRAMES = 46;
const LETTER_X = 134;
const LETTER_Y = 143;
const LOGO_WIDTH = 734;
const LETTER_WIDTH = LOGO_WIDTH / LOGO_TEXT.length;
const DEFAULT_LETTER_CENTERS = LOGO_TEXT.split("").map(
  (_, index) => LETTER_X + index * LETTER_WIDTH + LETTER_WIDTH / 2,
);
const SCRAMBLE_CHARS = {
  I: ["!", "1", "|", "/", ":", ";", "l", "i", "j", "t", "+", "=", "~", "'", "`", "^", "7", "T", "Y", "*"],
  O: ["0", "Q", "@", "C", "D", "*", "G", "U", "o", "q", "8", "6", "9", "#", "%", "&", "(", "[", "{", "<"],
  A: ["4", "@", "^", "V", "Y", "/", "Λ", "∆", "A", "R", "M", "W", "X", "*", "+", "<", ">", "7", "?", "&"],
  S: ["5", "$", "Z", "2", "8", "&", "s", "z", "3", "6", "9", "~", "%", "?", "C", "G", "@", "#", "*", "="],
  G: ["6", "9", "&", "C", "Q", "@", "G", "O", "D", "0", "8", "#", "%", "S", "5", "[", "]", "{", "}", "*"],
  T: ["7", "+", "Y", "I", "|", "!", "t", "1", "L", "F", "r", "^", "=", "-", "~", "/", "\\", "*", "#", "?"],
  L: ["1", "|", "/", "!", "7", "_", "l", "i", "J", "r", "t", "+", "=", "-", "~", "\\", "<", ">", "*", ":"],
  K: ["<", "X", "*", ">", "/", "\\", "K", "k", "Y", "V", "N", "R", "%", "#", "&", "+", "=", "^", "?", "{"],
  H: ["#", "N", "M", "A", "K", "X", "H", "h", "W", "B", "E", "R", "*", "+", "=", "|", "!", "%", "&", "]"],
};
const INTRO_SCRAMBLE_CHARS = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."0123456789",
  ..."!@#$%^&*+-=<>?/\\|~;:[]{}()",
];

export default function LokasightLogo({ className = "" }) {
  const [letters, setLetters] = useState(() => LOGO_TEXT.split(""));
  const [letterCenters, setLetterCenters] = useState(DEFAULT_LETTER_CENTERS);
  const measureText = useRef();
  const hoverFrames = useRef({});
  const hoverPlayed = useRef({});
  const introFrame = useRef();
  const introActive = useRef(false);

  const setLetter = (index, letter) => {
    setLetters((current) =>
      current.map((currentLetter, letterIndex) =>
        letterIndex === index ? letter : currentLetter,
      ),
    );
  };

  const pickCharacter = (chars, previous) => {
    let character = previous;
    while (character === previous) {
      character = chars[Math.floor(Math.random() * chars.length)];
    }
    return character;
  };

  const startScramble = (index) => {
    if (hoverPlayed.current[index]) return;

    hoverPlayed.current[index] = true;
    const original = LOGO_TEXT[index];
    const chars = SCRAMBLE_CHARS[original] ?? ["!", "1", "?"];
    let previous = letters[index];
    const nextChar = () => (previous = pickCharacter(chars, previous));
    let startTime;
    let lastScrambleTime = -SCRAMBLE_INTERVAL;

    cancelAnimationFrame(hoverFrames.current[index]);

    const update = (time) => {
      startTime ??= time;
      const elapsed = time - startTime;

      if (elapsed >= HOVER_SCRAMBLE_DURATION) {
        setLetter(index, original);
        delete hoverFrames.current[index];
        return;
      }

      const progress = elapsed / HOVER_SCRAMBLE_DURATION;
      const easedProgress = progress * progress * progress;
      const nextInterval = SCRAMBLE_INTERVAL + easedProgress * SCRAMBLE_INTERVAL * 2;

      if (time - lastScrambleTime >= nextInterval) {
        setLetter(index, nextChar());
        lastScrambleTime = time;
      }

      hoverFrames.current[index] = requestAnimationFrame(update);
    };

    setLetter(index, nextChar());
    hoverFrames.current[index] = requestAnimationFrame(update);
  };

  const stopScramble = (index) => {
    hoverPlayed.current[index] = false;
    cancelAnimationFrame(hoverFrames.current[index]);
    delete hoverFrames.current[index];
    setLetter(index, LOGO_TEXT[index]);
  };

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (!measureText.current || cancelled) return;

      const nextCenters = LOGO_TEXT.split("").map((_, index) => {
        const box = measureText.current.getExtentOfChar(index);
        return box.x + box.width / 2;
      });

      setLetterCenters(nextCenters);
    };

    measure();
    document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!prefersReducedMotion) {
      introActive.current = true;
      let frame = 0;
      let startTime;
      let lastScrambleTime = -SCRAMBLE_INTERVAL;
      let scrambledLetters = LOGO_TEXT.split("");

      const update = (time) => {
        startTime ??= time;
        const isScramblingOnly = time - startTime < INTRO_SCRAMBLE_DELAY;
        const revealed = Math.floor(
          (frame / INTRO_TOTAL_FRAMES) * LOGO_TEXT.length,
        );

        if (time - lastScrambleTime >= SCRAMBLE_INTERVAL) {
          scrambledLetters = LOGO_TEXT.split("").map(
            () =>
              INTRO_SCRAMBLE_CHARS[
                Math.floor(Math.random() * INTRO_SCRAMBLE_CHARS.length)
              ],
          );
          lastScrambleTime = time;
        }

        setLetters(
          LOGO_TEXT.split("").map((letter, index) =>
            index < revealed ? letter : scrambledLetters[index],
          ),
        );

        if (!isScramblingOnly) frame += 1;

        if (isScramblingOnly || frame <= INTRO_TOTAL_FRAMES) {
          introFrame.current = requestAnimationFrame(update);
        } else {
          setLetters(LOGO_TEXT.split(""));
          introActive.current = false;
        }
      };

      introFrame.current = requestAnimationFrame(update);
    }

    return () => {
      Object.values(hoverFrames.current).forEach(cancelAnimationFrame);
      cancelAnimationFrame(introFrame.current);
      introActive.current = false;
    };
  }, []);

  return (
    <svg
      viewBox="134 6 734 176"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Lokasight"
      className={`block h-auto w-full font-oswald text-neutral-900 ${className}`}
    >
      <text
        ref={measureText}
        aria-hidden="true"
        x={LETTER_X}
        y={LETTER_Y}
        fill="currentColor"
        fontFamily="inherit"
        fontSize="142"
        fontWeight="500"
        opacity="0"
        pointerEvents="none"
        textLength={LOGO_WIDTH}
        lengthAdjust="spacing"
        transform="matrix(1 0 0 1.3 0 -28.6)"
      >
        {LOGO_TEXT}
      </text>
      {letters.map((letter, index) => {
        const previousCenter = letterCenters[index - 1] ?? LETTER_X;
        const currentCenter = letterCenters[index];
        const nextCenter = letterCenters[index + 1] ?? LETTER_X + LOGO_WIDTH;
        const hitBoxX =
          index === 0 ? LETTER_X : previousCenter + (currentCenter - previousCenter) / 2;
        const hitBoxWidth =
          index === LOGO_TEXT.length - 1
            ? LETTER_X + LOGO_WIDTH - hitBoxX
            : currentCenter + (nextCenter - currentCenter) / 2 - hitBoxX;

        return (
          <g
            key={`${LOGO_TEXT[index]}-${index}`}
            className="cursor-pointer select-none"
            onMouseEnter={() => {
              if (!introActive.current) startScramble(index);
            }}
            onMouseLeave={() => {
              if (!introActive.current) stopScramble(index);
            }}
          >
            <rect
              x={hitBoxX}
              y="6"
              width={hitBoxWidth}
              height="176"
              fill="transparent"
            />
            <text
              x={currentCenter}
              y={LETTER_Y}
              textAnchor="middle"
              fill="currentColor"
              fontFamily="inherit"
              fontSize="142"
              fontWeight="500"
              transform="matrix(1 0 0 1.3 0 -28.6)"
            >
              {letter}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
