import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { navLinks } from "../../constants/index.js";

const Navbar = () => {
  const navRef = useRef(null);

  // toggle a class and let CSS transition it, instead of scrubbing backdrop-filter every scroll frame
  useGSAP(() => {
    ScrollTrigger.create({
      start: 10,
      end: "max",
      toggleClass: { targets: navRef.current, className: "is-scrolled" },
    });
  }, []);

  return (
    <nav ref={navRef}>
      <div>
        <a href="#hero" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="" width="32" height="32" />
          <p>Velvet Pour</p>
        </a>

        <ul>
          {navLinks.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`}>{link.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;
