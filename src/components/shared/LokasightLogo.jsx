"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import gsap from "gsap";

const LOGO_TEXT = "LOKASIGHT";
const SCRAMBLE_INTERVAL = 40;
const HOVER_SCRAMBLE_DURATION = 500;
const INTRO_SCRAMBLE_DELAY = 300;
const INTRO_TOTAL_FRAMES = 46;
const LETTER_X = 134;
const LETTER_Y = 143;
const ANTON_KA_SPACING = 6;
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

export default function LokasightLogo({ className = "", animation = "scramble" }) {
  const clipId = useId().replace(/:/g, "");
  const svgRef = useRef();
  const slideContext = useRef();
  const [ready, setReady] = useState(false);
  const [viewBox, setViewBox] = useState("134 23.43 519.86 146.615");
  const [logoWidth, setLogoWidth] = useState(519.86);
  const [letters, setLetters] = useState(() => LOGO_TEXT.split(""));
  const [letterCenters, setLetterCenters] = useState([]);
  const [letterBounds, setLetterBounds] = useState([]);
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
    if (
      hoverPlayed.current[index] ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

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
        // Open the tight K–A pair without changing the following letter gaps.
        const offset = index >= 3 ? ANTON_KA_SPACING : 0;
        return box.x + box.width / 2 + offset;
      });

      setLetterCenters(nextCenters);
      const box = measureText.current.getBBox();
      // SVG bounds include unused font space; ink metrics fit the capitals.
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;
      context.font = '400 142px "Anton"';
      // Each animation window must contain its own glyph, including overhang.
      // Midpoints between letter centers cut wide letters beside narrow ones.
      setLetterBounds(LOGO_TEXT.split("").map((letter, index) => {
        const glyph = context.measureText(letter);
        const origin = nextCenters[index] - glyph.width / 2;
        const left = origin - glyph.actualBoundingBoxLeft - 1;
        const right = origin + glyph.actualBoundingBoxRight + 1;
        return { x: left, width: right - left };
      }));
      const metrics = context.measureText(LOGO_TEXT);
      const top = LETTER_Y - metrics.actualBoundingBoxAscent;
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const width = box.width + ANTON_KA_SPACING;
      setLogoWidth(width);
      setViewBox(`${box.x} ${top * 1.18} ${width} ${height * 1.18}`);
      setReady(true);
    };

    // Never measure or display fallback lettering while Anton is loading.
    document.fonts.load('400 142px "Anton"', LOGO_TEXT).then(measure).catch(() => {
      // Keep the name readable if the font request fails.
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || animation === "slide") return;

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
  }, [ready, animation]);

  useEffect(() => {
    if (!ready || animation !== "slide") return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const outgoing = svgRef.current.querySelectorAll("[data-outgoing]");
      const incoming = svgRef.current.querySelectorAll("[data-incoming]");
      const distance = (_, target) => Number(target.dataset.distance);
      const timeline = gsap.timeline({ delay: 0.4 });
      timeline.fromTo(outgoing, { x: 0 }, {
        x: (_, target) => -distance(_, target),
        duration: 1.2, ease: "expo.inOut", stagger: 0.05,
      }).fromTo(incoming, { x: distance }, {
        x: 0, duration: 0.9, ease: "expo.out", stagger: 0.04,
      }, 1);

      slideContext.current = gsap.context((context) => {
        context.add("hover", (group) => {
          const first = group.querySelector("[data-outgoing]");
          const second = group.querySelector("[data-incoming]");
          const width = Number(first.dataset.distance);
          gsap.killTweensOf([first, second]);
          gsap.timeline()
            .fromTo(first, { x: 0 }, {
              x: -width, duration: 0.8, ease: "expo.out",
            })
            .fromTo(second, { x: width }, {
              x: 0, duration: 0.8, ease: "expo.out",
            }, 0.18);
        });
      });
      return () => {
        slideContext.current?.revert();
        slideContext.current = null;
      };
    });
    return () => media.revert();
  }, [ready, animation]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      style={{ visibility: ready ? "visible" : "hidden" }}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Lokasight"
      className={`block h-auto w-full font-anton text-neutral-900 ${className}`}
    >
      <text
        ref={measureText}
        aria-hidden="true"
        x={LETTER_X}
        y={LETTER_Y}
        fill="currentColor"
        fontFamily="inherit"
        fontSize="142"
        fontWeight="400"
        opacity="0"
        pointerEvents="none"
        letterSpacing="-4.97"
        transform="scale(1 1.18)"
      >
        {LOGO_TEXT}
      </text>
      {letters.map((letter, index) => {
        const previousCenter = letterCenters[index - 1] ?? LETTER_X;
        const currentCenter = letterCenters[index] ?? LETTER_X + (index + 0.5) * logoWidth / LOGO_TEXT.length;
        const nextCenter = letterCenters[index + 1] ?? LETTER_X + logoWidth;
        const hitBoxX =
          index === 0 ? LETTER_X : previousCenter + (currentCenter - previousCenter) / 2;
        const hitBoxWidth =
          index === LOGO_TEXT.length - 1
            ? LETTER_X + logoWidth - hitBoxX
            : currentCenter + (nextCenter - currentCenter) / 2 - hitBoxX;

        const clip = letterBounds[index] ?? { x: hitBoxX, width: hitBoxWidth };

        return (
          <g
            key={`${LOGO_TEXT[index]}-${index}`}
            className="cursor-pointer select-none"
            onMouseEnter={(event) => {
              if (animation === "slide") {
                slideContext.current?.hover(event.currentTarget);
                return;
              }
              if (!introActive.current) startScramble(index);
            }}
            onMouseLeave={() => {
              if (animation !== "slide" && !introActive.current) stopScramble(index);
            }}
          >
            <rect
              x={hitBoxX}
              y="6"
              width={hitBoxWidth}
              height="176"
              fill="transparent"
            />
            {animation === "slide" ? (
              <>
                <defs>
                  <clipPath id={`${clipId}-${index}`}>
                    <rect x={clip.x} y="0" width={clip.width} height="200" />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${clipId}-${index})`} pointerEvents="none">
                  {[false, true].map((incoming) => (
                    <g
                      key={String(incoming)}
                      data-outgoing={incoming ? undefined : ""}
                      data-incoming={incoming ? "" : undefined}
                      data-distance={clip.width}
                      transform={incoming ? `translate(${clip.width} 0)` : undefined}
                    >
                      <text
                        x={currentCenter}
                        y={LETTER_Y}
                        textAnchor="middle"
                        fill="currentColor"
                        fontFamily="inherit"
                        fontSize="142"
                        fontWeight="400"
                        transform="scale(1 1.18)"
                      >
                        {LOGO_TEXT[index]}
                      </text>
                    </g>
                  ))}
                </g>
              </>
            ) : (
            <text
              x={currentCenter}
              y={LETTER_Y}
              textAnchor="middle"
              fill="currentColor"
              fontFamily="inherit"
              fontSize="142"
              fontWeight="400"
              transform="scale(1 1.18)"
            >
              {letter}
            </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
