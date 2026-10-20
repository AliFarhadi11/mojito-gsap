import { useRef } from "react";
import { openingHours, socials } from "../../constants/index.js";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { parallax, reduceMotion } from "../lib/motion";

const Contact = () => {
  const footerRef = useRef(null);

  useGSAP(
    () => {
      const root = footerRef.current;
      parallax(root);
      if (reduceMotion()) return;

      const q = gsap.utils.selector(root);

      // autoSplit rebuilds this timeline outside the useGSAP scope when fonts load,
      // so it targets elements from q() rather than selector strings
      SplitText.create(q("h2"), {
        type: "words",
        mask: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap
            .timeline({
              scrollTrigger: { trigger: root, start: "top 70%" },
              defaults: { ease: "power2.out" },
            })
            .from(self.words, { yPercent: 100, duration: 1, ease: "expo.out", stagger: 0.02 })
            .from(q(".content > div"), { opacity: 0, y: 30, duration: 0.8, stagger: 0.1 }, "-=0.6"),
      });
    },
    { scope: footerRef },
  );

  return (
    <footer id="contact" ref={footerRef}>
      <img src="/images/footer-right-leaf.webp" alt="" id="f-right-leaf" data-speed="0.3" data-rotate="-6" loading="lazy" />
      <img src="/images/footer-left-leaf.webp" alt="" id="f-left-leaf" data-speed="0.4" data-rotate="8" loading="lazy" />

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
