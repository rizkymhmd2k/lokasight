import { useState } from "react";

export default function ProjectInquiry() {
  const [prepared, setPrepared] = useState(false);
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Project inquiry — ${data.get("company") || data.get("name")}`;
    const body = `Hi Lokasight,\n\n${data.get("project")}\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nBusiness: ${data.get("company") || "—"}\nInterested in: ${data.getAll("services").join(", ") || "Let's explore"}`;
    window.location.href = `mailto:hello@lokasight.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }
  return (
    <form
      className="ed-inquiry"
      onSubmit={handleSubmit}
      aria-label="Start a project with Lokasight"
    >
      <fieldset>
        <legend>I’m interested in</legend>
        <div className="ed-choices">
          {["Strategy", "Identity", "Digital"].map((service) => (
            <label key={service}>
              <input type="checkbox" name="services" value={service} />
              <span>
                {service} <b aria-hidden="true">↗</b>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="ed-form-pair">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            placeholder="Alex Smith"
          />
        </label>
        <label>
          Your email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="alex@company.com"
          />
        </label>
      </div>
      <label>
        Your business
        <input
          name="company"
          autoComplete="organization"
          placeholder="What are you building?"
        />
      </label>
      <label>
        A little about your project
        <textarea
          name="project"
          rows={3}
          required
          placeholder="The idea, the ambition, the what-if…"
        />
      </label>
      <button className="ed-dot-link ed-dot-link--button ed-submit" type="submit">
        Let’s start a conversation <span aria-hidden="true">↗</span>
      </button>
      <p className="ed-form-note" role="status">
        {prepared
          ? "Your email draft is ready in your mail app. Send it there to get in touch. If it didn’t open, email hello@lokasight.com."
          : "Opens your email app with your project details. Prefer a blank page?"}{" "}
        {!prepared && (
          <a href="mailto:hello@lokasight.com">Email us directly.</a>
        )}
      </p>
    </form>
  );
}
