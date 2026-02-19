'use client'
import React, { useEffect, useRef, useState } from "react";

const Testimony = () => {
  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Designer",
      quote:
        "This platform completely transformed how we collaborate. The intuitive interface made adoption instant across our entire team.",
      color: "#FF006E",
      textColor: "#FFFFFF",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      role: "Tech Lead",
      quote:
        "The API documentation is the best I've ever worked with. Integration took hours instead of days. Game changer for our startup.",
      color: "#FB5607",
      textColor: "#FFFFFF",
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      role: "Marketing Director",
      quote:
        "Our campaign performance increased 340% after switching. The analytics dashboard gives us insights we never had before.",
      color: "#8338EC",
      textColor: "#FFFFFF",
    },
    {
      id: 4,
      name: "David Park",
      role: "Founder & CEO",
      quote:
        "I've recommended this to every founder I know. It's rare to find a tool that scales from 10 to 10,000 users seamlessly.",
      color: "#06FFB4",
      textColor: "#1A1A2E",
    },
  ]);

  /**
   * Phases:
   * idle   -> normal stack
   * lift   -> top card flies up (front)
   * swap   -> reorder array; moving card is now last but kept "above + behind"
   * settle -> moving card transitions down into last stack position
   */
  const [phase, setPhase] = useState("idle"); // 'idle' | 'lift' | 'swap' | 'settle'
  const [movingId, setMovingId] = useState(null);

  const timersRef = useRef({ lift: null, settle: null });
  useEffect(() => {
    return () => {
      if (timersRef.current.lift) clearTimeout(timersRef.current.lift);
      if (timersRef.current.settle) clearTimeout(timersRef.current.settle);
    };
  }, []);

  // Tunables
  const LIFT_MS = 320;
  const SETTLE_MS = 420;

  const STACK_Y = 12; // px per depth
  const STACK_SCALE = 0.05; // scale loss per depth
  const LIFT_Y = -140; // % (relative to card height)
  const LIFT_SCALE = 0.92;
  const LIFT_ROT_X = 14; // deg
  const FRONT_Z = 140; // px (toward viewer)
  const BACK_Z = -220; // px (away from viewer)

  const isAnimating = phase !== "idle";
  const topCard = cards[0];

  const stackTransform = (index) => {
    const y = index * STACK_Y;
    const s = 1 - index * STACK_SCALE;
    // Keep opacity ALWAYS 1
    return `translate3d(0, ${y}px, 0) scale(${s})`;
  };

  const liftTransform = () => {
    // Fly upward + slightly toward viewer
    return `translate3d(0, ${LIFT_Y}%, ${FRONT_Z}px) scale(${LIFT_SCALE}) rotateX(${LIFT_ROT_X}deg)`;
  };

  const aboveBehindTransform = () => {
    // Same "in the air" pose, but pushed behind the stack in 3D space
    // (This is the key to "goes behind" reliably)
    return `translate3d(0, ${LIFT_Y}%, ${BACK_Z}px) scale(${LIFT_SCALE}) rotateX(${LIFT_ROT_X}deg)`;
  };

  const handleNext = () => {
    if (isAnimating) return;

    const id = topCard.id;
    setMovingId(id);
    setPhase("lift");

    timersRef.current.lift = setTimeout(() => {
      // Reorder at the peak
      setCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });

      // After reorder: keep the moving card "above + behind" for one paint
      setPhase("swap");

      // Next frame: let it transition down into the last position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("settle");

          timersRef.current.settle = setTimeout(() => {
            setPhase("idle");
            setMovingId(null);
          }, SETTLE_MS);
        });
      });
    }, LIFT_MS);
  };

  return (
    <div style={styles.container}>
      <div style={styles.stackContainer}>
        {cards.map((card, index) => {
          const isTop = index === 0;
          const isMoving = card.id === movingId;

          // zIndex: front card highest. After reorder, the moved card becomes last and naturally drops behind.
          // During lift, force it highest.
          const baseZ = 100 - index;
          const zIndex = isMoving && phase === "lift" ? 999 : baseZ;

          // Transform logic
          let transform = stackTransform(index);

          if (isMoving) {
            if (phase === "lift") {
              transform = liftTransform();
            } else if (phase === "swap") {
              // right after reorder, keep it above but behind (no transition on this step)
              transform = aboveBehindTransform();
            } else if (phase === "settle") {
              // now it transitions to its stack position (which is last)
              transform = stackTransform(index);
            }
          }

          // Transition rules
          // - lift phase: only moving card transitions into lift
          // - swap phase: moving card has transition NONE (so it doesn't animate from front->back weirdly)
          // - settle phase: everything transitions to their new stack positions
          let transition = `transform ${SETTLE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          if (isMoving && phase === "lift") {
            transition = `transform ${LIFT_MS}ms cubic-bezier(0.2, 0.9, 0.2, 1)`;
          }
          if (isMoving && phase === "swap") {
            transition = "none";
          }

          return (
            <div
              key={card.id}
              onClick={!isAnimating && isTop ? handleNext : undefined}
              style={{
                ...styles.card,
                backgroundColor: card.color,
                color: card.textColor,
                transform,
                transition,
                zIndex,
                opacity: 1, // ALWAYS 1 (no fade)
                cursor: !isAnimating && isTop ? "pointer" : "default",
                pointerEvents: isTop && !isAnimating ? "auto" : "none",
                willChange: "transform",
                transformStyle: "preserve-3d",
              }}
            >
              <div style={styles.content}>
                <p style={styles.quote}>"{card.quote}"</p>

                <div style={styles.author}>
                  <div
                    style={{
                      ...styles.avatar,
                      borderColor:
                        card.textColor === "#FFFFFF"
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(0,0,0,0.2)",
                      color: card.textColor,
                    }}
                  >
                    {card.name[0]}
                  </div>

                  <div style={styles.info}>
                    <h4 style={{ ...styles.name, color: card.textColor }}>
                      {card.name}
                    </h4>
                    <p style={{ ...styles.role, color: card.textColor, opacity: 0.8 }}>
                      {card.role}
                    </p>
                  </div>
                </div>
              </div>

              {isTop && !isAnimating && (
                <div style={{ ...styles.hint, color: card.textColor }}>
                  Click to see next ↑
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.instruction}>Click the front card to animate</div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0f",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "40px 20px",
    gap: "30px",
  },
  stackContainer: {
    position: "relative",
    width: "400px",
    height: "300px",
    perspective: "1200px",
  },
  card: {
    position: "absolute",
    inset: 0,
    borderRadius: "28px",
    padding: "36px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "3px solid rgba(255,255,255,0.15)",
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    height: "100%",
    justifyContent: "space-between",
  },
  quote: {
    fontSize: "19px",
    lineHeight: "1.6",
    fontWeight: "600",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  author: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    border: "2px solid",
    flexShrink: 0,
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  name: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
  },
  role: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "500",
  },
  hint: {
    position: "absolute",
    bottom: "20px",
    right: "24px",
    fontSize: "13px",
    opacity: 0.6,
    fontWeight: "700",
    letterSpacing: "0.02em",
  },
  instruction: {
    color: "#666",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
};

export default Testimony;