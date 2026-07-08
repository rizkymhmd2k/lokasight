"use client";

import { useEffect, useRef, useState } from "react";

const LOGO_TEXT = "LOKASIGHT";
const SCRAMBLE_INTERVAL = 90;
const LETTER_X = 134;
const LETTER_SLOTS = [74, 93, 87, 89, 83, 44, 95, 91, 78];
const SCRAMBLE_CHARS = {
  I: ["!", "1", "|", "/", ":", ";"],
  O: ["0", "Q", "@", "C", "D", "*"],
  A: ["4", "@", "^", "V", "Y", "/"],
  S: ["5", "$", "Z", "2", "8", "&"],
  G: ["6", "9", "&", "C", "Q", "@"],
  T: ["7", "+", "Y", "I", "|", "!"],
  L: ["1", "|", "/", "!", "7", "_"],
  K: ["<", "X", "*", ">", "/", "\\"],
  H: ["#", "N", "M", "A", "K", "X"],
};

export default function LokasightLogo({ className = "" }) {
  const [letters, setLetters] = useState(() => LOGO_TEXT.split(""));
  const intervals = useRef({});
  const timeouts = useRef({});

  useEffect(
    () => () => {
      Object.values(intervals.current).forEach(clearInterval);
      Object.values(timeouts.current).forEach(clearTimeout);
    },
    [],
  );

  const setLetter = (index, letter) => {
    setLetters((current) =>
      current.map((currentLetter, letterIndex) =>
        letterIndex === index ? letter : currentLetter,
      ),
    );
  };

  const startScramble = (index) => {
    clearInterval(intervals.current[index]);
    clearTimeout(timeouts.current[index]);
    const original = LOGO_TEXT[index];
    const chars = SCRAMBLE_CHARS[original] ?? ["!", "1", "?"];
    let frame = index;
    const nextChar = () => {
      frame += 1;
      return chars[frame % chars.length];
    };

    setLetter(index, nextChar());
    intervals.current[index] = setInterval(() => {
      setLetter(index, nextChar());
    }, SCRAMBLE_INTERVAL);
  };

  const stopScramble = (index) => {
    clearInterval(intervals.current[index]);
    delete intervals.current[index];
    clearTimeout(timeouts.current[index]);

    const original = LOGO_TEXT[index];
    const chars = SCRAMBLE_CHARS[original] ?? ["!", "1", "?"];
    const settleChar = chars[(index + 1) % chars.length];

    setLetter(index, settleChar);
    timeouts.current[index] = setTimeout(() => {
      setLetter(index, original);
      delete timeouts.current[index];
    }, SCRAMBLE_INTERVAL);
  };

  return (
    <svg
      viewBox="144 6 724 176"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Lokasight"
      className={`block h-auto w-full font-oswald text-black  ${className}`}
    >
      {letters.map((letter, index) => {
        const width = LETTER_SLOTS[index];
        const x =
          LETTER_X +
          LETTER_SLOTS.slice(0, index).reduce((sum, slot) => sum + slot, 0);

        return (
          <g
            key={`${LOGO_TEXT[index]}-${index}`}
            className="cursor-pointer select-none"
            onMouseEnter={() => startScramble(index)}
            onMouseLeave={() => stopScramble(index)}
          >
            <rect
              x={x}
              y="6"
              width={width}
              height="176"
              fill="transparent"
            />
            <text
              x={x + width / 2}
              y="143"
              textAnchor="middle"
              fill="currentColor"
              fontFamily="inherit"
              fontSize="142"
              fontWeight="700"
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
