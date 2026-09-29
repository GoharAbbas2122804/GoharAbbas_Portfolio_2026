"use client";

import { useEffect, useRef } from "react";
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

const REVEAL_STATEMENT =
  "Stunning full-stack web systems, mobile applications, and autonomous AI models, crafted for companies that care about every detail.";

export default function HeroTextRevealSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const words = REVEAL_STATEMENT.split(" ");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const charEls = Array.from(section.querySelectorAll<HTMLSpanElement>(".reveal-char"));
      const totalChars = charEls.length;
      if (!totalChars) return;

      // Single pinned ScrollTrigger that locks the section in viewport
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=2400", // Long scroll distance (2400px) so scroll is locked on text reveal
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        refreshPriority: 10,
        onUpdate: (self) => {
          const progress = self.progress;

          // 0.0 -> 0.82: Character-by-character letter light up from dark gray to pure white
          // 0.82 -> 1.00: Hold / Stay buffer phase so user reads full white statement before unpinning
          const revealProgress = Math.min(1, progress / 0.82);
          const activeIndex = Math.floor(revealProgress * totalChars);

          for (let idx = 0; idx < totalChars; idx++) {
            const charEl = charEls[idx];
            if (!charEl) continue;
            if (idx <= activeIndex && revealProgress > 0) {
              charEl.style.color = "#ffffff";
              charEl.style.opacity = "1";
            } else {
              charEl.style.color = "rgba(255, 255, 255, 0.16)";
              charEl.style.opacity = "0.6";
            }
          }

          // Move the glowing cursor square accent letter-by-letter
          const currentChar = charEls[Math.min(activeIndex, totalChars - 1)];
          if (currentChar && cursorRef.current && textContainerRef.current) {
            const charRect = currentChar.getBoundingClientRect();
            const containerRect = textContainerRef.current.getBoundingClientRect();
            const x = charRect.right - containerRect.left + 3;
            const y = charRect.top - containerRect.top + charRect.height / 2 - 7;
            gsap.to(cursorRef.current, {
              x,
              y,
              duration: 0.12,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        },
      });

      return () => st.kill();
    }, section);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
    }

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="What I do statement"
      className={`relative isolate h-screen w-full bg-[#0b0b0c] text-white flex items-center justify-center px-6 sm:px-12 md:px-20 ${jakarta.className}`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(230,226,214,0.03),transparent_70%)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
        {/* Left Tag matching reference bracket [ WHAT I DO ] */}
        <div className="shrink-0 lg:w-48 pt-3">
          <span
            className={`inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#c2bba8]/80 ${spaceGrotesk.className}`}
          >
            [ WHAT I DO ]
          </span>
        </div>

        {/* Right Large Reveal Text */}
        <div ref={textContainerRef} className="relative max-w-4xl flex-1">
          <p
            className={`text-[clamp(2.2rem,min(5.2vw,4rem),4.2rem)] font-bold leading-[1.14] tracking-[-0.02em] select-none ${syne.className}`}
          >
            {words.map((word, wIdx) => {
              const wordChars = word.split("");
              return (
                <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.32em]">
                  {wordChars.map((char, cIdx) => (
                    <span
                      key={cIdx}
                      className="reveal-char inline-block transition-colors duration-150"
                      style={{ color: "rgba(255, 255, 255, 0.16)" }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              );
            })}
          </p>

          {/* Glowing cursor square indicator matching Marcus Lorenzet reference */}
          <span
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 rounded-[2px] bg-[#e6e2d6] shadow-[0_0_15px_rgba(230,226,214,0.9)] opacity-95 transition-opacity"
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
