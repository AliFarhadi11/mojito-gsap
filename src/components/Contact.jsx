import { useRef } from "react";
import { openingHours, socials } from "../../constants/index.js";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { reduceMotion } from "../lib/motion";

const Contact = () => {
  const footerRef = useRef(null);

  useGSAP(
    () => {
      if (reduceMotion()) return;

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
              trigger: footerRef.current,
              start: "top center",
            },
            defaults: { ease: "power2.out" },
          })
          .from(words, {
            yPercent: 100,
            duration: 1,
            ease: "expo.out",
            stagger: 0.02,
          })
          .from(
            ".content > div",
            {
              opacity: 0,
              y: 30,
              duration: 0.8,
              stagger: 0.1,
            },
            "-=0.6",
          )
          .to(
            "#f-right-leaf, #f-left-leaf",
            {
              y: -50,
              duration: 1.2,
              ease: "power1.inOut",
            },
            "<",
          );
      }
    },
    { scope: footerRef },
  );

  return (
    <footer id="contact" ref={footerRef}>
      <div className="noisy pointer-events-none" />
      <img src="/images/footer-right-leaf.webp" alt="" id="f-right-leaf" loading="lazy" />
      <img src="/images/footer-left-leaf.webp" alt="" id="f-left-leaf" loading="lazy" />

      <div className="content">
        <h2>Where to Find Us</h2>

        <div>
          <h3>Visit Our Bar</h3>
          <p>456, Raq Blvd. #404, Los Angeles, CA 90210</p>
        </div>

        <div>
          <h3>Contact Us</h3>
          <p>(555) 987-6543</p>
          <p>hello@jsmcocktail.com</p>
        </div>

        <div>
          <h3>Open Every Day</h3>
          {openingHours.map((time) => (
            <p key={time.day}>
              {time.day} : {time.time}
            </p>
          ))}
        </div>

        <div>
          <h3>Socials</h3>

          <div className="flex-center gap-5">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="transition-transform duration-300 hover:-translate-y-1">
                <img src={social.icon} alt="" width="30" height="30" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
