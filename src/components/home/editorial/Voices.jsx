import { useState, useRef } from "react";
const voices = [
  {
    quote: "They listened before they designed. That made all the difference.",
    detail:
      "The new identity feels distinctly Indonesian, without leaning on clichés.",
    name: "Nadine Prasetyo",
    role: "Brand Director · Sora Botanics, Jakarta",
  },
  {
    quote:
      "The process was clear, collaborative, and refreshingly free of theatre.",
    detail: "We launched with a brand our whole team could stand behind.",
    name: "Elliot Mercer",
    role: "Co-founder · Fieldnote Labs, London",
  },
  {
    quote:
      "They turned a complicated product into an experience people understood immediately.",
    detail: "Every choice felt thoughtful, useful, and true to us.",
    name: "Mei Lin Tan",
    role: "Product Lead · Northstar Health, Singapore",
  },
  {
    quote: "They made the whole process feel clear and fast.",
    detail: "We’re really happy with where we landed.",
    name: "Wendy",
    role: "Jakarta",
  },
];
export default function Voices() {
  const [active, setActive] = useState(0);
  const touch = useRef(null);
  const step = (direction) =>
    setActive((index) => (index + direction + voices.length) % voices.length);
  const voice = voices[active];
  return (
    <div
      className="ed-voices"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={(event) => {
        touch.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }}
      onTouchEnd={(event) => {
        if (!touch.current) return;
        const dx = event.changedTouches[0].clientX - touch.current.x,
          dy = event.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
          step(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="ed-voice-content" aria-live="polite" aria-atomic="true">
        <figure key={active}>
          <blockquote>
            <p>“{voice.quote}”</p>
            <p className="ed-quote-detail">{voice.detail}</p>
          </blockquote>
          <figcaption>
            <strong>{voice.name}</strong>
            <span>{voice.role}</span>
          </figcaption>
        </figure>
      </div>
      <div className="ed-voice-controls">
        <span>
          0{active + 1} <span className="ed-counter-rule" />{" "}
          {String(voices.length).padStart(2, "0")}
        </span>
        <div>
          <button onClick={() => step(-1)} aria-label="Previous testimonial">
            ←
          </button>
          <button onClick={() => step(1)} aria-label="Next testimonial">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
