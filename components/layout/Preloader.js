"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Once per browser, not once per tab — a returning visitor skips it.
    let seen = false;
    try {
      seen = localStorage.getItem("evermore-visited") === "1";
    } catch {}
    if (seen) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setProgress(100));
    const timer = setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem("evermore-visited", "1");
      } catch {}
    }, 1050);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col justify-between bg-bone px-6 py-6 text-noir md:px-[6vw] md:py-8"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between archive-label text-noir/50">
            <span>Evermore Design</span>
            <span>Catalogue No. 01</span>
          </div>

          <div className="mb-2 md:mb-4">
            <div className="h-px w-full bg-noir/15">
              <div
                className="h-full bg-clay transition-[width] duration-[1100ms] ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 font-display text-[13vw] font-light italic leading-none text-noir md:text-[8vw]">
              The Material Archive
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
