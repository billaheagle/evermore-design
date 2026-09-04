/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}",
  ],
  theme: {
    // Defined directly (not under extend) and in ascending order: Tailwind
    // emits min-width media queries in config order, so this guarantees
    // xs < sm < md < lg < xl < 2xl in the generated CSS. Putting `xs` under
    // `extend` instead would append it *after* 2xl in the stylesheet, which
    // would let its rules wrongly win over sm/md/lg/xl at desktop widths
    // too (min-width: 400px also matches a 1920px screen).
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Redesign palette ("The Material Archive").
        bone: "#F4F1EA", // the paper the whole site is printed on
        noir: "#1A1712", // near-black ink
        stone: "#8C8A82", // cool grey for secondary text + hairlines
        clay: "#A85D3E", // the one accent — used sparingly, 2–3 marks a screen

        // Kept for the admin panel and the before/after slider.
        umber: "#17140F",
        parchment: "#EDE7D9",
        paper: "#F5F1E7",
        ink: "#17140F",
        copper: "#B36A43",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.22em",
        widest3: "0.34em",
      },
      transitionTimingFunction: {
        // The house easing — a long, expensive settle, not a bounce.
        archive: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "spin-slow": "spin 22s linear infinite",
        marquee: "marquee 32s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        "handle-invite": "handleInvite 2.2s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        handleInvite: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.1)" },
        },
      },
      boxShadow: {
        deep: "0 40px 100px -40px rgba(23,20,15,0.55)",
        soft: "0 20px 60px -25px rgba(23,20,15,0.35)",
        lift: "0 24px 48px -20px rgba(23,20,15,0.28)",
        chip: "0 8px 24px -8px rgba(23,20,15,0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
        "6xl": "3.5rem",
      },
    },
  },
  plugins: [],
};
