import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { reduceMotion } from "../lib/motion";

const playIntro = () => {
  // autoSplit re-splits once the web fonts arrive, and onSplit hands the
  // new elements to a fresh tween that resumes at the same progress
  SplitText.create(".title", {
    type: "chars",
    charsClass: "text-gradient",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.chars, {
        opacity: 0,
        yPercent: 100,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.06,
      }),
  });

  SplitText.create(".subtitle", {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 100,
        duration: 1.8,
        ease: "expo.out",
        stagger: 0.06,
        delay: 1,
      }),
  });

  gsap.from(".tagline, .view-cocktails a", {
    opacity: 0,
    y: 16,
    duration: 1,
    ease: "power2.out",
    stagger: 0.1,
    delay: 1.4,
  });

  // leaf parallax
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
    .to(".right-leaf", { y: 200 }, 0)
    .to(".left-leaf", { y: -200 }, 0);
};

const Hero = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  useGSAP(
    () => {
      // decorative motion only; the video scrub below is driven by the user's own scrolling
      if (!reduceMotion()) playIntro();

      // video scrub: the .video track spans hero + cocktails and its frame is
      // CSS-sticky, so scroll progress through the track maps to video time
      const video = videoRef.current;
      const scrub = { progress: 0 };

      const seek = () => {
        if (!video.duration) return;
        const time = scrub.progress * video.duration;
        // skip redundant seeks: each one makes the decoder fetch a frame
        if (Math.abs(video.currentTime - time) > 0.01) video.currentTime = time;
      };

      gsap.to(scrub, {
        progress: 1,
        ease: "none",
        onUpdate: seek,
        scrollTrigger: {
          trigger: ".video",
          start: "top top",
          end: "bottom bottom",
          // a little lag smooths out the frame jumps from mouse-wheel steps
          scrub: 0.5,
        },
      });

      // iOS Safari won't load or paint frames until the video has played once.
      // Muted autoplay usually works; Low Power Mode blocks it until a tap.
      const unlockEvents = ["touchend", "click"];
      const removeUnlock = () => unlockEvents.forEach((e) => window.removeEventListener(e, prime));
      function prime() {
        video.play().then(
          () => {
            video.pause();
            seek();
            removeUnlock();
          },
          () => unlockEvents.forEach((e) => window.addEventListener(e, prime, { once: true, passive: true })),
        );
      }

      video.addEventListener("loadedmetadata", seek);
      prime();

      return () => {
        video.removeEventListener("loadedmetadata", seek);
        removeUnlock();
      };
    },
    { scope: heroRef },
  );

  return (
    <div ref={heroRef} className="contents">
      <section id="hero" className="noisy">
        <h1 className="title">MOJITO</h1>

        <img src="/images/hero-left-leaf.webp" alt="" className="left-leaf" />
        <img src="/images/hero-right-leaf.webp" alt="" className="right-leaf" />

        <div className="body">
          <div className="content">
            <div className="space-y-5 hidden md:block">
              <p className="tagline">Cool. Crisp. Classic.</p>
              <p className="subtitle">
                Sip the Spirit <br /> of Summer
              </p>
            </div>

            <div className="view-cocktails">
              <p className="subtitle">
                Every cocktail on our menu is a blend of premium ingredients, creative flair, and timeless
                recipes - designed to delight your senses.
              </p>
              <a href="#cocktails">View Cocktails</a>
            </div>
          </div>
        </div>
      </section>

      <div className="video">
        <div className="video-frame">
          <video
            ref={videoRef}
            src="/videos/output.mp4"
            poster="/videos/poster.webp"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
