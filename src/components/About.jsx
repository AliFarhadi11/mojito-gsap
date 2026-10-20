import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useRef, useState } from "react";
import { profileLists } from "../../constants";
import { reduceMotion } from "../lib/motion";

const images = [
  "/images/abt1.webp",
  "/images/abt2.webp",
  "/images/abt5.webp",
  "/images/abt3.webp",
  "/images/abt4.webp",
];

const About = () => {
  const containerRef = useRef(null);
  const [activeImage, setActiveImage] = useState(0); // Default first image active
  const flipState = useRef(null); // Ref to store the state before re-render

  // 1. Intro animations: the copy and the gallery each start when they reach the screen
  useGSAP(
    () => {
      if (reduceMotion()) return;

      const root = containerRef.current;
      const q = gsap.utils.selector(root);

      // mask clips each word so it rises out of its own line. autoSplit rebuilds this timeline when
      // fonts load, and that rebuild runs outside this scope, so it must use elements, not selectors
      SplitText.create(q("h2"), {
        type: "words",
        mask: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap
            .timeline({ scrollTrigger: { trigger: q(".content")[0], start: "top 80%" } })
            .from(self.words, { yPercent: 100, duration: 1, ease: "expo.out", stagger: 0.02 })
            .from(
              q(".badge, .sub-content > *, .avatars img"),
              { opacity: 0, y: 20, duration: 0.8, ease: "power2.out", stagger: 0.06 },
              "-=0.8",
            ),
      });

      // each photo wipes up into its card while settling from a slight zoom
      gsap
        .timeline({ scrollTrigger: { trigger: q(".gallery")[0], start: "top 85%" } })
        .from(q(".gallery-item"), {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.08,
          clearProps: "clipPath",
        })
        .from(
          q(".gallery-item img"),
          { scale: 1.3, duration: 1.4, ease: "power3.out", stagger: 0.08, clearProps: "transform" },
          0,
        );
    },
    { scope: containerRef },
  );

  // 2. FLIP Animation (runs when activeImage changes)
  useGSAP(
    () => {
      // Only run if we have a captured state to animate from (reduced motion: just let the grid change)
      if (!flipState.current || reduceMotion()) return;

      // a click mid-flip captures the in-between state and Flip kills the old run
      Flip.from(flipState.current, {
        targets: ".gallery-item",
        duration: 0.7,
        ease: "power3.inOut",
        absolute: true, // Crucial for smooth grid animations
        zIndex: 10, // Ensure moving item is on top
      });
    },
    { dependencies: [activeImage], scope: containerRef },
  );

  const handleImageClick = (index) => {
    if (index === activeImage) return;

    // 1. Capture the current state of the grid items
    flipState.current = Flip.getState(gsap.utils.toArray(".gallery-item", containerRef.current));

    // 2. Update state (this triggers a React re-render)
    setActiveImage(index);
  };

  return (
    <div id="about" ref={containerRef}>
      <div className="mb-16 md:px-0 px-5">
        <div className="content">
          <div className="lg:col-span-8">
            <p className="badge">Best Cocktails</p>
            <h2>
              Where every detail matters <span className="text-white">-</span>
              from muddle to garnish
            </h2>
          </div>

          <div className="sub-content">
            <p>
              Every cocktail we serve is a reflection of our obsession with detail - from the first muddle to the
              final garnish. That care is what turns a simple drink into something truly memorable
            </p>

            <div className="rating">
              <div className="space-y-1">
                <p className="score">
                  <span>4.5</span>/5
                </p>
                <p className="text-sm text-white-100">More than +12000 customers</p>
              </div>

              <div className="avatars">
                {profileLists.map(({ imgPath }) => (
                  <img key={imgPath} src={imgPath} alt="" width="46" height="46" loading="lazy" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery">
        {images.map((src, index) => {
          const isActive = index === activeImage;

          return (
            <button
              key={src}
              type="button"
              onClick={() => handleImageClick(index)}
              aria-label={`Show cocktail photo ${index + 1}`}
              aria-pressed={isActive}
              className={`gallery-item ${isActive ? "is-active col-span-8" : "col-span-1"}`}>
              <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default About;
