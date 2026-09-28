"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import gsap from "gsap";

import {
  CANVAS_CONFIG,
  HERO_CONTENT,
  MOTION,
  PORTRAIT,
  playfair,
  spaceGrotesk,
} from "./hero.constants";

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

/**
 * Custom hook to dynamically process the portrait JPEG image on an offscreen HTML canvas,
 * removing the white/light background rectangle and generating a 100% transparent PNG cutout.
 */
function useTransparentPortrait(src: string) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Sample background color near corners (top-left & top-right)
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate color distance from sampled background corner
          const colorDist = Math.sqrt(
            (r - bgR) * (r - bgR) +
            (g - bgG) * (g - bgG) +
            (b - bgB) * (b - bgB)
          );

          // Near white / light paper background threshold check
          const isWhiteBackground = r > 218 && g > 218 && b > 218;

          if (colorDist < 45 || isWhiteBackground) {
            const avgLightness = (r + g + b) / 3;
            if (avgLightness > 235) {
              data[i + 3] = 0; // Completely transparent
            } else {
              // Smooth edge anti-aliasing / feathering
              const alphaRatio = Math.max(0, (235 - avgLightness) / 20);
              data[i + 3] = Math.floor(alphaRatio * 255);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedSrc(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Portrait background processing fallback:", err);
      }
    };
  }, [src]);

  return processedSrc;
}

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

  // Automatically remove white background rectangle to turn image into a seamless cutout
  const transparentPortraitSrc = useTransparentPortrait(portrait.src);

  useLayoutEffect(() => {
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
        gsap.fromTo(portraitReveal, { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION.reducedFadeDuration, ease: "power1.out" });
        gsap.to(rectState, { opacity: 1, duration: MOTION.reducedRectFadeDuration, ease: "none", onUpdate: draw });
        return;
      }

      gsap.set(portraitReveal, { autoAlpha: 0, scale: 0.95 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Portrait Image Entrance
      tl.to(
        portraitReveal,
        {
          autoAlpha: 1,
          scale: 1,
          duration: MOTION.portraitRiseDuration,
          ease: "power2.out",
        },
        0.2
      );

      // Canvas Rectangles Fade
      tl.to(
        rectState,
        { opacity: 1, duration: MOTION.rectFadeDuration, ease: "power2.out", onUpdate: draw },
        "-=0.7"
      );

      // 1. GSAP Right-to-Left Fast & Seamless Loop for GOHAR (left) and ABBAS (right) Behind Portrait
      if (nameTrack) {
        gsap.to(nameTrack, {
          xPercent: -50,
          repeat: -1,
          duration: 10,
          ease: "none",
        });
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

    // Canvas animation ticker loop
    if (!reduced) {
      const tickFn: TickFn = (_time, deltaTime) => {
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
      resizeObserver.disconnect();
      if (tick) gsap.ticker.remove(tick);
      removeMove?.();
      ctx.revert();
    };
  }, []);

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
      <div className="absolute top-10 sm:top-12 inset-x-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4">
        <div className={`flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-black/85 bg-[#f4f1ea]/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-black/10 shadow-md ${spaceGrotesk.className}`}>
          <span>FULL-STACK WEB DEV</span>
          <span className="text-black/35">•</span>
          <span>MOBILE APP DEVELOPER</span>
        </div>
      </div>

      {/* L1 — Separated GOHAR (left) and ABBAS (right) Moving Right to Left BEHIND the Portrait Cutout */}
      <div className="absolute top-[18vh] sm:top-[14vh] md:top-[12vh] inset-x-0 z-10 overflow-hidden pointer-events-none select-none">
        <div
          ref={nameTrackRef}
          className="flex whitespace-nowrap will-change-transform"
        >
          {/* Set 1 */}
          <div className="flex items-center gap-24 sm:gap-40 md:gap-60 lg:gap-80 pr-24 sm:pr-40 md:pr-60 lg:pr-80 shrink-0">
            <span className={`${playfair.className} text-[clamp(4.5rem,14vw,14rem)] font-black tracking-[-0.04em] uppercase text-black/90 leading-none drop-shadow-sm`}>
              GOHAR
            </span>
            <span className={`${playfair.className} text-[clamp(4.5rem,14vw,14rem)] font-black tracking-[-0.04em] uppercase text-black/90 leading-none drop-shadow-sm`}>
              ABBAS
            </span>
          </div>

          {/* Set 2 for 100% seamless, delay-free infinite loop */}
          <div className="flex items-center gap-24 sm:gap-40 md:gap-60 lg:gap-80 pr-24 sm:pr-40 md:pr-60 lg:pr-80 shrink-0" aria-hidden="true">
            <span className={`${playfair.className} text-[clamp(4.5rem,14vw,14rem)] font-black tracking-[-0.04em] uppercase text-black/90 leading-none drop-shadow-sm`}>
              GOHAR
            </span>
            <span className={`${playfair.className} text-[clamp(4.5rem,14vw,14rem)] font-black tracking-[-0.04em] uppercase text-black/90 leading-none drop-shadow-sm`}>
              ABBAS
            </span>
          </div>
        </div>
      </div>

      {/* L2 — Seamless Transparent Portrait Cutout (Positioned IN FRONT of the scrolling name) */}
      <div
        ref={portraitParallaxRef}
        className="absolute inset-0 z-20 h-full w-full flex items-end justify-center pt-24 pb-12 sm:pb-14 px-6 pointer-events-none will-change-transform"
      >
        <div
          ref={portraitRevealRef}
          className="relative h-[56vh] sm:h-[64vh] md:h-[72vh] w-auto max-w-[90vw] flex items-end justify-center origin-bottom will-change-transform"
        >
          <img
            src={transparentPortraitSrc}
            alt="Gohar Abbas"
            draggable={false}
            className="block h-full w-auto max-w-full object-contain select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] [mask-image:linear-gradient(to_bottom,black_94%,transparent_100%)]"
          />
        </div>
      </div>

      {/* L3 — Background Animation: Blueprint grid & floating canvas geometries float BEHIND */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_40px)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_40px)]" />
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      </div>

      {/* L4 — Infinite GSAP Marquee Text Bar Moving Right to Left Below the Image */}
      <div className={`absolute bottom-12 sm:bottom-14 inset-x-0 z-30 overflow-hidden bg-black text-white py-2.5 sm:py-3 shadow-2xl select-none ${spaceGrotesk.className}`}>
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
      <div className={`absolute inset-0 z-30 pointer-events-none ${spaceGrotesk.className}`}>
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
