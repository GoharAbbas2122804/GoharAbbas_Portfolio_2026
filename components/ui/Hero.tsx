"use client";

import { useLayoutEffect, useRef } from "react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import gsap from "gsap";

import {
  CANVAS_CONFIG,
  HERO_CONTENT,
  MOTION,
  PORTRAIT,
  playfair,
  spaceGrotesk,
} from "./hero.constants";
import { usePreloaderDone } from "@/components/preloader";

// ---------------------------------------------------------------------------
// Canvas rectangle field types
// ---------------------------------------------------------------------------
type FloatRect = {
  x: number;
  baseY: number;
  w: number;
  h: number;
  rotation: number;
  speed: number;
  bobAmp: number;
  bobFreq: number;
  phase: number;
  filled: boolean;
};

type TickFn = (time: number, deltaTime: number, frame: number, elapsed: number) => void;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export type HeroProps = {
  /** Extra classes merged onto the section. */
  className?: string;
  /** Display name shown in Awwwards editorial style. */
  name?: string;
  /** Bottom-left scroll cue label. */
  scrollLabel?: string;
  /** Bottom-right copyright label. */
  copyrightLabel?: string;
  /** Right-edge vertical badge label. */
  badgeLabel?: string;
  /** Portrait image (landscape/portrait bust). */
  portrait?: StaticImageData;
};

