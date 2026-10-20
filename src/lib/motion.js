import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// true when the visitor has asked their OS for less motion; read when each animation is built
export const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Leaf parallax: every [data-speed] element inside `section` drifts while the section crosses
// the viewport. data-speed is the share of the viewport height it travels (negative = against
// the scroll, so it feels further away); data-rotate adds a slight sway in degrees.
export function parallax(section) {
  if (reduceMotion()) return;

  gsap.utils.toArray("[data-speed]", section).forEach((el) => {
    const speed = parseFloat(el.dataset.speed);
    const rotate = parseFloat(el.dataset.rotate || "0");

    gsap.fromTo(
      el,
      { y: () => (innerHeight * speed) / 2, rotate: -rotate },
      {
        y: () => (-innerHeight * speed) / 2,
        rotate,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

// Lenis eases wheel scrolling but keeps native scroll, so CSS sticky and ScrollTrigger pins
// still work. It runs on GSAP's ticker so scroll and animations update in the same frame.
export function smoothScroll() {
  if (reduceMotion()) return () => {};

  const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
  const tick = (time) => lenis.raf(time * 1000);

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
