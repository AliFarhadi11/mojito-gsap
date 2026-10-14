// true when the visitor has asked their OS for less motion; read when each animation is built
export const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
