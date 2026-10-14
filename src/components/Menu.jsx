import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { allCocktails } from "../../constants";
import { reduceMotion } from "../lib/motion";

const totalCocktails = allCocktails.length;

// backlight tint per drink, in allCocktails order
const glowColors = ["#f2a541", "#e8742a", "#ef6a4c", "#f59a3a"];

const pad = (n) => String(n).padStart(2, "0");

const Arrow = ({ flip }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d={flip ? "M5 12h14m-6-6 6 6-6 6" : "M19 12H5m6-6-6 6 6 6"} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Menu = () => {
  const sectionRef = useRef(null);
  const direction = useRef(0); // 1 = next, -1 = prev, 0 = first render
  const tabState = useRef(null); // tab underline position before the change, for Flip
  const slideTl = useRef(null);
  const swipeX = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // leaf parallax + idle float of the glass (paused while the section is off screen)
  useGSAP(
    () => {
      if (reduceMotion()) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
        .fromTo("#m-left-leaf", { y: 60 }, { y: -60, ease: "none" }, 0)
        .fromTo("#m-right-leaf", { y: -40 }, { y: 80, ease: "none" }, 0);

      gsap.to(".stage-float", {
        y: -12,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        scrollTrigger: {
          trigger: sectionRef.current,
          toggleActions: "play pause resume pause",
        },
      });
    },
    { scope: sectionRef },
  );

  // slide transition: every drink stays in the DOM, so the old glass swings out while the new one swings in
  useGSAP(
    () => {
      const section = sectionRef.current;
      const images = gsap.utils.toArray(".stage-img", section);
      const next = images[currentIndex];
      const dir = direction.current;

      if (!dir) {
        gsap.set(images, { transformOrigin: "50% 90%", autoAlpha: (i) => (i === currentIndex ? 1 : 0) });
        return;
      }

      // a click mid-slide picks up from wherever the images are right now
      slideTl.current?.kill();

      // reduced motion: a short cross-fade in place, no swinging or sliding
      if (reduceMotion()) {
        tabState.current = null;
        gsap.set(section, { "--glow": glowColors[currentIndex] });
        slideTl.current = gsap
          .timeline({ defaults: { duration: 0.3 } })
          .to(images.filter((img) => img !== next), { autoAlpha: 0 }, 0)
          .to(next, { autoAlpha: 1 }, 0);
        return;
      }

      if (tabState.current) {
        Flip.from(tabState.current, {
          targets: section.querySelector(".tab-indicator"),
          duration: 0.6,
          ease: "power3.inOut",
        });
        tabState.current = null;
      }

      slideTl.current = gsap
        .timeline()
        .to(
          images.filter((img) => img !== next),
          { xPercent: -dir * 35, rotate: -dir * 12, autoAlpha: 0, duration: 0.5, ease: "power2.in" },
          0,
        )
        .fromTo(
          next,
          { xPercent: dir * 35, rotate: dir * 12, scale: 0.9, autoAlpha: 0 },
          { xPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 1.1, ease: "expo.out" },
          0.2,
        )
        .to(section, { "--glow": glowColors[currentIndex], duration: 0.8, ease: "power1.inOut" }, 0)
        .fromTo(
          ".counter-current, .cocktail-name, .details-title, .details-text",
          { yPercent: 105 },
          { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 },
          0.25,
        );
    },
    { dependencies: [currentIndex], scope: sectionRef },
  );

  const goToSlide = (index, dir = index > currentIndex ? 1 : -1) => {
    const newIndex = (index + totalCocktails) % totalCocktails;
    if (newIndex === currentIndex) return;

    direction.current = dir;
    tabState.current = Flip.getState(sectionRef.current.querySelector(".tab-indicator"));
    setCurrentIndex(newIndex);
  };

  const step = (dir) => goToSlide(currentIndex + dir, dir);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  const onPointerDown = (e) => {
    swipeX.current = e.clientX;
  };

  const onPointerUp = (e) => {
    if (swipeX.current === null) return;
    const dx = e.clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  const currentCocktail = allCocktails[currentIndex];
  const prevCocktail = allCocktails[(currentIndex - 1 + totalCocktails) % totalCocktails];
  const nextCocktail = allCocktails[(currentIndex + 1) % totalCocktails];

  return (
    <section id="menu" ref={sectionRef} aria-labelledby="menu-heading" onKeyDown={onKeyDown}>
      <div className="noisy pointer-events-none" />
      <img src="/images/slider-left-leaf.webp" alt="" id="m-left-leaf" loading="lazy" />
      <img src="/images/slider-right-leaf.webp" alt="" id="m-right-leaf" loading="lazy" />

      <h2 id="menu-heading" className="sr-only">
        Cocktail Menu
      </h2>

      <nav className="cocktail-tabs" aria-label="Cocktail Navigation">
        {allCocktails.map((cocktail, index) => {
          const isActive = index === currentIndex;

          return (
            <button key={cocktail.id} type="button" aria-pressed={isActive} onClick={() => goToSlide(index)}>
              {cocktail.name}
              {isActive && <span className="tab-indicator" data-flip-id="tab-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="menu-body">
        <div className="info" aria-live="polite">
          <p>Recipe for:</p>
          <div className="clip">
            <span className="cocktail-name">{currentCocktail.name}</span>
          </div>
        </div>

        <div className="stage-col">
          <div className="stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <div className="stage-glow" />
            <div className="stage-float">
              {allCocktails.map((cocktail, index) => (
                <img
                  key={cocktail.id}
                  src={cocktail.image}
                  alt={index === currentIndex ? cocktail.name : ""}
                  aria-hidden={index !== currentIndex}
                  className="stage-img"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>

          <div className="menu-controls">
            <button type="button" aria-label={`Previous: ${prevCocktail.name}`} onClick={() => step(-1)}>
              <span className="arrow">
                <Arrow />
              </span>
              <span aria-hidden="true">{prevCocktail.name}</span>
            </button>

            <p className="counter" aria-hidden="true">
              <span className="clip inline-block align-bottom">
                <span className="counter-current inline-block text-white">{pad(currentIndex + 1)}</span>
              </span>{" "}
              / {pad(totalCocktails)}
            </p>

            <button type="button" aria-label={`Next: ${nextCocktail.name}`} onClick={() => step(1)}>
              <span aria-hidden="true">{nextCocktail.name}</span>
              <span className="arrow">
                <Arrow flip />
              </span>
            </button>
          </div>
        </div>

        <div className="details">
          <div className="clip">
            <h3 className="details-title">{currentCocktail.title}</h3>
          </div>
          <div className="clip">
            <p className="details-text">{currentCocktail.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Menu;
