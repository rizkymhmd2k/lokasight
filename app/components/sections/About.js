import React from "react";

const ICON_BTN =
  "inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/15 text-black/45 hover:text-black/70 hover:border-black/25 transition";

function SocialIcon({ href = "#", label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className={ICON_BTN}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

const socials = [
  {
    label: "Instagram",
    href: "#",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M17.3 6.9h.01"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14 3v10.2a3.8 3.8 0 1 1-3.1-3.7V7.6a7 7 0 1 0 6.9 7V9.3c.9.7 2 1.1 3.2 1.2V7.7c-2.1-.2-3.8-1.9-4-4H14Z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.3 9.2H3.8V20h2.5V9.2Z" fill="currentColor" opacity="0.9" />
        <path
          d="M5.05 7.9a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M10 9.2h2.4v1.5h.03c.34-.64 1.17-1.62 2.7-1.62 2.9 0 3.44 1.9 3.44 4.37V20h-2.5v-5.77c0-1.38-.03-3.15-1.92-3.15-1.92 0-2.22 1.5-2.22 3.05V20H10V9.2Z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18.8 3H21l-6.9 7.9L22 21h-6.2l-4.8-6.1L5.6 21H3.4l7.4-8.5L2 3h6.3l4.4 5.6L18.8 3Z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    ),
  },
];

const About = () => {
  return (
    <div className="bg-backgroundlight flex flex-row px-4 pt-25 pb-25">
      {/* LEFT */}
      <div className="w-4/5 flex    justify-center">
        <div className="bg-gray-300 w-4/5 h-[400px] rounded-3xl" />
      </div>

      {/* RIGHT */}
      <div className="w-full  pl-12 flex flex-col">
        <div className="shrink-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
            <span className="text-sm md:text-xl font-medium mr-2 md:mr-5">
              [about]
            </span>
            Hi, I’m Rizky. I help service and software businesses design and build
            memorable, optimised websites.
          </h1>
        </div>

        <div className="grid grid-cols-5 mt-10">
          <div className="col-start-3 col-span-2">
            <p className="md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et
              lectus rutrum, fringilla lorem et, pulvinar erat. Donec ante arcu,
              ullamcorper non interdum et, bibendum eu quam.
            </p>

            <p className="md:text-lg mt-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et
              lectus rutrum, fringilla lorem et, pulvinar erat. socmed below
            </p>

            <div className="mt-6 flex gap-6">
              {socials.map((s) => (
                <SocialIcon key={s.label} href={s.href} label={s.label}>
                  {s.svg}
                </SocialIcon>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
