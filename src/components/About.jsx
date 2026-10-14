import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useRef, useState } from "react";
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

  // 1. Intro Animation (runs once, when the section scrolls in)
  useGSAP(
    () => {
      if (reduceMotion()) return;

      // mask clips each word so it rises out of its own line instead of fading over others;
      // autoSplit rebuilds the timeline if the font loads after the first split
      SplitText.create("h2", {
        type: "words",
        mask: "words",
        autoSplit: true,
        onSplit: (self) => buildIntro(self.words),
      });

      function buildIntro(words) {
        return gsap
          .timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
            },
          })
          .from(words, {
            duration: 1,
            yPercent: 100,
            ease: "expo.out",
            stagger: 0.02,
          })
          .from(
            ".badge, .sub-content > *",
            {
              opacity: 0,
              y: 20,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.08,
            },
            "-=0.6",
          )
          .from(
            ".gallery-item",
            {
              opacity: 0,
              y: 40,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.06,
            },
            "-=0.5",
          );
      }
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
          <div className="md:col-span-8">
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

            <div>
              <p className="md:text-3xl text-xl font-bold">
                <span>4.5</span>/5
              </p>
              <p className="text-sm text-white-100">More than +12000 customers</p>
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
              <div className="noisy" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default About;
