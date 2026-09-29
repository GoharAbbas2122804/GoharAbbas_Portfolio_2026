"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/ui/Hero";
import HeroTextRevealSection from "@/components/ui/HeroTextRevealSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroAboutOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const revealWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const heroWrap = heroWrapRef.current;
    const revealWrap = revealWrapRef.current;

    if (!container || !heroWrap || !revealWrap) return;

    const ctx = gsap.context(() => {
      // Smooth GSAP ScrollTrigger animation for the curtain overlay
      ScrollTrigger.create({
        trigger: revealWrap,
        start: "top bottom", // when top of reveal section enters bottom of viewport
        end: "top top", // when top of reveal section reaches top of viewport
        scrub: 0.8, // smooth scrub effect
        onUpdate: (self) => {
          const progress = self.progress;
          // Scale down Hero section and dim opacity as reveal section overlays it
          gsap.set(heroWrap, {
            scale: 1 - progress * 0.08,
            opacity: 1 - progress * 0.5,
            filter: `blur(${progress * 6}px)`,
          });
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-[#0b0b0c]">
      {/* ── Sticky Fixed Hero Section (Layer 0) ─────────────────────────── */}
      <div
        ref={heroWrapRef}
        className="sticky top-0 h-screen w-full z-0 overflow-hidden origin-bottom will-change-transform"
      >
        <Hero />
      </div>

      {/* ── Overlays from bottom to top over the Hero (Layer 10) ────────── */}
      <div
        ref={revealWrapRef}
        className="relative z-10 min-h-screen w-full bg-[#0b0b0c] shadow-[0_-30px_70px_rgba(0,0,0,0.9)] will-change-transform"
      >
        <HeroTextRevealSection />
      </div>
    </div>
  );
}
