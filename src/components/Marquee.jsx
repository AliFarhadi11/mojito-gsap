import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { allCocktails, cocktailLists, mockTailLists } from "../../constants";
import { reduceMotion } from "../lib/motion";

const rows = [
  { names: allCocktails.map((c) => c.name), dir: 1 },
  { names: [...cocktailLists, ...mockTailLists].map((c) => c.name), dir: -1, outline: true },
];

const PIXELS_PER_SECOND = 70;

// Two copies of each row sit side by side, so sliding the track by one copy loops seamlessly.
const Row = ({ names, dir, outline }) => (
  <div className={`marquee-row ${outline ? "is-outline" : ""}`} data-dir={dir}>
    <div className="marquee-track">
      {[0, 1].map((copy) => (
        <div key={copy} className="marquee-group">
          {names.map((name) => (
            <span key={name} className="marquee-item">
              {name}
              <i className="marquee-dot" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Marquee = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (reduceMotion()) return;

      const section = sectionRef.current;

      // the track holds two equal copies, so -50% is exactly one copy whatever the font metrics
      const loops = gsap.utils.toArray(".marquee-track", section).map((track) => {
        const dir = Number(track.parentElement.dataset.dir);
        const loop = gsap.fromTo(
          track,
          { xPercent: dir > 0 ? 0 : -50 },
          {
            xPercent: dir > 0 ? -50 : 0,
            duration: track.offsetWidth / 2 / PIXELS_PER_SECOND,
            ease: "none",
            repeat: -1,
          },
        );
        // start deep into the repeats so a negative timeScale (scrolling up) can run backwards
        return loop.totalTime(loop.duration() * 100).pause();
      });

      const tracks = gsap.utils.toArray(".marquee-track", section);
      const skew = gsap.quickTo(tracks, "skewX", { duration: 0.4, ease: "power3.out" });
      const settleSkew = gsap.delayedCall(0.15, () => skew(0)).pause();

      // scrolling pushes the rows faster in the scroll direction, then they ease back to cruising speed
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        // only run while on screen
        onToggle: (self) => loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause())),
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(velocity) / 400);

          loops.forEach((loop) =>
            gsap.to(loop, {
              timeScale: boost * self.direction,
              duration: 0.2,
              overwrite: true,
              onComplete: () => gsap.to(loop, { timeScale: self.direction, duration: 1.2, ease: "power2.out" }),
            }),
          );
          skew(gsap.utils.clamp(-8, 8, velocity / -300));
          settleSkew.restart(true);
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="marquee" ref={sectionRef} aria-hidden="true">
      {rows.map((row) => (
        <Row key={row.dir} {...row} />
      ))}
    </section>
  );
};

export default Marquee;
