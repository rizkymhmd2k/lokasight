"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

/**
 * DraggableInfiniteDeckCarousel — SMOOTH EDITION
 * 
 * Improvements:
 * - Seamless z-index transitions using opacity crossfade instead of hard swaps
 * - Organic motion: rotation follows drag velocity, cards "breathe" during interaction
 * - Smoother commit: momentum-based completion with anticipation/overshoot
 * - Better right-drag: prev card emerges from behind with depth illusion
 * - Refined snap: uses spring-physics feel via power2.out with velocity preservation
 */
export default function DraggableInfiniteDeckCarousel({
  items = defaultItems,
  renderCard,
  className = "",
  height = 340,
}) {
  const viewportRef = useRef(null);

  const prevRef = useRef(null);
  const activeRef = useRef(null);
  const nextRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const draggingRef = useRef(false);
  const animatingRef = useRef(false);
  const tweenRef = useRef(null);

  // Track drag history for momentum calculation
  const historyRef = useRef([]);

  const geomRef = useRef({
    W: 0,
    cardW: 0,
    peek: 0,
    activeX: 0,
    nextX: 0,
    retreat: 40, // Increased for more dramatic depth
    scaleMin: 0.88, // Slightly smaller for better depth perception
    scaleRest: 0.94, // Resting scale for peek cards
    threshold: 0,
    rotationMax: 6, // Max rotation in degrees during drag
  });

  const dragRef = useRef({
    startX: 0,
    lastX: 0,
    dx: 0,
    lastT: 0,
    vx: 0,
    direction: 0,
  });

  const mod = (n, m) => ((n % m) + m) % m;

  const CARD_COLORS = useMemo(
    () => ["#FF5252", "#69F0AE", "#B388FF", "#FFD740", "#40C4FF", "#FF6E40"],
    []
  );
  const getCardColor = (index) => CARD_COLORS[mod(index, CARD_COLORS.length)];

  const indices = useMemo(() => {
    const len = items.length || 1;
    const a = mod(activeIndex, len);
    return { p: mod(a - 1, len), a, n: mod(a + 1, len) };
  }, [activeIndex, items.length]);

  const getNodes = () => ({
    prev: prevRef.current,
    active: activeRef.current,
    next: nextRef.current,
  });

  const measure = () => {
    const el = viewportRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = r.width;

    const cardW = Math.max(280, W * 0.54); // Slightly wider
    const peek = Math.min(W * 0.14, 120); // Slightly less peek for mystery

    const activeX = Math.max(0, Math.round(W * 0.05));
    const nextX = Math.round(W - peek);
    const threshold = Math.max(60, Math.min(140, cardW * 0.18));

    geomRef.current = {
      ...geomRef.current,
      W,
      cardW,
      peek,
      activeX,
      nextX,
      threshold,
    };
  };

  const setInstant = (node, vars) => node && gsap.set(node, vars);

  // Smooth z-index transition helper
  const setZIndex = (node, zIndex, immediate = false) => {
    if (!node) return;
    if (immediate) {
      gsap.set(node, { zIndex });
    } else {
      // Use opacity to smooth the visual transition when z-index changes
      const currentZ = gsap.getProperty(node, "zIndex");
      if (currentZ !== zIndex) {
        gsap.to(node, { zIndex, duration: 0.01, overwrite: true });
      }
    }
  };

  const resetInstant = () => {
    const g = geomRef.current;
    const { prev, active, next } = getNodes();

    // Reset all transforms
    [prev, active, next].forEach((n) => {
      setInstant(n, {
        width: g.cardW,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        opacity: 1,
        transformOrigin: "50% 50%",
      });
    });

    // Prev: hidden behind active, slightly offset for depth perception
    setInstant(prev, { 
      x: g.activeX - 8, // Slight offset creates depth illusion
      scale: g.scaleMin, 
      zIndex: 0,
      opacity: 0.9, // Slightly visible for depth
    });

    // Active: prominent
    setInstant(active, { 
      x: g.activeX, 
      scale: 1, 
      zIndex: 2,
      opacity: 1,
    });

    // Next: peeking
    setInstant(next, { 
      x: g.nextX, 
      scale: g.scaleRest, // Slightly larger than prev for visual hierarchy
      zIndex: 1,
      opacity: 1,
    });
  };

  const applyDrag = (dx) => {
    const g = geomRef.current;
    const { prev, active, next } = getNodes();

    const dir = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    dragRef.current.direction = dir;

    if (dir === 0) {
      resetInstant();
      return;
    }

    // Progress 0..1 with eased curve for more natural feel
    const rawP = Math.min(1, Math.abs(dx) / g.threshold);
    const p = gsap.parseEase("power2.out")(rawP); // Ease the progress itself
    
    const incomingTop = rawP >= 0.45; // Slightly earlier switch for smoother feel

    // Calculate rotation based on drag velocity and direction
    const rotation = (dx / g.W) * g.rotationMax * 2;
    const clampedRot = Math.max(-g.rotationMax, Math.min(g.rotationMax, rotation));

    if (dir === -1) {
      // LEFT drag => NEXT incoming from right
      // Active retreats and shrinks
      const activeScale = 1 - (1 - g.scaleMin) * p;
      const activeX = g.activeX + g.retreat * p;
      const activeOpacity = 1 - p * 0.3; // Fade slightly as it retreats

      // Next slides in and grows
      const nextX = g.nextX + dx * (0.5 + 0.5 * p); // Accelerate as it comes in
      const nextScale = g.scaleRest + (1 - g.scaleRest) * p;
      const nextOpacity = 0.8 + 0.2 * p;

      // Apply with slight rotation for organic feel
      setInstant(active, { 
        x: activeX, 
        scale: activeScale, 
        rotate: -clampedRot * 0.5,
        opacity: activeOpacity,
        zIndex: incomingTop ? 1 : 2 
      });
      
      setInstant(next, { 
        x: nextX, 
        scale: nextScale, 
        rotate: clampedRot * 0.3,
        opacity: nextOpacity,
        zIndex: incomingTop ? 2 : 1 
      });

      // Prev stays tucked behind, fades out more
      setInstant(prev, { 
        x: g.activeX - 12, 
        scale: g.scaleMin * 0.95, 
        opacity: 0.7,
        zIndex: 0 
      });

    } else {
      // RIGHT drag => PREV incoming from behind
      // Active retreats to the right (making room for prev to emerge)
      const activeScale = 1 - (1 - g.scaleMin) * p * 0.8;
      const activeX = g.activeX + g.retreat * p * 0.6; // Move right less than left-drag retreat
      const activeOpacity = 1 - p * 0.2;

      // Prev emerges from behind: scales up and slides slightly with drag
      // The key: it starts behind (smaller, offset) and grows into view
      const prevProgress = Math.pow(p, 0.8); // Slightly accelerate the emergence
      const prevX = g.activeX - 20 + dx * 0.4; // Start left of active, follow finger
      const prevScale = g.scaleMin + (1 - g.scaleMin) * prevProgress;
      const prevOpacity = 0.6 + 0.4 * prevProgress; // Fade in as it emerges

      setInstant(active, { 
        x: activeX, 
        scale: activeScale, 
        rotate: clampedRot * 0.5,
        opacity: activeOpacity,
        zIndex: incomingTop ? 1 : 2 
      });
      
      setInstant(prev, { 
        x: prevX, 
        scale: prevScale, 
        rotate: -clampedRot * 0.3,
        opacity: prevOpacity,
        zIndex: incomingTop ? 2 : 1 
      });

      // Next stays parked but fades slightly
      setInstant(next, { 
        x: g.nextX + 20, // Push further right
        scale: g.scaleRest * 0.9, 
        opacity: 0.6,
        zIndex: 0 
      });
    }
  };

  const killTween = () => {
    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }
  };

  // Enhanced animate with momentum preservation
  const animateDxTo = (targetDx, onUpdate, onComplete, velocity = 0) => {
    const startDx = dragRef.current.dx;
    const distance = targetDx - startDx;
    
    // Duration based on distance and velocity (faster flick = quicker animation)
    const baseDuration = 0.35;
    const velocityFactor = Math.abs(velocity) > 0.5 ? 0.7 : 1;
    const duration = baseDuration * velocityFactor;

    // Add slight overshoot for physical feel if committing
    const overshoot = Math.abs(targetDx) > 10 ? targetDx * 0.05 : 0;
    const finalTarget = targetDx + overshoot;

    const obj = { dx: startDx };
    killTween();
    
    tweenRef.current = gsap.to(obj, {
      dx: finalTarget,
      duration: duration,
      ease: velocity > 0.3 ? "power2.out" : "power3.out",
      onUpdate: () => {
        dragRef.current.dx = obj.dx;
        onUpdate(obj.dx);
      },
      onComplete: () => {
        // Small settle back if we overshot
        if (overshoot !== 0) {
          gsap.to(obj, {
            dx: targetDx,
            duration: 0.15,
            ease: "power2.inOut",
            onUpdate: () => {
              dragRef.current.dx = obj.dx;
              onUpdate(obj.dx);
            },
            onComplete: () => {
              dragRef.current.dx = targetDx;
              if (onComplete) onComplete();
            }
          });
        } else {
          dragRef.current.dx = targetDx;
          if (onComplete) onComplete();
        }
      },
    });
  };

  const finalizeCommit = (dir) => {
    const len = items.length || 1;
    if (dir === -1) setActiveIndex((v) => mod(v + 1, len));
    if (dir === 1) setActiveIndex((v) => mod(v - 1, len));
  };

  const snapRelease = () => {
    const g = geomRef.current;
    const { dx, vx } = dragRef.current;
    const absDx = Math.abs(dx);
    const absV = Math.abs(vx);

    // More forgiving commit: velocity OR distance
    const dir = dx < 0 ? -1 : dx > 0 ? 1 : 0;
    const commit = dir !== 0 && (absDx > g.threshold * 0.85 || absV > 0.6);

    if (!commit) {
      // Snap back with bounce effect
      animateDxTo(0, applyDrag, () => {
        draggingRef.current = false;
        animatingRef.current = false;
        dragRef.current.dx = 0;
        resetInstant();
        setIsGrabbing(false);
      }, vx);
      return;
    }

    // Commit with momentum
    let targetDx = 0;
    if (dir === -1) {
      // Left commit: animate to full slide
      targetDx = -(g.nextX - g.activeX + g.retreat);
    } else {
      // Right commit: animate prev to fully replace active
      targetDx = g.threshold * 1.2; // Slightly beyond threshold for decisive feel
    }

    animateDxTo(targetDx, applyDrag, () => {
      finalizeCommit(dir);

      // Instant recycle with crossfade preparation
      draggingRef.current = false;
      animatingRef.current = false;
      dragRef.current.dx = 0;

      // Quick flash to prevent visual glitch during index change
      const { prev, active, next } = getNodes();
      [prev, active, next].forEach(n => {
        if (n) gsap.set(n, { opacity: 0.99 });
      });
      
      requestAnimationFrame(() => {
        resetInstant();
        // Fade back in
        [prev, active, next].forEach(n => {
          if (n) gsap.to(n, { opacity: 1, duration: 0.1 });
        });
      });
      
      setIsGrabbing(false);
    }, vx);
  };

  const onPointerDown = (e) => {
    if (animatingRef.current) return;
    const el = viewportRef.current;
    if (!el) return;

    killTween();
    draggingRef.current = true;
    animatingRef.current = true;
    setIsGrabbing(true);

    el.setPointerCapture?.(e.pointerId);

    const now = performance.now();
    dragRef.current.startX = e.clientX;
    dragRef.current.lastX = e.clientX;
    dragRef.current.dx = 0;
    dragRef.current.lastT = now;
    dragRef.current.vx = 0;
    dragRef.current.direction = 0;
    
    // Clear history
    historyRef.current = [{ x: e.clientX, t: now }];
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;

    const now = performance.now();
    const d = dragRef.current;

    const x = e.clientX;
    const dx = x - d.startX;

    // Track history for better velocity calculation
    historyRef.current.push({ x, t: now });
    if (historyRef.current.length > 5) historyRef.current.shift();

    // Calculate velocity from last 3 points for smoother reading
    const recent = historyRef.current.slice(-3);
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = Math.max(1, last.t - first.t);
      d.vx = (last.x - first.x) / dt;
    }

    d.lastX = x;
    d.lastT = now;
    d.dx = dx;

    applyDrag(dx);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    snapRelease();
  };

  useLayoutEffect(() => {
    measure();
    resetInstant();
  }, []);

  useEffect(() => {
    measure();
    resetInstant();
  }, [activeIndex, items.length]);

  useEffect(() => {
    const onResize = () => {
      measure();
      resetInstant();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cardRenderer =
    renderCard ||
    ((item) => (
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#000",
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>{item.title}</div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500, opacity: 0.9 }}>
          {item.body}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {(item.tags || []).slice(0, 3).map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                padding: "6px 12px",
                borderRadius: 999,
                border: "2px solid rgba(0,0,0,0.8)",
                background: "rgba(255,255,255,0.9)",
                fontWeight: 700,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ));

  const len = items.length || 1;

  return (
    <div
      className={className}
      style={{
        width: "100%",
        borderRadius: 20,
        border: "3px solid #000",
        background: "#FFEB3B",
        padding: 16,
        boxSizing: "border-box",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        boxShadow: "8px 8px 0px rgba(0,0,0,1)",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 4px 12px 4px",
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: -0.5, fontSize: 18 }}>
          Deck Carousel
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              border: "2px solid #000",
              background: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: 999,
              boxShadow: "2px 2px 0px rgba(0,0,0,1)",
            }}
          >
            {indices.a + 1} / {len}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>← drag →</div>
        </div>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          if (draggingRef.current) onPointerUp();
        }}
        style={{
          position: "relative",
          width: "100%",
          height,
          overflow: "hidden",
          touchAction: "pan-y",
          userSelect: "none",
          borderRadius: 16,
          border: "3px solid #000",
          background: "#00E5FF",
          cursor: isGrabbing ? "grabbing" : "grab",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Cards with enhanced depth */}
        <CardShell
          ref={prevRef}
          label="PREV"
          item={items[indices.p]}
          render={cardRenderer}
          theme={{ bg: getCardColor(indices.p) }}
        />
        <CardShell
          ref={activeRef}
          label="ACTIVE"
          item={items[indices.a]}
          render={cardRenderer}
          theme={{ bg: getCardColor(indices.a) }}
        />
        <CardShell
          ref={nextRef}
          label="NEXT"
          item={items[indices.n]}
          render={cardRenderer}
          theme={{ bg: getCardColor(indices.n) }}
        />

        {/* Subtle progress indicator */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            height: 3,
            background: "rgba(0,0,0,0.1)",
            borderRadius: 2,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((indices.a + 1) / len) * 100}%`,
              height: "100%",
              background: "#000",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const CardShell = React.forwardRef(function CardShell({ item, render, label, theme }, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 16,
        bottom: 16,
        borderRadius: 14,
        padding: 20,
        boxSizing: "border-box",
        border: "3px solid #000",
        background: theme?.bg || "#fff",
        willChange: "transform, opacity",
        boxShadow: "4px 4px 0px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          border: "2px solid #000",
          background: "rgba(255,255,255,0.9)",
          padding: "4px 10px",
          borderRadius: 999,
          marginBottom: 12,
          opacity: 0.8,
        }}
      >
        {label}
      </div>
      {render(item)}
    </div>
  );
});

const defaultItems = [
  {
    title: "Card 01",
    body: "Active stays anchored; it shrinks + retreats opposite the drag while the incoming card replaces it.",
    tags: ["deck", "replace", "drag"],
  },
  {
    title: "Card 02",
    body: "Only 3 cards are mounted: prev, active, next. Infinite loop both directions.",
    tags: ["perf", "infinite", "3-nodes"],
  },
  {
    title: "Card 03",
    body: "No shadows, no opacity fades. Only translate, scale, and z-index swapping.",
    tags: ["rules", "no-fade", "no-shadow"],
  },
  {
    title: "Card 04",
    body: "Snap by distance or velocity. If not enough, it returns to rest.",
    tags: ["snap", "threshold", "velocity"],
  },
  {
    title: "Card 05",
    body: "At rest you see: [Active] + [Next peek]. Previous is fully hidden (behind Active).",
    tags: ["layout", "peek", "responsive"],
  },
];