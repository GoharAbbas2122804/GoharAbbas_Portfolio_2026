"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Plus_Jakarta_Sans, Space_Grotesk, Syne } from "next/font/google";
import { ExternalLink, FileText, Award } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
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

export interface InteractiveListItem {
  client: string; // Course Name / Certificate Title
  platform?: string; // Learning Platform / Issuer
  services: string; // Skills & what was done in it
  img: string; // Image reference in /assets/certificates
  pdf?: string; // Official PDF reference
  verifyUrl?: string; // Online verification link
  date?: string; // Completion date
}

export interface InteractiveListPreviewProps {
  items?: InteractiveListItem[];
  /** Scale multiplier for the hover preview image. */
  imageSize?: number;
  /** Preview image reveal / hide duration (seconds). */
  duration?: number;
  /** Highlight bar + row text transition smoothing (seconds). */
  smoothness?: number;
  /** Pointer-follow smoothing; higher tracks faster. */
  lerp?: number;
  /** Background color of the list surface. */
  bgColor?: string;
  className?: string;
}

const DEFAULT_IMAGE_Z_INDEX = 10;
const DEFAULT_IMAGE_SIZE = 1;
const DEFAULT_DURATION = 0.5;
const DEFAULT_SMOOTHNESS = 0.35;
const DEFAULT_LERP = 0.18;

const DEFAULT_ITEMS: InteractiveListItem[] = [
  {
    client: "Claude Code in Action",
    platform: "ANTHROPIC ACADEMY",
    services: "Agentic Workflows, AI CLI Tools, Prompt Engineering, Code Automation",
    img: "/assets/certificates/claude-code-in-action.webp",
    pdf: "/assets/certificates/claude-code-in-action.pdf",
    verifyUrl: "https://verify.skilljar.com/c/fqoeuhovfxq6",
    date: "Mar 2026",
  },
  {
    client: "Supervised Machine Learning",
    platform: "DEEPLEARNING.AI & STANFORD",
    services: "Linear/Logistic Regression, Gradient Descent, Cost Optimization",
    img: "/assets/certificates/supervised-machine-learning.webp",
    pdf: "/assets/certificates/supervised-machine-learning.pdf",
    verifyUrl: "https://coursera.org/verify/8WKPT5M67W61",
    date: "Jul 2026",
  },
  {
    client: "GitHub Foundations",
    platform: "DATACAMP",
    services: "Git Version Control, GitHub Actions CI/CD, Branching, PR Workflows",
    img: "/assets/certificates/github-foundations.webp",
    pdf: "/assets/certificates/github-foundations.pdf",
    date: "Jul 2026",
  },
  {
    client: "Introduction to AI Agents",
    platform: "DATACAMP",
    services: "Autonomous Agents, Multi-Agent Systems, Memory & Tool Calling",
    img: "/assets/certificates/introduction-to-ai-agents.webp",
    pdf: "/assets/certificates/introduction-to-ai-agents.pdf",
    date: "Aug 2026",
  },
  {
    client: "Supervised Learning with scikit-learn",
    platform: "DATACAMP",
    services: "Scikit-Learn, Hyperparameter Tuning, Classification & Cross-Validation",
    img: "/assets/certificates/supervised-learning-with-scikit-learn.webp",
    pdf: "/assets/certificates/supervised-learning-with-scikit-learn.pdf",
    date: "Aug 2026",
  },
  {
    client: "Programming with JavaScript",
    platform: "META",
    services: "JavaScript ES6+, DOM Manipulation, Async JS, Jest Unit Testing",
    img: "/assets/certificates/programming-with-javascript.webp",
    pdf: "/assets/certificates/programming-with-javascript.pdf",
    verifyUrl: "https://coursera.org/verify/62KWB53975KO",
    date: "Oct 2025",
  },
  {
    client: "Technical Support Fundamentals",
    platform: "GOOGLE",
    services: "IT Infrastructure, Computer Networking, Linux Administration, System Testing",
    img: "/assets/certificates/technical-support-fundamentals.webp",
    pdf: "/assets/certificates/technical-support-fundamentals.pdf",
    verifyUrl: "https://coursera.org/verify/Y8SUB2PZV3JW",
    date: "Jan 2025",
  },
];

const BASE_IMAGE_WIDTH_REM = 18;
const BASE_IMAGE_HEIGHT_REM = 12.5;
const IMAGE_OFFSET_MULTIPLIER = 16;
const ACTIVE_ROW_TEXT_COLOR = "#ffffff";
const INACTIVE_ROW_TEXT_COLOR = "#a1a1aa";
const IMAGE_HIDDEN_CLIP_PATH = "inset(50%)";
const IMAGE_VISIBLE_CLIP_PATH = "inset(0%)";
const IMAGE_VISIBILITY_HIDDEN = "hidden";
const IMAGE_VISIBILITY_VISIBLE = "visible";