export default function Hero({
  className = "",
  name = HERO_CONTENT.name,
  scrollLabel = HERO_CONTENT.scrollLabel,
  copyrightLabel = HERO_CONTENT.copyrightLabel,
  badgeLabel = HERO_CONTENT.badgeLabel,
  portrait = PORTRAIT,
}: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portraitParallaxRef = useRef<HTMLDivElement>(null);
  const portraitRevealRef = useRef<HTMLDivElement>(null);
  const nameTrackRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);


  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || "GOHAR";
  const lastName = nameParts.slice(1).join(" ") || "ABBAS";

  const isPreloaderDone = usePreloaderDone();

  useLayoutEffect(() => {
    if (!isPreloaderDone) {
      return;
    }

    const root = rootRef.current;
    const canvas = canvasRef.current;
    const portraitLayer = portraitParallaxRef.current;
    const portraitReveal = portraitRevealRef.current;
    const arrow = arrowRef.current;
    const marqueeTrack = marqueeTrackRef.current;
    const nameTrack = nameTrackRef.current;

    if (!root || !canvas || !portraitLayer || !portraitReveal || !arrow) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const rectState = { opacity: 0, time: 0 };
    let rects: FloatRect[] = [];
    let width = 0;
    let height = 0;
    let ctx2d: CanvasRenderingContext2D | null = null;
    let removeMove: (() => void) | null = null;
    let tick: TickFn | null = null;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx2d = canvas.getContext("2d");
      ctx2d?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildRects = () => {
      const count =
        width < CANVAS_CONFIG.mobileBreakpoint
          ? CANVAS_CONFIG.mobileCount
          : CANVAS_CONFIG.desktopCount;
      const filledCount = Math.round(count * CANVAS_CONFIG.filledRatio);

      rects = Array.from({ length: count }, (_, i) => {
        const filled = i < filledCount;
        return {
          x: rand(0, width),
          baseY: rand(0, height),
          w: filled
            ? rand(CANVAS_CONFIG.sliver.widthMin, CANVAS_CONFIG.sliver.widthMax)
            : rand(CANVAS_CONFIG.size.min, CANVAS_CONFIG.size.max),
          h: filled
            ? rand(CANVAS_CONFIG.sliver.heightMin, CANVAS_CONFIG.sliver.heightMax)
            : rand(CANVAS_CONFIG.size.min, CANVAS_CONFIG.size.max),
          rotation: rand(CANVAS_CONFIG.rotation.min, CANVAS_CONFIG.rotation.max),
          speed: rand(CANVAS_CONFIG.speed.min, CANVAS_CONFIG.speed.max),
          bobAmp: rand(CANVAS_CONFIG.bob.amplitudeMin, CANVAS_CONFIG.bob.amplitudeMax),
          bobFreq: rand(CANVAS_CONFIG.bob.frequencyMin, CANVAS_CONFIG.bob.frequencyMax),
          phase: rand(0, Math.PI * 2),
          filled,
        };
      });
    };

    const draw = () => {
      if (!ctx2d) return;
      ctx2d.clearRect(0, 0, width, height);
      ctx2d.globalAlpha = rectState.opacity;
      ctx2d.strokeStyle = "rgba(0,0,0,0.85)";
      ctx2d.fillStyle = "rgba(0,0,0,0.85)";
      ctx2d.lineWidth = 1;

      for (const r of rects) {
        const y = r.baseY + Math.sin(rectState.time * r.bobFreq + r.phase) * r.bobAmp;
        ctx2d.save();
        ctx2d.translate(r.x, y);
        ctx2d.rotate((r.rotation * Math.PI) / 180);
        ctx2d.beginPath();
        ctx2d.rect(-r.w / 2, -r.h / 2, r.w, r.h);
        if (r.filled) ctx2d.fill();
        else ctx2d.stroke();
        ctx2d.restore();
      }
    };

    setupCanvas();
    buildRects();
    draw();

    // GSAP Master Timeline & Motion
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.to(rectState, { opacity: 1, duration: MOTION.reducedRectFadeDuration, ease: "none", onUpdate: draw });
        return;
      }

      gsap.set(portraitReveal, { opacity: 1, scale: 0.96 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Portrait Image Entrance
      tl.to(
        portraitReveal,
        {
          scale: 1,
          duration: MOTION.portraitRiseDuration,
          ease: "power2.out",
        },
        0.1
      );

      // Canvas Rectangles Fade
      tl.to(
        rectState,
        { opacity: 1, duration: MOTION.rectFadeDuration, ease: "power2.out", onUpdate: draw },
        "-=0.7"
      );

      // 1. GSAP Right-to-Left 100% Mathematically Seamless Infinite Loop (Behind Portrait)
      if (nameTrack) {
        gsap.fromTo(
          nameTrack,
          { xPercent: 0 },
          {
            xPercent: -50,
            repeat: -1,
            duration: 24,
            ease: "none",
            force3D: true,
          }
        );
      }

      // 2. GSAP Infinite Right-to-Left Marquee for Bottom Bar
      if (marqueeTrack) {
        gsap.to(marqueeTrack, {
          xPercent: -50,
          repeat: -1,
          duration: 22,
          ease: "none",
        });
      }

      // Scroll indicator loop
      gsap.to(arrow, {
        y: MOTION.scrollBob.distance,
        duration: MOTION.scrollBob.duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Mouse Parallax Effect
      if (finePointer) {
        const quick = MOTION.parallax.duration;
        const canvasXTo = gsap.quickTo(canvas, "x", { duration: quick, ease: "power3.out", force3D: true });
        const canvasYTo = gsap.quickTo(canvas, "y", { duration: quick, ease: "power3.out", force3D: true });
        const portraitXTo = gsap.quickTo(portraitLayer, "x", { duration: quick, ease: "power3.out", force3D: true });
        const portraitYTo = gsap.quickTo(portraitLayer, "y", { duration: quick, ease: "power3.out", force3D: true });

        const onMove = (e: MouseEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;

          canvasXTo(nx * MOTION.parallax.canvasDepth);
          canvasYTo(ny * MOTION.parallax.canvasDepth);
          portraitXTo(nx * MOTION.parallax.portraitDepth);
          portraitYTo(ny * MOTION.parallax.portraitDepth);
        };

        window.addEventListener("mousemove", onMove);
        removeMove = () => window.removeEventListener("mousemove", onMove);
      }
    }, root);

    let isHeroVisible = true;
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          isHeroVisible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      io.observe(root);
    }

    // Canvas animation ticker loop
    if (!reduced) {
      const tickFn: TickFn = (_time, deltaTime) => {
        if (!isHeroVisible) return;
        const s = deltaTime / 1000;
        rectState.time += s;
        for (const r of rects) {
          r.x += r.speed * s;
          if (r.x - r.w / 2 > width) r.x = -r.w;
        }
        draw();
      };
      tick = tickFn;
      gsap.ticker.add(tickFn);
    }

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
      buildRects();
      if (reduced) draw();
    });
    resizeObserver.observe(root);

    return () => {
      io?.disconnect();
      resizeObserver.disconnect();
      if (tick) gsap.ticker.remove(tick);
      removeMove?.();
      ctx.revert();
    };
  }, [isPreloaderDone]);

  const marqueeItems = [
    "✦ GOHAR ABBAS",
    "✦ FULL-STACK WEB DEVELOPER",
    "✦ MOBILE APP DEVELOPER",
    "✦ UI/UX ARCHITECT",
    "✦ NEXT.JS SPECIALIST",
    "✦ GSAP & THREE.JS ANIMATIONS",
    "✦ AVAILABLE FOR WORK 2026",
  ];

  return (
    <section
      ref={rootRef}
      aria-label="Hero"
      className={`relative h-svh w-full overflow-hidden bg-[#f4f1ea] text-black ${className}`}
    >
      {/* L0 — Top Detailing Header Badge */}
      <div data-hero-reveal className="hidden md:flex absolute top-10 sm:top-12 inset-x-0 z-30 flex-col items-center justify-center pointer-events-none px-4">
        <div className={`flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-black/85 bg-[#f4f1ea]/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-black/10 shadow-md ${spaceGrotesk.className}`}>
          <span>FULL-STACK WEB DEV</span>
          <span className="text-black/35">•</span>
          <span>MOBILE APP DEVELOPER</span>
        </div>
      </div>

      {/* L1 — Name & Title Moving Right to Left BEHIND the Portrait Cutout (Centered vertically in hero section) */}
      <div data-hero-reveal className="absolute top-1/2 -translate-y-1/2 inset-x-0 z-10 overflow-hidden pointer-events-none select-none">
        <div
          ref={nameTrackRef}
          className="flex whitespace-nowrap will-change-transform"
        >
          {/* Group 1: GOHAR ABBAS SOFTWARE ENGINEER */}
          <h1 aria-label="Gohar Abbas — Software Engineer" className="m-0 flex items-center shrink-0 gap-6 sm:gap-10 md:gap-16 lg:gap-24 pr-6 sm:pr-10 md:pr-16 lg:pr-24">
            {["GOHAR", "ABBAS", "SOFTWARE", "ENGINEER"].map((word, i) => (
              <span
                key={`hw1-${i}`}
                className={`${playfair.className} text-[clamp(3.5rem,10vw,12.5rem)] font-black tracking-[-0.03em] uppercase text-black/90 leading-none drop-shadow-sm`}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Group 2: Exact identical duplicate for 100% seamless -50% loop */}
          <div className="flex items-center shrink-0 gap-6 sm:gap-10 md:gap-16 lg:gap-24 pr-6 sm:pr-10 md:pr-16 lg:pr-24" aria-hidden="true">
            {["GOHAR", "ABBAS", "SOFTWARE", "ENGINEER"].map((word, i) => (
              <span
                key={`hw2-${i}`}
                className={`${playfair.className} text-[clamp(3.5rem,10vw,12.5rem)] font-black tracking-[-0.03em] uppercase text-black/90 leading-none drop-shadow-sm`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* L2 — Seamless Transparent Portrait Cutout (Positioned IN FRONT of the scrolling name) */}
      <div
        data-hero-reveal
        ref={portraitParallaxRef}
        className="absolute inset-0 z-20 h-full w-full flex items-end justify-center pb-12 sm:pb-14 px-4 sm:px-6 pointer-events-none will-change-transform"
      >
        <div
          ref={portraitRevealRef}
          className="relative h-[50vh] sm:h-[58vh] md:h-[66vh] lg:h-[74vh] max-h-[780px] w-auto max-w-[92vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[900px] flex items-end justify-center origin-bottom will-change-transform"
        >
          <Image
            src={portrait}
            alt="Portrait of Gohar Abbas"
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 75vw, 900px"
            width={portrait.width}
            height={portrait.height}
            priority
            fetchPriority="high"
            draggable={false}
            className="block h-full w-auto max-w-full object-contain object-bottom select-none filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.18)] [mask-image:linear-gradient(to_bottom,black_92%,transparent_100%)]"
            style={{ height: "100%", width: "auto" }}
          />
        </div>
      </div>

      {/* L3 — Background Animation: Blueprint grid & floating canvas geometries float BEHIND */}
      <div data-hero-reveal className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_40px)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_40px)]" />
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      </div>

      {/* L4 — Infinite GSAP Marquee Text Bar Moving Right to Left Below the Image */}
      <div data-hero-reveal className={`absolute bottom-12 sm:bottom-14 inset-x-0 z-30 overflow-hidden bg-black text-white py-2.5 sm:py-3 shadow-2xl select-none ${spaceGrotesk.className}`}>
        <div
          ref={marqueeTrackRef}
          className="flex whitespace-nowrap will-change-transform text-xs sm:text-sm font-bold tracking-[0.25em] uppercase"
        >
          <div className="flex items-center gap-8 px-4 shrink-0">
            {marqueeItems.map((item, index) => (
              <span key={`mq-1-${index}`} className="flex items-center gap-8">
                <span>{item}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-8 px-4 shrink-0" aria-hidden="true">
            {marqueeItems.map((item, index) => (
              <span key={`mq-2-${index}`} className="flex items-center gap-8">
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* L5 — Chrome & Micro-labels */}
      <div data-hero-reveal className={`absolute inset-0 z-30 pointer-events-none ${spaceGrotesk.className}`}>
        <div className="absolute bottom-3 left-6 flex items-center gap-3 sm:bottom-3 sm:left-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
            {scrollLabel}
          </span>
          <svg
            ref={arrowRef}
            width="10"
            height="22"
            viewBox="0 0 12 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="text-black"
          >
            <path d="M6 0V26" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1 21L6 26L11 21" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <span className="absolute bottom-3 right-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-black sm:bottom-3 sm:right-10">
          {copyrightLabel}
        </span>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-black px-2 py-6 rounded-l-md shadow-md">
          <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl]">
            {badgeLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
