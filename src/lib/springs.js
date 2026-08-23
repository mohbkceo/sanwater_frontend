// Shared spring presets — see apple-design-skill.md.
//
// House style: critically damped (bounce 0) everywhere by default; bounce
// is reserved for interactions a gesture actually drove (drag release,
// flick), never for things that just appeared on screen.
//
// Framer Motion's {type:'spring', bounce, duration} API maps directly to
// Apple's damping/response pair (bounce ~ inverse of damping, duration ~
// response), so these read straight off the skill's concrete-values table.

export const SPRING_DEFAULT = { type: "spring", bounce: 0, duration: 0.4 };
export const SPRING_SNAPPY = { type: "spring", bounce: 0, duration: 0.3 };
export const SPRING_MOMENTUM = { type: "spring", bounce: 0.2, duration: 0.4 };
export const SPRING_DRAWER = { type: "spring", bounce: 0.18, duration: 0.35 };

// Fallback for prefers-reduced-motion: a short cross-fade, no movement —
// see apple-design-skill.md §14.
export const REDUCED_MOTION_TRANSITION = { duration: 0.15, ease: "linear" };

// Materialize: a glass/blur surface should arrive as a surface (blur+scale
// together), not just fade in — see apple-design-skill.md §12.
export const MATERIALIZE_VARIANTS = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.97, filter: "blur(6px)" },
};

// Sheet/drawer: slides from its anchored edge — reversible transitions
// mirror their own path in and out (§7).
export function sheetVariants(edge = "bottom") {
  const offscreen =
    edge === "bottom" ? { y: "100%" } :
    edge === "right" ? { x: "100%" } :
    edge === "left" ? { x: "-100%" } :
    { y: "-100%" };
  return {
    initial: { ...offscreen, opacity: 1 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { ...offscreen, opacity: 1 },
  };
}

export const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export const SCRIM_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
