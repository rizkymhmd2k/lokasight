"use client";

import { useEffect, useRef } from "react";

function Wordmark() {
  const stageRef = useRef(null);
  const curRef = useRef({ x: 8, y: 0 });
  const tgtRef = useRef({ x: 8, y: 0 });
  const lastMoveRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;

    const onPointerMove = (e) => {
      lastMoveRef.current = Date.now();
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tgtRef.current.x = ny * -5;
      tgtRef.current.y = nx * 7;
    };

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const idle = Date.now() - lastMoveRef.current > 2000;
      if (idle) {
        tgtRef.current.x = 8;
        tgtRef.current.y = 0;
      }
      curRef.current.x = lerp(curRef.current.x, tgtRef.current.x, 0.06);
      curRef.current.y = lerp(curRef.current.y, tgtRef.current.y, 0.06);
      if (stageRef.current) {
        stageRef.current.style.transform = `rotateX(${curRef.current.x}deg) rotateY(${curRef.current.y}deg)`;
      }
    };

    document.addEventListener("pointermove", onPointerMove);
    tick();

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const DEPTH_LAYERS = 15;
  const layers = Array.from({ length: DEPTH_LAYERS }, (_, i) => {
    const z = -(i + 1) * 2;
    const darkness = Math.max(4, 26 - i);
    const hex = darkness.toString(16).padStart(2, "0");
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
              }}
            >
              formrizk
            </div>
          ))}

          {/* Top face — glossy black with specular sheen */}
          <div style={styles.faceTop}>formrizk</div>
        </div>
      </div>
    </div>
  );
}

const baseText = {
  fontFamily: "'Arial Black', 'Helvetica Neue', Impact, sans-serif",
  fontSize: "clamp(110px, 21vw, 480px)", // bigger
  fontWeight: 700,
  letterSpacing: "-0.05em",
  lineHeight: 1,
  whiteSpace: "nowrap",
  userSelect: "none",
};

const styles = {
  scene: {
    perspective: "900px",
    perspectiveOrigin: "50% 50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    transformStyle: "preserve-3d",
    willChange: "transform",
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
      160deg,
      #3a3a3a 0%,
      #1a1a1a 18%,
      #0a0a0a 40%,
      #1c1c1c 62%,
      #080808 80%,
      #2a2a2a 100%
    )`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    filter: "drop-shadow(0 -1px 0px rgba(255,255,255,0.18))",
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
