"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus_Jakarta_Sans, Space_Grotesk, Syne } from "next/font/google";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const REVEAL_TEXT =
  "Stunning full-stack web systems, mobile applications, and autonomous AI models, crafted for companies that care about every detail.";

export default function HeroTextRevealSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const words = REVEAL_TEXT.split(" ");
  const totalWords = words.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 30%",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const count = Math.floor(progress * totalWords);
          setRevealedCount(count);

          wordsRef.current.forEach((wordEl, idx) => {
            if (!wordEl) return;
            if (idx <= count) {
              gsap.to(wordEl, {
                color: "#e6e2d6",
                opacity: 1,
                duration: 0.2,
                overwrite: "auto",
              });
            } else {
              gsap.to(wordEl, {
                color: "rgba(255, 255, 255, 0.18)",
                opacity: 0.6,
                duration: 0.2,
                overwrite: "auto",
              });
            }
          });

          // Move the square cursor accent to active word position
          const activeWord = wordsRef.current[Math.min(count, totalWords - 1)];
          if (activeWord && cursorRef.current) {
            const rect = activeWord.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const x = rect.right - sectionRect.left + 8;
            const y = rect.top - sectionRect.top + rect.height / 2 - 8;
            gsap.to(cursorRef.current, {
              x,
              y,
              duration: 0.2,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        },
      });

      return () => st.kill();
    }, section);

    return () => ctx.revert();
  }, [totalWords]);

  return (
    <section
      ref={sectionRef}
      aria-label="What I do statement"
      className={`relative isolate min-h-[90vh] w-full bg-[#0b0b0c] text-white flex flex-col justify-center px-6 py-24 sm:px-12 md:px-20 ${jakarta.className}`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(230,226,214,0.03),transparent_70%)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-16">
        {/* Left Tag matching reference bracket [ WHAT I DO ] */}
        <div className="shrink-0 lg:w-48 pt-3">
          <span
            className={`inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#c2bba8]/80 ${spaceGrotesk.className}`}
          >
            [ WHAT I DO ]
          </span>
        </div>

        {/* Right Large Reveal Text */}
        <div className="relative max-w-4xl flex-1">
          <p
            className={`text-[clamp(2.2rem,min(5vw,4rem),4.2rem)] font-bold leading-[1.12] tracking-[-0.02em] select-none ${syne.className}`}
          >
            {words.map((word, idx) => (
              <span
                key={idx}
                ref={(el) => {
                  wordsRef.current[idx] = el;
                }}
                className="inline-block mr-[0.28em] transition-colors duration-200"
                style={{ color: "rgba(255, 255, 255, 0.18)" }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* Glowing cursor square indicator matching Marcus Lorenzet reference */}
          <span
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 rounded-[2px] bg-[#e6e2d6] shadow-[0_0_15px_rgba(230,226,214,0.9)] opacity-90 transition-opacity"
          />

          {/* Subtext below statement */}
          <div className="mt-14 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#e6e2d6] animate-pulse" />
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 ${spaceGrotesk.className}`}
            >
              trusted by platforms with 1M+ users &amp; global clients.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
