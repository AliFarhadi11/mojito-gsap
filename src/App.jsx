import { useEffect } from "react";
import gsap from "gsap";
// import plugins from their own modules so only these three end up in the bundle
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Cocktails from "./components/Cocktails";
import About from "./components/About";
import Art from "./components/Art";
import Menu from "./components/Menu";
import Marquee from "./components/Marquee";
import Contact from "./components/Contact";
import { smoothScroll } from "./lib/motion";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// don't recalculate every trigger when the mobile address bar shows/hides
ScrollTrigger.config({ ignoreMobileResize: true });

// web fonts change text heights after the first layout, which shifts every trigger below
document.fonts?.ready.then(() => ScrollTrigger.refresh());

const App = () => {
  useEffect(() => smoothScroll(), []);

  return (
    <main>
      <Navbar />
      {/* hero video stays pinned across both sections */}
      <div className="relative">
        <Hero />
        <Cocktails />
      </div>
      <About />
      <Art />
      <Menu />
      <Marquee />
      <Contact />
    </main>
  );
};

export default App;