function clampNumber(value: number, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

export default function Certificates({
  items = DEFAULT_ITEMS,
  imageSize = DEFAULT_IMAGE_SIZE,
  duration = DEFAULT_DURATION,
  smoothness = DEFAULT_SMOOTHNESS,
  lerp = DEFAULT_LERP,
  bgColor = "#0b0b0c",
  className = "",
}: InteractiveListPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const imageRefs = useRef<any[]>([]);
  const imageContainerRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const highlightRef = useRef<any>(null);
  const rowRefs = useRef<Record<number, any>>({});
  const pendingLeaveRef = useRef<Record<number, boolean>>({});
  const tweenGenerationRef = useRef<Record<number, number>>({});
  const activeIndexRef = useRef<number | null>(null);
  const zIndexRef = useRef(DEFAULT_IMAGE_Z_INDEX);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const reduceMotionRef = useRef(
    typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false)
  );

  const safeImageSize = clampNumber(imageSize, 0.5, 2, DEFAULT_IMAGE_SIZE);
  const safeDuration = clampNumber(duration, 0.1, 2, DEFAULT_DURATION);
  const safeSmoothness = clampNumber(smoothness, 0.05, 1.5, DEFAULT_SMOOTHNESS);
  const safeLerp = clampNumber(lerp, 0.02, 1, DEFAULT_LERP);

  // GSAP ScrollTrigger intro animations for section & header
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const listeners: Array<() => void> = [];
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const headerBits = headerRef.current
        ? headerRef.current.querySelectorAll(".cert-header-item")
        : [];
      const title = titleRef.current;
      const divider = section.querySelector<HTMLElement>(".cert-divider");
      const dot = section.querySelector<HTMLElement>(".cert-dot");

      if (title) {
        title.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          splits.push(new SplitText(el, { type: "words" }));
        });
      }
      const words = splits.flatMap((split) => split.words);

      if (reduceMotion) {
        gsap.set(headerBits, { autoAlpha: 1, y: 0 });
        gsap.set(words, { autoAlpha: 1, yPercent: 0 });
        gsap.set(divider, { scaleX: 1 });
        return;
      }

      gsap.set(headerBits, { autoAlpha: 0, y: 20 });
      gsap.set(words, { autoAlpha: 0, yPercent: 70 });
      gsap.set(divider, { scaleX: 0 });

      // Entrance timeline
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      intro
        .to(headerBits, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0)
        .to(
          words,
          { autoAlpha: 1, yPercent: 0, duration: 0.85, stagger: 0.08, ease: "power4.out" },
          0.1
        )
        .to(divider, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 0.45);

      // Section Mouse move Spotlight Effect
      const spot = section.querySelector<HTMLElement>(".cert-spotlight");
      if (spot && canHover) {
        gsap.set(spot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        const xTo = gsap.quickTo(spot, "x", { duration: 0.55, ease: "power3" });
        const yTo = gsap.quickTo(spot, "y", { duration: 0.55, ease: "power3" });
        const fade = gsap.to(spot, {
          autoAlpha: 1,
          duration: 0.45,
          paused: true,
          overwrite: "auto",
        });

        const onMove = (event: PointerEvent) => {
          const rect = section.getBoundingClientRect();
          xTo(event.clientX - rect.left);
          yTo(event.clientY - rect.top);
          fade.play();
        };
        const onLeave = () => fade.reverse();

        section.addEventListener("pointermove", onMove);
        section.addEventListener("pointerleave", onLeave);
        listeners.push(() => {
          section.removeEventListener("pointermove", onMove);
          section.removeEventListener("pointerleave", onLeave);
        });
      }

      // Pulsing Dot Animation
      if (dot) {
        gsap.set(dot, {
          transformOrigin: "50% 50%",
          boxShadow: "0 0 10px rgba(255,255,255,0.85)",
        });
        gsap.to(dot, {
          scale: 1.5,
          boxShadow: "0 0 22px rgba(255,255,255,1)",
          duration: 1.15,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Text Gradient Shift
      gsap.to(".cert-gradient", {
        backgroundPosition: "200% 0%",
        duration: 9,
        repeat: -1,
        ease: "none",
        delay: 1.5,
      });
    }, section);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
    }

    return () => {
      ctx.revert();
      splits.forEach((split) => split.revert());
      listeners.forEach((off) => off());
    };
  }, []);

  // Coarse Pointer & Reduced Motion listener
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const onChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
      if (event.matches && imageContainerRef.current) {
        gsap.killTweensOf(imageContainerRef.current);
        gsap.set(imageContainerRef.current, { x: 0, y: 0 });
        pointerTargetRef.current = { x: 0, y: 0 };
        pointerCurrentRef.current = { x: 0, y: 0 };
      }
    };

    reduceMotionRef.current = mq.matches;
    if (mq.matches && imageContainerRef.current) {
      gsap.set(imageContainerRef.current, { x: 0, y: 0 });
      pointerTargetRef.current = { x: 0, y: 0 };
      pointerCurrentRef.current = { x: 0, y: 0 };
    }

    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const coarseMq = window.matchMedia?.("(pointer: coarse)");
    if (!coarseMq) return;

    const onChange = (event: MediaQueryListEvent) => {
      setIsCoarsePointer(event.matches);
    };

    setIsCoarsePointer(coarseMq.matches);
    coarseMq.addEventListener?.("change", onChange);
    return () => coarseMq.removeEventListener?.("change", onChange);
  }, []);

  // Pointer follow animation ticker
  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      if (!reduceMotionRef.current && !isCoarsePointer) {
        const target = pointerTargetRef.current;
        const current = pointerCurrentRef.current;
        const factor = safeLerp;

        current.x += (target.x - current.x) * factor;
        current.y += (target.y - current.y) * factor;

        if (imageContainerRef.current) {
          gsap.set(imageContainerRef.current, {
            x: current.x,
            y: current.y,
          });
        }
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [safeLerp, isCoarsePointer]);

  const setRowRef = (index: number) => (el: any) => {
    rowRefs.current[index] = el;
  };

  const getTargetTextColor = (element: Element | null, fallback: string) => {
    if (!element) return fallback;
    const computed = window.getComputedStyle(element).color;
    return computed || fallback;
  };

  const cancelRowTweens = (index: number) => {
    const rowEl = rowRefs.current[index];
    if (!rowEl) return;
    const textEls = rowEl.querySelectorAll(".item-client, .item-platform, .item-services, .item-date");
    textEls.forEach((el: any) => gsap.killTweensOf(el));
  };

  const animateRowText = (index: number, isActive: boolean) => {
    const rowEl = rowRefs.current[index];
    if (!rowEl) return;

    cancelRowTweens(index);
    const textEls = rowEl.querySelectorAll(".item-client, .item-platform, .item-services, .item-date");
    const targetColor = isActive
      ? ACTIVE_ROW_TEXT_COLOR
      : getTargetTextColor(rowEl, INACTIVE_ROW_TEXT_COLOR);

    if (reduceMotionRef.current) {
      textEls.forEach((el: any) => gsap.set(el, { color: targetColor }));
      return;
    }

    gsap.to(textEls, {
      color: targetColor,
      duration: safeSmoothness,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const moveHighlightBar = (index: number) => {
    const rowEl = rowRefs.current[index];
    const tableEl = tableRef.current;
    const highlightEl = highlightRef.current;
    if (!rowEl || !tableEl || !highlightEl) return;

    const rowRect = rowEl.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const top = rowRect.top - tableRect.top;
    const height = rowRect.height;

    if (reduceMotionRef.current) {
      gsap.set(highlightEl, {
        top,
        height,
        opacity: 1,
      });
      return;
    }

    gsap.to(highlightEl, {
      top,
      height,
      opacity: 1,
      duration: safeSmoothness,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const hideHighlightBar = () => {
    const highlightEl = highlightRef.current;
    if (!highlightEl) return;

    if (reduceMotionRef.current) {
      gsap.set(highlightEl, { opacity: 0 });
      return;
    }

    gsap.to(highlightEl, {
      opacity: 0,
      duration: safeSmoothness,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handlePointerMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isCoarsePointer || reduceMotionRef.current) return;
    const tableEl = tableRef.current;
    if (!tableEl) return;

    const rect = tableEl.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    pointerTargetRef.current = {
      x: x * IMAGE_OFFSET_MULTIPLIER * 0.05,
      y: y * IMAGE_OFFSET_MULTIPLIER * 0.05,
    };
  };

  const handleMouseEnter = (index: number) => {
    if (isCoarsePointer) return;

    pendingLeaveRef.current[index] = false;
    const activeIndex = activeIndexRef.current;

    if (activeIndex !== null && activeIndex !== index) {
      pendingLeaveRef.current[activeIndex] = true;
      animateRowText(activeIndex, false);

      const prevImage = imageRefs.current[activeIndex];
      if (prevImage) {
        gsap.killTweensOf(prevImage);
        gsap.set(prevImage, {
          clipPath: IMAGE_HIDDEN_CLIP_PATH,
          visibility: IMAGE_VISIBILITY_HIDDEN,
        });
      }
    }

    activeIndexRef.current = index;
    moveHighlightBar(index);
    animateRowText(index, true);

    const imgEl = imageRefs.current[index];
    if (!imgEl) return;

    zIndexRef.current += 1;
    const currentGeneration = (tweenGenerationRef.current[index] || 0) + 1;
    tweenGenerationRef.current[index] = currentGeneration;

    gsap.killTweensOf(imgEl);
    gsap.set(imgEl, {
      zIndex: zIndexRef.current,
      visibility: IMAGE_VISIBILITY_VISIBLE,
    });

    if (reduceMotionRef.current) {
      gsap.set(imgEl, { clipPath: IMAGE_VISIBLE_CLIP_PATH });
      return;
    }

    gsap.fromTo(
      imgEl,
      { clipPath: IMAGE_HIDDEN_CLIP_PATH },
      {
        clipPath: IMAGE_VISIBLE_CLIP_PATH,
        duration: safeDuration,
        ease: "power3.inOut",
        onComplete: () => {
          if (
            pendingLeaveRef.current[index] &&
            tweenGenerationRef.current[index] === currentGeneration
          ) {
            gsap.set(imgEl, {
              clipPath: IMAGE_HIDDEN_CLIP_PATH,
              visibility: IMAGE_VISIBILITY_HIDDEN,
            });
            pendingLeaveRef.current[index] = false;
          }
        },
      }
    );
  };

  const handleMouseLeave = (index: number) => {
    if (isCoarsePointer) return;

    pendingLeaveRef.current[index] = true;
    animateRowText(index, false);

    if (activeIndexRef.current === index) {
      activeIndexRef.current = null;
      hideHighlightBar();
    }

    const imgEl = imageRefs.current[index];
    if (!imgEl) return;

    const currentGeneration = (tweenGenerationRef.current[index] || 0) + 1;
    tweenGenerationRef.current[index] = currentGeneration;

    if (reduceMotionRef.current) {
      gsap.set(imgEl, {
        clipPath: IMAGE_HIDDEN_CLIP_PATH,
        visibility: IMAGE_VISIBILITY_HIDDEN,
      });
      pendingLeaveRef.current[index] = false;
      return;
    }

    gsap.to(imgEl, {
      clipPath: IMAGE_HIDDEN_CLIP_PATH,
      duration: safeDuration,
      ease: "power3.inOut",
      onComplete: () => {
        if (tweenGenerationRef.current[index] === currentGeneration) {
          gsap.set(imgEl, { visibility: IMAGE_VISIBILITY_HIDDEN });
          pendingLeaveRef.current[index] = false;
        }
      },
    });
  };

  return (
    <section
      id="certificates"
      ref={sectionRef}
      aria-label="Certificates and Credentials"
      style={{ backgroundColor: bgColor }}
      className={`relative isolate flex h-[100dvh] min-h-[100dvh] w-full flex-col justify-between overflow-hidden text-white py-4 sm:py-6 lg:py-8 ${jakarta.className} ${className}`}
    >
      {/* Background Ambience & Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 -inset-y-[12%] z-0 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_60px)]" />
      <div className="cert-spotlight pointer-events-none absolute left-0 top-0 z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_45%,transparent_70%)]" />

      {/* Header Container */}
      <header
        ref={headerRef}
        className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center gap-2 text-center px-4 sm:px-6"
      >
        <div className="cert-header-item flex items-center gap-2.5">
          <span className="cert-dot h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
          <span className={`text-xs font-bold uppercase tracking-[0.28em] text-zinc-300 ${spaceGrotesk.className}`}>
            Accredited Credentials
          </span>
        </div>

        <h2
          ref={titleRef}
          className={`cert-title text-[clamp(1.8rem,min(5vw,6.5dvh),3.6rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-white ${syne.className}`}
        >
          <span data-split className="block">
            Certificates
          </span>
          <span
            data-split
            className="cert-gradient block bg-[linear-gradient(100deg,#ffffff_0%,#d4d4d8_28%,#71717a_52%,#e4e4e7_78%,#ffffff_100%)] bg-[length:260%_100%] bg-clip-text text-transparent"
          >
            I Have Mastered
          </span>
        </h2>

        <span className="cert-divider block h-px w-16 origin-center bg-linear-to-r from-transparent via-white/60 to-transparent sm:w-24" />

        <p className="cert-header-item max-w-md text-xs leading-relaxed text-zinc-400 sm:max-w-xl sm:text-sm">
          Scanned & verified certifications across AI Agents, Machine Learning, Meta JavaScript & Cloud Infrastructures. Hover or tap to preview credentials.
        </p>
      </header>

      {/* Main Interactive Certificate List Table */}
      <main className="relative z-20 mx-auto my-auto w-full max-w-6xl px-4 sm:px-6 overflow-y-auto max-h-[calc(100dvh-170px)] sm:max-h-[calc(100dvh-190px)] scrollbar-none">
        <div
          ref={tableRef}
          onPointerMove={handlePointerMove}
          className="relative w-full overflow-hidden border border-white/10 bg-[#111113]/80 backdrop-blur-md select-none"
        >
          {/* Highlight Bar */}
          <div
            ref={highlightRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-0 opacity-0 bg-white/10 transition-colors"
          />

          {/* Floating Image Container (Desktop Hover Preview) */}
          {!isCoarsePointer && (
            <div
              ref={imageContainerRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 md:block"
              style={{
                width: `${BASE_IMAGE_WIDTH_REM * safeImageSize}rem`,
                height: `${BASE_IMAGE_HEIGHT_REM * safeImageSize}rem`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`img-${index}`}
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                  className="absolute inset-0 overflow-hidden border border-white/20 bg-black shadow-2xl rounded-sm"
                  style={{
                    visibility: IMAGE_VISIBILITY_HIDDEN,
                    clipPath: IMAGE_HIDDEN_CLIP_PATH,
                  }}
                >
                  <Image
                    src={item.img}
                    alt={item.client}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    loading="lazy"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white">
                    <span className="truncate">{item.client}</span>
                    <span className="text-zinc-400 uppercase text-[9px]">{item.platform}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List Headers */}
          <div className={`grid grid-cols-12 gap-2 border-b border-white/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 ${spaceGrotesk.className}`}>
            <span className="col-span-1 hidden sm:block text-zinc-500">#</span>
            <span className="col-span-12 sm:col-span-4">Course / Certificate</span>
            <span className="col-span-4 sm:col-span-3 hidden sm:block">Platform</span>
            <span className="col-span-4 sm:col-span-3 hidden md:block">Skills Acquired</span>
            <span className="col-span-1 text-right hidden sm:block">Action</span>
          </div>

          {/* List Items */}
          <div className="divide-y divide-white/10">
            {items.map((item, index) => (
              <div
                key={index}
                ref={setRowRef(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className="group relative grid grid-cols-12 items-center gap-2 px-4 py-3.5 sm:py-4 transition-colors cursor-pointer"
              >
                {/* Index */}
                <span className="col-span-1 hidden sm:block text-xs font-mono text-zinc-500">
                  0{index + 1}
                </span>

                {/* Course Name & Details */}
                <div className="col-span-12 sm:col-span-4 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className={`item-client text-sm sm:text-base font-bold text-white transition-colors ${spaceGrotesk.className}`}>
                      {item.client}
                    </h3>
                  </div>
                  {item.platform && (
                    <span className="item-platform text-[10px] uppercase tracking-wider text-zinc-400 sm:hidden">
                      {item.platform} {item.date ? `· ${item.date}` : ""}
                    </span>
                  )}
                </div>

                {/* Platform Badge */}
                <div className="col-span-3 hidden sm:flex items-center gap-1.5">
                  <span className={`item-platform text-xs font-semibold uppercase tracking-wider text-zinc-300 ${spaceGrotesk.className}`}>
                    {item.platform}
                  </span>
                  {item.date && (
                    <span className="item-date text-[10px] text-zinc-500">
                      ({item.date})
                    </span>
                  )}
                </div>

                {/* Services / What was done */}
                <div className="col-span-3 hidden md:block">
                  <p className="item-services text-xs text-zinc-400 line-clamp-1 leading-normal">
                    {item.services}
                  </p>
                </div>

                {/* Action Links (PDF / Verification) */}
                <div className="col-span-1 hidden sm:flex items-center justify-end gap-2">
                  {item.pdf && (
                    <a
                      href={item.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="View PDF Certificate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  )}
                  {item.verifyUrl && (
                    <a
                      href={item.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Verify Credential Online"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="relative z-20 text-center px-4 text-[11px] text-zinc-500 uppercase tracking-widest font-mono">
        Total Verified Certificates: {items.length}
      </footer>
    </section>
  );
}