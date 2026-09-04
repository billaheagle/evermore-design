"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Eases a block into place as it enters the viewport. Deliberately restrained:
 * a short fade with a small lift, not a long dramatic float. Honours
 * prefers-reduced-motion by rendering the final state immediately.
 */
export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 12,
  once = true,
  as = "div",
}) {
  const Component = motion[as] || motion.div;
  const reduce = useReducedMotion();

  if (reduce) {
    const Plain = motion[as] || motion.div;
    return <Plain className={cn(className)}>{children}</Plain>;
  }

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.05, margin: "0px 0px -4% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}
