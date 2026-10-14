import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { cocktailLists, mockTailLists } from "../../constants";
import gsap from "gsap";
import { reduceMotion } from "../lib/motion";

const DrinkList = ({ title, className, items }) => (
  <div className={className}>
    <h2>{title}</h2>

    <ul>
      {items.map(({ name, country, detail, price }) => (
        <li key={name}>
          <div className="md:me-28">
            <h3>{name}</h3>
            <p>
              {country} | {detail}
            </p>
            <span>- {price}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const Cocktails = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (reduceMotion()) return;

      // both leaves drift in together over the whole section
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 30%",
            end: "bottom 80%",
            scrub: true,
          },
        })
        .from("#c-left-leaf", { x: -100, y: 100 }, 0)
        .from("#c-right-leaf", { x: 100, y: 100 }, 0);

      gsap.from(".list h2, .list li", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: ".list",
          start: "top 75%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="cocktails" ref={sectionRef} className="noisy">
      <img src="/images/cocktail-left-leaf.webp" alt="" id="c-left-leaf" loading="lazy" />
      <img src="/images/cocktail-right-leaf.webp" alt="" id="c-right-leaf" loading="lazy" />

      <div className="list">
        <DrinkList title="Most popular cocktails:" className="popular" items={cocktailLists} />
        <DrinkList title="Most loved mocktails:" className="loved" items={mockTailLists} />
      </div>
    </section>
  );
};

export default Cocktails;
