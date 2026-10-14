import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { featureLists, goodLists } from "../../constants/index.js";

const CheckList = ({ items, side }) => (
  <ul className={`art-list is-${side}`}>
    {items.map((feature) => (
      <li key={feature}>
        <img src="/images/check.png" alt="" width="16" height="16" />
        <p>{feature}</p>
      </li>
    ))}
  </ul>
);

const Art = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // timeline units: intro fades (0-2), glass grows (1-6), photo + copy land (4-8), short hold
        gsap
          .timeline({
            defaults: { ease: "power1.inOut" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=220%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(".art-title", { yPercent: -40, opacity: 0, duration: 2 }, 0)
          .to(".art-list.is-left", { x: -60, opacity: 0, duration: 1.6 }, 0.2)
          .to(".art-list.is-right", { x: 60, opacity: 0, duration: 1.6 }, 0.2)
          .to(".art-glow", { opacity: 0, scale: 1.4, duration: 3 }, 1)
          // push through the glass: the silhouette grows while the photo zooms in slightly
          .to(
            ".art-masked",
            { maskSize: "auto 420%", maskPosition: "50% 50%", scale: 1.15, duration: 5, ease: "power2.in" },
            1,
          )
          // the silhouette never fully covers a tall screen, so the unmasked photo fades in and settles
          .fromTo(".art-full", { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 2.5 }, 4.5)
          .to(".art-shade", { opacity: 1, duration: 1.5 }, 5.5)
          .from(".art-copy > *", { opacity: 0, y: 40, duration: 1.2, stagger: 0.35, ease: "power2.out" }, 6)
          // hold the finished frame for a moment before the pin releases
          .to({}, { duration: 1 });
      });

      // reduced motion: no pin, just show the finished frame
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".art-title, .art-list, .art-glow, .art-masked", { opacity: 0 });
        gsap.set(".art-full, .art-shade", { opacity: 1 });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="art" ref={sectionRef} aria-labelledby="art-heading">
      <div className="art-glow" />
      <h2 className="art-title">The ART</h2>

      <div className="art-media">
        <img src="/images/under-img.webp" alt="" className="art-full" loading="lazy" decoding="async" />
        <img
          src="/images/under-img.webp"
          alt="A bartender pouring a cocktail"
          className="art-masked"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="noisy pointer-events-none" />
      <div className="art-shade" />

      <CheckList items={goodLists} side="left" />
      <CheckList items={featureLists} side="right" />

      <div className="art-copy">
        <h2 id="art-heading">Sip-Worthy Perfection</h2>
        <h3>Made with Craft, Poured with Passion</h3>
        <p>This isn’t just a drink. It’s a carefully crafted moment made just for you.</p>
      </div>
    </section>
  );
};
export default Art;
