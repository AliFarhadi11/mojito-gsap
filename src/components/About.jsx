import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip, SplitText, ScrollTrigger } from "gsap/all";
import { useRef, useState } from "react";

gsap.registerPlugin(Flip, SplitText, ScrollTrigger);

const images = [
  "/images/abt1.png",
  "/images/abt2.png",
  "/images/abt5.png",
  "/images/abt3.png",
  "/images/abt4.png",
];

const About = () => {
  const containerRef = useRef(null);
  const [activeImage, setActiveImage] = useState(0); // Default first image active
  const flipState = useRef(null); // Ref to store the state before re-render

  // 1. Intro Animation (runs once on mount)
  useGSAP(
    () => {
      const titleSplit = new SplitText("#about h2", { type: "words" });

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top center",
        },
      });

      scrollTimeline
        .from(titleSplit.words, {
          
          duration: 1,
          yPercent: 100,
          ease: "expo.out",
          stagger: 0.02,
        })
        .from(
          ".content div, .gallery-item", // Updated selector to match new class names
          {
            opacity: 0,
            duration: 1,
            ease: "power1.inOut",
            stagger: 0.04,
          },
          "-=0.5"
        );
    },
    { scope: containerRef }
  );

  // 2. FLIP Animation (runs when activeImage changes)
  useGSAP(() => {
    // Only run if we have a captured state to animate from
    if (!flipState.current) return;

    Flip.from(flipState.current, {
      targets: ".gallery-item",
      duration: 0.6,
      ease: "power2.inOut",
      absolute: true, // Crucial for smooth grid animations
      zIndex: 10, // Ensure moving item is on top
      onEnter: (elements) => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1 }),
      onLeave: (elements) => gsap.to(elements, { opacity: 0 }),
    });
  }, [activeImage]); // Dependency: runs every time activeImage updates

  const handleImageClick = (index) => {
    if (index === activeImage) return;

    // 1. Capture the current state of the grid items
    // (We use the scoped selector from containerRef to be safe)
    const items = gsap.utils.toArray(".gallery-item", containerRef.current);
    flipState.current = Flip.getState(items);

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
              Where every detail maters <span className="text-white">-</span>
              From muddle to garnish
            </h2>
          </div>

          <div className="sub-content">
            <p>
              Every cocktail we server is a reflection of our obsession with detail - from the first muddle to
              the final garnish. That care is what turns a simple drink into something truly memorable
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
      <div className="grid grid-cols-12 h-86 xl:h-[80vh] gap-3 group">
        {images.map((src, index) => (
          <div
            key={index}
            onClick={() => handleImageClick(index)}
            className={`gallery-item relative overflow-hidden rounded-xl cursor-pointer transition-colors 
              ${index === activeImage ? "col-span-8" : "col-span-1"}`}>
            <div className="noisy" />
            <img src={src} className="size-full object-cover object-top" alt={`grid-img-${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
