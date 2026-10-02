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
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export interface JourneyMilestone {
  id: string;
  year: string;
  period: string;
  title: string;
  role: string;
  description: string;
  skills: string[];
  category: "top" | "bottom";
  icon: string;
}

const MILESTONES: JourneyMilestone[] = [
  {
    id: "m1-2023",
    year: "2023",
    period: "2023",
    title: "CS Foundations & Core Engineering",
    role: "Computer Science Foundations",
    description:
      "Initiated Computer Science journey mastering programming paradigms, data structures, algorithms, object-oriented design, version control, and operating systems.",
    skills: ["Computer Science", "Data Structures", "Algorithms", "C / C++", "Git & Linux"],
    category: "top",
    icon: "💻",
  },
  {
    id: "m2-2024",
    year: "2024",
    period: "2024",
    title: "Full-Stack Web Systems",
    role: "Full-Stack Web Engineer",
    description:
      "Mastered modern full-stack web architecture—building responsive web applications, SSR/SSG systems, REST/GraphQL APIs, Next.js, React, Node.js, and relational databases.",
    skills: ["Full-Stack Web", "Next.js", "React", "TypeScript", "Node.js", "PostgreSQL"],
    category: "bottom",
    icon: "⚡",
  },
  {
    id: "m3-2025",
    year: "2025",
    period: "2025",
    title: "Flutter & Mobile Development",
    role: "Mobile Application Architect",
    description:
      "Expanded ecosystem into mobile development—architecting high-performance cross-platform Flutter apps and native iOS & Android solutions with offline sync and native API bindings.",
    skills: ["Flutter", "Dart", "iOS & Android", "Native Mobile", "State Sync"],
    category: "top",
    icon: "📱",
  },
  {
    id: "m4-2026",
    year: "2026",
    period: "Present - 2026",
    title: "AI, Deep Learning & RAG Systems",
    role: "AI / ML Systems Engineer",
    description:
      "Specialized in modern AI & Deep Learning—building Transformer models, Retrieval-Augmented Generation (RAG) knowledge pipelines, PyTorch neural nets, and autonomous AI agents.",
    skills: ["Deep Learning", "Transformers", "RAG Pipelines", "AI Agents", "PyTorch", "LLMs"],
    category: "bottom",
    icon: "🧠",
  },
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineProgressRef = useRef<HTMLDivElement>(null);
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      // Calculate total horizontal scroll distance
      const getScrollAmount = () => {
        return -(track.scrollWidth - window.innerWidth);
      };

      // ── 1. Master Horizontal Pinning Timeline ─────────────────────────────
      const horizontalTween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          start: "top top",
          end: () => `+=${Math.max(window.innerWidth * 1.8, track.scrollWidth - window.innerWidth)}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update line fill progress based on scroll percentage
            if (lineProgressRef.current) {
              gsap.set(lineProgressRef.current, {
                scaleX: self.progress,
              });
            }
          },
        },
      });

      // ── 2. Individual Milestone Reveal Animations ───────────────────────
      milestoneRefs.current.forEach((el, index) => {
        if (!el) return;

        const dot = el.querySelector(".timeline-dot");
        const line = el.querySelector(".timeline-connector-line");
        const card = el.querySelector(".timeline-card");

        gsap.set(dot, { scale: 0, opacity: 0 });
        gsap.set(line, { scaleY: 0 });
        gsap.set(card, { opacity: 0, y: index % 2 === 0 ? -40 : 40, scale: 0.92 });

        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            containerAnimation: horizontalTween,
            start: "left 85%",
            end: "left 45%",
            scrub: 0.5,
          },
        })
          .to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" })
          .to(line, { scaleY: 1, duration: 0.4, ease: "power2.out" }, "-=0.15")
          .to(card, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, "-=0.25");
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="journey"
      className={`relative w-full bg-[#0b0b0c] text-white overflow-hidden ${jakarta.className}`}
      aria-label="Career Timeline & Journey"
    >
      {/* Ambient monochrome glow & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_60px)] pointer-events-none z-0" />

      {/* Header Bar inside pinned viewport */}
      <div className="absolute top-8 left-8 right-8 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <span className={`text-xs font-bold uppercase tracking-[0.25em] text-zinc-300 ${spaceGrotesk.className}`}>
            MY JOURNEY — 2023 TO 2026
          </span>
        </div>
        <span className={`text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ${spaceGrotesk.className}`}>
          SCROLL TO EXPLORE →
        </span>
      </div>

      {/* Horizontal Scroll Track Container */}
      <div className="h-screen w-full flex items-center z-10 relative">
        <div
          ref={trackRef}
          className="flex items-center gap-16 px-12 md:px-24 shrink-0 will-change-transform"
          style={{ width: "max-content" }}
        >
          {/* Section Intro Block */}
          <div className="w-[85vw] max-w-[460px] shrink-0 space-y-5 pr-6">
            <span className={`text-xs font-bold uppercase tracking-[0.22em] text-zinc-400 ${spaceGrotesk.className}`}>
              // Career Storyline
            </span>
            <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.96] text-white ${syne.className}`}>
              HOW I BUILT MY{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                CRAFT
              </span>
            </h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
              From Computer Science foundations in 2023 to full-stack web platforms, mobile Flutter apps, and cutting-edge Deep Learning &amp; RAG systems in 2026.
            </p>
            <div className={`pt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 ${spaceGrotesk.className}`}>
              <span>Scroll horizontally to view milestones</span>
              <span className="text-white">→</span>
            </div>
          </div>

          {/* Timeline Track with Center Line */}
          <div className="relative flex items-center py-20">
            {/* Background Base Horizontal Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-800/90 z-0" />

            {/* Glowing Active Progress Line (Pure White & Grays) */}
            <div
              ref={lineProgressRef}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-zinc-600 via-white to-zinc-400 z-0 origin-left scale-x-0 transition-transform duration-75 shadow-[0_0_16px_rgba(255,255,255,0.8)]"
            />

            {/* Milestone Items */}
            <div className="flex items-center gap-20 relative z-10">
              {MILESTONES.map((item, index) => {
                const isTop = item.category === "top";
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      milestoneRefs.current[index] = el;
                    }}
                    className="relative flex flex-col items-center justify-center w-[340px] md:w-[380px] shrink-0"
                  >
                    {/* Node Dot on the center line */}
                    <div className="timeline-dot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-[#0b0b0c] border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>

                    {/* Vertical Connector Line */}
                    <div
                      className={`timeline-connector-line absolute left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-white via-zinc-400 to-transparent z-10 ${
                        isTop ? "bottom-1/2 h-16 origin-bottom" : "top-1/2 h-16 origin-top"
                      }`}
                    />

                    {/* Milestone Card */}
                    <div
                      className={`timeline-card w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl hover:border-zinc-500/60 transition-colors group ${
                        isTop ? "mb-36" : "mt-36"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className={`text-xs font-bold uppercase tracking-widest text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/20 ${spaceGrotesk.className}`}>
                            {item.period}
                          </span>
                        </div>
                        <span className={`text-2xl font-black text-white/30 tracking-tighter ${syne.className}`}>
                          {item.year}
                        </span>
                      </div>

                      {/* Title & Role */}
                      <h3 className={`text-lg font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors ${spaceGrotesk.className}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        {item.role}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-semibold text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* End Milestone / Conclusion Card */}
          <div className="w-[310px] shrink-0 bg-gradient-to-br from-zinc-900 via-[#141417] to-black border border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-xl">
              🚀
            </div>
            <h3 className={`text-xl font-black text-white ${syne.className}`}>
              THE NEXT CHAPTER
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Always expanding my stack, crafting bold user interfaces, and solving complex architecture problems.
            </p>
            <a
              href="/contact"
              className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0b0b0c] bg-white hover:bg-zinc-200 px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg ${spaceGrotesk.className}`}
            >
              Build With Me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
