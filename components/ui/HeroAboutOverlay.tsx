"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/ui/Hero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Tweak these ─────────────────────────────────────────────────────────── */
const ABOUT_TEXT =
  "I’m Gohar Abbas, a full-stack software engineer in Pakistan. I build web applications, mobile apps, AI agents, and automation for founders and teams around the world.";

const DIM_OPACITY = 0.15; // must match the `opacity-[0.15]` class on .about-char
const PX_PER_CHAR = 14; // scroll distance per character (higher = slower reveal)
const TEXT_SCRUB = 0.6; // smoothing on the text reveal (seconds of "catch-up")
const HERO_END_SCALE = 0.92; // how far the hero shrinks as the about section covers it
const HERO_END_DIM = 0.6; // how dark the hero gets as the about section covers it
/* ────────────────────────────────────────────────────────────────────────── */

type Props = {
  text?: string;
};

export default function HeroAboutOverlay({ text = ABOUT_TEXT }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  // Split into words -> characters in React (no DOM mutation, no SplitText needed)
  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  useEffect(() => {
    const container = containerRef.current;
    const hero = heroRef.current;
    const dim = dimRef.current;
    const about = aboutRef.current;
    if (!container || !hero || !dim || !about) return;

    const chars = gsap.utils.toArray<HTMLElement>(".about-char", about);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let cancelled = false;

    const ctx = gsap.context(() => {
      // Reduced motion: show all text, no pinning, no scrubbing.
      if (reduceMotion) {
        gsap.set(chars, { opacity: 1 });
        return;
      }

      /* 1) Curtain: as the about section slides up over the hero,
            the hero (sticky, behind) shrinks slightly and darkens.
            Range: about's top enters the viewport bottom -> reaches viewport top. */
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: about,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        })
        .to(hero, { scale: HERO_END_SCALE }, 0)
        .to(dim, { opacity: HERO_END_DIM }, 0);

      /* 2) Pin the about section and highlight it char by char.
            - scrub ties the timeline to scroll, so scrolling UP plays it in reverse
            - pin holds the section in place for the whole reveal
            - pinSpacing (default true) adds exactly `end` px of scroll space,
              so the next section starts right after the animation finishes */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: about,
          start: "top top",
          end: () =>
            `+=${Math.max(window.innerHeight, chars.length * PX_PER_CHAR)}`,
          pin: true,
          scrub: TEXT_SCRUB,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        chars,
        { opacity: DIM_OPACITY },
        { opacity: 1, duration: 0.3, stagger: 0.1 }
      );

      // Short hold at the end so the fully lit text rests for a moment
      // before the section unpins (also lets the scrub smoothing catch up).
      tl.to({}, { duration: tl.duration() * 0.08 });
    }, container);

    // Fonts change text metrics -> recalc trigger positions once they're ready
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    // Check if preloader is already done at mount (e.g. returning visitor in session)
    if (
      typeof document !== "undefined" &&
      (document.documentElement.dataset.plDone === "true" ||
        document.documentElement.dataset.plSeen === "1")
    ) {
      ScrollTrigger.refresh();
    }

    // When the preloader curtain lifts, refresh ScrollTrigger to ensure pinned coordinates match
    const onPreloaderDone = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };
    window.addEventListener("preloader:done", onPreloaderDone, { once: true });

    // Debounced ResizeObserver to refresh ScrollTrigger as below-fold dynamic sections mount
    let resizeTimer: NodeJS.Timeout | null = null;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (cancelled) return;
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!cancelled) ScrollTrigger.refresh();
        }, 150);
      });
      if (document.body) ro.observe(document.body);
      if (container) ro.observe(container);
    }

    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      ro?.disconnect();
      window.removeEventListener("preloader:done", onPreloaderDone);
      ctx.revert(); // kills triggers, removes pin-spacers, clears inline styles
    };
  }, [words]);

  return (
    // NOTE: no overflow-hidden here. overflow != visible on an ancestor breaks
    // `position: sticky` (and can break pinning) for everything inside it.
    <div ref={containerRef} className="relative w-full bg-[#0b0b0c]">
      {/* ── Layer 0: Hero, stuck to the top while the about section covers it ── */}
      <div
        ref={heroRef}
        id="hero"
        className="sticky top-0 z-0 h-screen w-full origin-center will-change-transform"
      >
        <Hero />
        {/* Dim layer: cheaper than animating opacity/blur on the whole hero */}
        <div
          ref={dimRef}
          className="pointer-events-none absolute inset-0 z-50 bg-black opacity-0"
        />
      </div>

      {/* ── Layer 10: About section. Slides over hero, then pins for the reveal ── */}
      <section
        ref={aboutRef}
        id="about"
        className="relative z-10 h-screen w-full bg-[#0b0b0c] shadow-[0_-30px_70px_rgba(0,0,0,0.9)]"
      >
        <div className="mx-auto flex h-full max-w-5xl items-center px-6 md:px-12">
          <p className="text-[clamp(1.75rem,4.2vw,3.5rem)] font-medium leading-[1.15] tracking-tight text-white">
            {/* Screen readers get the real sentence; the split spans are hidden */}
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
              {words.map((word, w) => (
                <Fragment key={w}>
                  {/* inline-block + nowrap keeps a word from breaking mid-word */}
                  <span className="inline-block whitespace-nowrap">
                    {Array.from(word).map((char, c) => (
                      <span
                        key={c}
                        className="about-char opacity-[0.15] will-change-[opacity]"
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                  {/* Real space between words so lines can wrap naturally */}
                  {w < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
