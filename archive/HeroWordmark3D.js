"use client";

import { useEffect, useRef } from "react";

function Wordmark() {
  const stageRef = useRef(null);
  const curRef = useRef({ x: 8, y: 0 });
  const tgtRef = useRef({ x: 8, y: 0 });
  const lastMoveRef = useRef(0);
  const rafRef = useRef(null);
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;

    const onPointerMove = (e) => {
      lastMoveRef.current = Date.now();
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tgtRef.current.x = ny * -2;
      tgtRef.current.y = nx * 2;

      if (rafRef.current == null) {
        tick();
      }

      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }, 2000);
    };

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      curRef.current.x = lerp(curRef.current.x, tgtRef.current.x, 0.06);
      curRef.current.y = lerp(curRef.current.y, tgtRef.current.y, 0.06);
      if (stageRef.current) {
        stageRef.current.style.transform = `rotateX(${curRef.current.x}deg) rotateY(${curRef.current.y}deg)`;
      }
    };

    document.addEventListener("pointermove", onPointerMove);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  const DEPTH_LAYERS = 26;
  const layers = Array.from({ length: DEPTH_LAYERS }, (_, i) => {
    const z = -(i + 1) * 2.6;
    // Deeper extrusion + richer shading for a more dimensional side wall.
    const shade = Math.max(8, 42 - i * 1.6);
    const hex = shade.toString(16).padStart(2, "0");
    const color = `#${hex}${hex}${hex}`;
    return { z, color, key: i };
  });

  return (
    <div style={styles.scene}>
      <div ref={stageRef} style={styles.stage}>
        <div style={styles.text3d}>
          {/* Ground shadow */}
          {/* <div style={styles.shadow}>formrizk</div> */}

          {/* Extrusion depth layers — back to front */}
          {[...layers].reverse().map(({ z, color, key }) => (
            <div
              key={key}
              style={{
                ...styles.layer,
                transform: `translateZ(${z}px)`,
                color,
                textShadow:
                  "0 0 10px rgba(255,255,255,0.06), 0 10px 18px rgba(0,0,0,0.35)",
                opacity: 0.95,
              }}
            >
              formrizk
            </div>
          ))}

          {/* Outline pass — forces pure black edge */}
          <div style={styles.faceOutline}>formrizk</div>

          {/* Top face — glossy black with specular sheen */}
          <div style={styles.faceTop}>formrizk</div>
        </div>
      </div>
    </div>
  );
}

const baseText = {
  fontFamily: "'Arial Black', 'Helvetica Neue', Impact, sans-serif",
  fontSize: "clamp(110px, 22vw, 480px)", // bigger
  fontWeight: 700,
  letterSpacing: "-0.05em",
  lineHeight: 1,
  whiteSpace: "nowrap",
  userSelect: "none",
};

const styles = {
  scene: {
    perspective: "1100px",
    perspectiveOrigin: "50% 50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    transformStyle: "preserve-3d",
    willChange: "transform",
    filter: "drop-shadow(0 28px 60px rgba(0,0,0,0.35))",
  },
  text3d: {
    ...baseText,
    position: "relative",
    transformStyle: "preserve-3d",
  },
  layer: {
    ...baseText,
    position: "absolute",
    top: 0,
    left: 0,
  },
  faceTop: {
    ...baseText,
    position: "relative",
    color: "transparent",
    background: `linear-gradient(
      155deg,
      #4a4a4a 0%,
      #202020 22%,
      #0b0b0b 44%,
      #252525 66%,
      #0a0a0a 82%,
      #3b3b3b 100%
    )`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextStroke: "1px #000",
    filter:
      "drop-shadow(0 -1px 0px rgba(255,255,255,0.25)) drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
  },
  faceOutline: {
    ...baseText,
    position: "absolute",
    top: 0,
    left: 0,
    color: "#000",
    WebkitTextStroke: "2.5px #000",
    textShadow: "0 0 1px #000",
    transform: "translateZ(1.5px)",
    pointerEvents: "none",
  },
  // shadow: {
  //   ...baseText,
  //   position: 'absolute',
  //   top: '8%',
  //   left: 0,
  //   color: 'transparent',
  //   textShadow: '0 30px 60px rgba(0,0,0,0.35), 0 60px 100px rgba(0,0,0,0.2)',
  //   transform: 'translateZ(-32px) scaleY(0.18) translateY(200%)',
  //   transformOrigin: 'center bottom',
  //   filter: 'blur(8px)',
  //   opacity: 0.5,
  //   pointerEvents: 'none',
  // },
};

export default Wordmark;
