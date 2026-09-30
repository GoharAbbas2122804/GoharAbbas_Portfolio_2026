"use client";

/**
 * GOHAR preloader: one self-contained file.
 *
 *  - Next.js App Router (client component) + Tailwind (inline classes) + GSAP
 *  - The name is the progress bar: each letter fills from the bottom, in a wave
 *  - Odometer counter 001 → 100 in the bottom-right corner
 *  - Progress is REAL (fonts + page load + your critical lists below), never
 *    faster than MIN_DURATION and never stuck longer than HARD_TIMEOUT
 *  - When the hero is safe it quietly warms the rest of the site in the background
 *  - Plays once per browser session; respects prefers-reduced-motion
 *
 * Mount it once, at the top of <body> in app/layout.tsx:   <Preloader />
 * Other components can wait for the curtain with:          usePreloaderDone()
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { Anton } from "next/font/google";
import gsap from "gsap";
import { PORTRAIT } from "@/components/ui/hero.constants";

/* ================================================================== */
/* 1. CONFIG: tweak everything here                                    */
/* ================================================================== */

const NAME = "GOHAR";
const ROLE = "Full-stack developer";
const CLOCK = { label: "PKT", timeZone: "Asia/Karachi" };
const PHASES = ["Getting ready", "Loading visuals", "Almost there", "Welcome"];

const MIN_DURATION = 2.4; // seconds: the counter never finishes faster than this
const HARD_TIMEOUT = 10_000; // ms: safety valve so nobody is ever stuck on the loader
const WAVE = 0.06; // how far each letter's fill lags the previous letter
const SEEN_KEY = "gohar:preloader-seen"; // sessionStorage flag (also used in the <head> script)

// Matched to the hero background (#f4f1ea) so the curtain reveal feels deliberate & seamless.
const PALETTE = {
  curtain: "#f4f1ea",
  ink: "#111111",
  outline: "rgba(17,17,17,0.35)",
};

/**
 * WHAT THE COUNTER WAITS FOR (keep this list small: only what the first screen needs)
 * Use the EXACT URLs your hero renders, otherwise the browser downloads twice.
 */
const CRITICAL_IMAGES: string[] = [
  PORTRAIT.src,
];

// Statically imported hero components removed; kept empty for truly async chunks
const CRITICAL_CHUNKS: Array<() => Promise<unknown>> = [];

/**
 * WHAT LOADS QUIETLY AFTER THE HERO IS SAFE (never blocks the counter)
 * A dynamic import() warms the module cache, so a later
 * next/dynamic(() => import("same/path")) resolves instantly.
 */
const BACKGROUND_CHUNKS: Array<() => Promise<unknown>> = [
  () => import("@/components/ui/timeline"),
  () => import("@/components/ui/services"),
  () => import("@/components/ui/work2026"),
  () => import("@/components/ui/certificates"),
  () => import("@/components/ui/LatestServices"),
  () => import("@/components/ui/testimonials"),
  () => import("@/components/ui/cta_section"),
  () => import("@/components/ui/footer"),
];

// Only raw URLs rendered via plain <img> (work2026 cover art)
const BACKGROUND_IMAGES: string[] = [
  "/assets/projectImages/adminPanel.jpg",
  "/assets/projectImages/Flow_Productivity_app.png",
  "/assets/projectImages/layers_landingPage.jpeg",
  "/assets/projectImages/metaData_keyboard_website.jpg",
];

// Display face for the name + counter.
const display = Anton({ weight: "400", subsets: ["latin"], display: "swap" });

/* ================================================================== */
/* 2. LOADING ENGINE: weighted, real progress                          */
/* ================================================================== */

type Report = (fraction: number) => void;
type Task = { id: string; weight: number; run: (report: Report) => Promise<unknown> };

const fontsTask: Task = {
  id: "fonts",
  weight: 1,
  run: async () => {
    if ("fonts" in document) await document.fonts.ready;
  },
};

// Everything in the initial HTML (hero <img>, CSS, JS). Capped so a slow
// third-party script can't hold the loader hostage.
const pageLoadTask: Task = {
  id: "page",
  weight: 2,
  run: () =>
    new Promise<void>((resolve) => {
      if (document.readyState === "complete") return resolve();
      window.addEventListener("load", () => resolve(), { once: true });
      window.setTimeout(resolve, 5000);
    }),
};

function imageTask(urls: string[], weight = 4): Task {
  return {
    id: "images",
    weight,
    run: async (report) => {
      let done = 0;
      await Promise.all(
        urls.map(async (src) => {
          try {
            const img = new Image();
            img.decoding = "async";
            img.src = src;
            await img.decode();
          } catch {
            /* a missing image must never trap the visitor */
          } finally {
            report(++done / urls.length);
          }
        })
      );
    },
  };
}

function chunkTask(loaders: Array<() => Promise<unknown>>, weight = 3): Task {
  return {
    id: "chunks",
    weight,
    run: async (report) => {
      let done = 0;
      await Promise.all(
        loaders.map(async (load) => {
          try {
            await load();
          } catch {
            /* the section will retry when it actually renders */
          } finally {
            report(++done / loaders.length);
          }
        })
      );
    },
  };
}

/** Runs all tasks in parallel; resolves when all finish OR the timeout hits. */
function runPreload(
  tasks: Task[],
  onProgress: (progress: number) => void,
  timeoutMs: number
): Promise<void> {
  const fractions = new Map<string, number>(tasks.map((t) => [t.id, 0]));
  const total = tasks.reduce((sum, t) => sum + t.weight, 0) || 1;

  const emit = () => {
    let sum = 0;
    for (const t of tasks) sum += t.weight * (fractions.get(t.id) ?? 0);
    onProgress(Math.min(1, sum / total));
  };

  const jobs = tasks.map((t) =>
    t
      .run((f) => {
        const prev = fractions.get(t.id) ?? 0;
        fractions.set(t.id, Math.min(1, Math.max(prev, f)));
        emit();
      })
      .catch(() => {})
      .finally(() => {
        fractions.set(t.id, 1);
        emit();
      })
  );

  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(() => {
      tasks.forEach((t) => fractions.set(t.id, 1));
      emit();
      resolve();
    }, timeoutMs);
    Promise.all(jobs).then(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
}

function whenIdle(fn: () => void, timeout: number) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(fn, { timeout });
  } else {
    window.setTimeout(fn, 200);
  }
}

/** Quietly fetch the rest of the site: JS chunks first, images after at low priority. */
function loadInBackground() {
  whenIdle(() => BACKGROUND_CHUNKS.forEach((load) => load().catch(() => {})), 2000);
  whenIdle(() => {
    BACKGROUND_IMAGES.forEach((src) => {
      const img = new Image();
      img.setAttribute("fetchpriority", "low");
      img.decoding = "async";
      img.src = src;
    });
  }, 4000);
}

/* ================================================================== */
/* 3. HOOK: let other components react when the curtain lifts          */
/* ================================================================== */

/** true once the curtain starts lifting (or immediately if already seen this session or on other routes). */
export function usePreloaderDone(): boolean {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [done, setDone] = useState(!isHome);

  useEffect(() => {
    if (!isHome || document.documentElement.dataset.plDone === "true") {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener("preloader:done", onDone, { once: true });
    return () => window.removeEventListener("preloader:done", onDone);
  }, [isHome]);

  return done;
}

/* ================================================================== */
/* 4. COMPONENT                                                        */
/* ================================================================== */

const letters = NAME.split("");
const ROLL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]; // trailing 0 makes the 9 → 0 roll seamless
const HUNDREDS = [0, 1];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function Preloader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!isHome) {
      document.documentElement.dataset.plDone = "true";
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new CustomEvent("preloader:done"));
      setGone(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;

    let announced = false;
    const announce = () => {
      if (announced) return;
      announced = true;
      html.dataset.plDone = "true";
      html.style.overflow = ""; // unlock scroll
      window.dispatchEvent(new CustomEvent("preloader:done"));
    };

    // Reset status on reload so preloader runs every time
    delete html.dataset.plDone;
    delete html.dataset.plSeen;
    try {
      sessionStorage.removeItem(SEEN_KEY);
    } catch {}

    // First visit: start at the top with scroll locked while we load.
    try {
      history.scrollRestoration = "manual";
    } catch {}
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
    const qa = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    const inners = qa<HTMLElement>("[data-char-inner]");
    const fills = qa<HTMLElement>("[data-char-fill]");
    const path = q<SVGPathElement>("[data-curtain-path]");
    const colH = q<HTMLElement>('[data-col="h"]');
    const colT = q<HTMLElement>('[data-col="t"]');
    const colO = q<HTMLElement>('[data-col="o"]');
    const phaseTrack = q<HTMLElement>("[data-phase-track]");
    const clock = q<HTMLElement>("[data-clock]");
    if (!path || !colH || !colT || !colO || !phaseTrack) return;
    const wrapH = colH.parentElement as HTMLElement;
    const wrapT = colT.parentElement as HTMLElement;

    const ctx = gsap.context(() => {}, root);

    /* live clock (small, human detail) */
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: CLOCK.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tickClock = () => {
      if (clock) clock.textContent = `${CLOCK.label} ${fmt.format(new Date())}`;
    };
    tickClock();
    const clockId = window.setInterval(tickClock, 1000);

    /* curtain: an SVG path whose bottom edge we morph on exit */
    const curtain = { y: 101, c: 0 }; // y = bottom edge, c = how much the middle lags
    const drawCurtain = () =>
      path.setAttribute("d", `M-1 -1H101V${curtain.y}Q50 ${curtain.y + curtain.c} -1 ${curtain.y}Z`);

    /* render one frame of the counter, the name fill and the status text */
    const roll = (el: HTMLElement, offset: number, count: number) => {
      el.style.transform = `translate3d(0, ${-(offset * 100) / count}%, 0)`;
    };

    let phaseIdx = 0;
    const render = (p: number) => {
      const v = 1 + p * 99; // 1 → 100
      const ones = v % 10;
      const carry = smooth(clamp01(ones - 9)); // tens only turns as ones passes 9 → 10
      const tens = v >= 100 ? 10 : Math.floor(v / 10) + carry;
      const hundreds = clamp01(v - 99);
      roll(colO, ones, ROLL.length);
      roll(colT, tens, ROLL.length);
      roll(colH, hundreds, HUNDREDS.length);
      wrapT.style.opacity = String(0.25 + 0.75 * clamp01(v - 9)); // dim leading zeros
      wrapH.style.opacity = String(0.25 + 0.75 * hundreds);

      // The name IS the progress bar: each letter fills bottom → top, in a wave.
      const span = 1 - (fills.length - 1) * WAVE;
      fills.forEach((f, i) => {
        const pi = clamp01((p - i * WAVE) / span);
        f.style.clipPath = `inset(${(1 - pi) * 100}% 0 0 0)`;
      });

      const idx = p >= 1 ? 3 : p > 0.75 ? 2 : p > 0.3 ? 1 : 0;
      if (idx !== phaseIdx) {
        phaseIdx = idx;
        gsap.to(phaseTrack, {
          yPercent: -idx * (100 / PHASES.length),
          duration: 0.7,
          ease: "expo.out",
          overwrite: true,
        });
      }
    };

    /* intro: letters rise out of their masks, meta text follows */
    ctx.add(() => {
      gsap.set(inners, { yPercent: 115, rotate: 8, opacity: 1 });
      gsap.set("[data-rise]", { yPercent: 110, opacity: 1 });
      if (reduced) {
        gsap.set(inners, { yPercent: 0, rotate: 0 });
        gsap.set("[data-rise]", { yPercent: 0 });
        return;
      }
      gsap
        .timeline({ delay: 0.1 })
        .to(inners, { yPercent: 0, rotate: 0, duration: 1.15, ease: "expo.out", stagger: 0.07 })
        .to("[data-rise]", { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 0.35);
    });

    /* exit: letters launch up, the curtain peels away with a curved edge */
    const exit = () => {
      loadInBackground(); // hero is safe → warm the rest of the site

      ctx.add(() => {
        if (reduced) {
          announce();
          gsap.to(root, { autoAlpha: 0, duration: 0.4, onComplete: () => setGone(true) });
          return;
        }
        gsap
          .timeline({ onComplete: () => setGone(true) })
          .to("[data-rise]", { yPercent: -130, duration: 0.6, ease: "power3.in", stagger: 0.05 }, "+=0.3")
          .to(inners, { yPercent: -118, rotate: -7, duration: 0.9, ease: "expo.inOut", stagger: 0.06 }, "-=0.25")
          .addLabel("curtain", "-=0.5")
          .to(curtain, { y: -1, duration: 1.2, ease: "expo.inOut", onUpdate: drawCurtain }, "curtain")
          .to(curtain, { c: 28, duration: 0.6, ease: "sine.out", onUpdate: drawCurtain }, "curtain")
          .to(curtain, { c: 0, duration: 0.6, ease: "sine.in", onUpdate: drawCurtain }, "curtain+=0.6")
          // let the page start its own entrance while the curtain is still lifting
          .call(announce, undefined, "curtain+=0.35");
      });
    };

    /* progress = real load, paced so it never feels rushed */
    let target = 0; // real progress from the loading engine
    let current = 0; // what we show
    let elapsed = 0;
    let finished = false;
    let cancelled = false;

    const pace = gsap.parseEase("power1.inOut");
    const minDuration = reduced ? 0.8 : MIN_DURATION;

    const tick: gsap.TickerCallback = (_time, deltaMs) => {
      if (finished) return;
      const dt = deltaMs / 1000;
      elapsed += dt;
      const desired = Math.min(target, pace(Math.min(1, elapsed / minDuration)));
      current += (desired - current) * (1 - Math.exp(-dt * 9)); // smooth follow
      if (desired >= 1 && current > 0.997) current = 1;
      render(current);
      if (current >= 1) {
        finished = true;
        gsap.ticker.remove(tick);
        exit();
      }
    };

    render(0);
    gsap.ticker.add(tick);

    runPreload(
      [fontsTask, pageLoadTask, imageTask(CRITICAL_IMAGES), chunkTask(CRITICAL_CHUNKS)],
      (p) => {
        if (!cancelled) target = p;
      },
      HARD_TIMEOUT
    ).then(() => {
      if (!cancelled) target = 1;
    });

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      window.clearInterval(clockId);
      ctx.revert();
      if (!announced) html.style.overflow = "";
    };
  }, [isHome]);

  if (gone || !isHome) return null;

  const rootStyle = { color: PALETTE.ink, "--pl-pad": "clamp(16px,2.6vw,36px)" } as CSSProperties;

  return (
    <div
      ref={rootRef}
      data-preloader
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={rootStyle}
      className="fixed inset-0 z-[9999] overflow-hidden [html[data-pl-seen]_&]:hidden"
    >
      {/* no-JS visitors should never be blocked by the overlay and see hero immediately */}
      <noscript>
        <style>{`[data-preloader]{display:none!important}[data-hero-reveal]{visibility:visible!important}`}</style>
      </noscript>

      {/* curtain */}
      <svg
        className="absolute inset-0 block h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path data-curtain-path d="M-1 -1H101V101Q50 101 -1 101Z" fill={PALETTE.curtain} />
      </svg>

      {/* top row: role + live clock */}
      <div className="pointer-events-none absolute left-[var(--pl-pad)] right-[var(--pl-pad)] top-[var(--pl-pad)] flex items-start justify-between font-sans text-[length:clamp(0.8rem,1vw,0.95rem)] tracking-[0.01em]">
        <span className="block overflow-hidden">
          <span data-rise className="block opacity-0 will-change-transform">
            {ROLE}
          </span>
        </span>
        <span className="block overflow-hidden">
          <span data-rise data-clock className="block tabular-nums opacity-0 will-change-transform" />
        </span>
      </div>

      {/* the name: outline letters that fill up as the site loads */}
      <div
        aria-hidden="true"
        className={`${display.className} pointer-events-none absolute inset-0 flex items-center justify-center text-[length:min(34vw,62vh)] leading-[1.2] tracking-[0.015em]`}
      >
        {letters.map((ch, i) => (
          <span key={i} className="relative -mx-[0.02em] block overflow-hidden px-[0.02em]">
            <span
              data-char-inner
              className="relative block origin-bottom-left opacity-0 will-change-transform"
            >
              <span
                className="block"
                style={{
                  color: "transparent",
                  WebkitTextStroke: `clamp(1px,0.16vw,2.5px) ${PALETTE.outline}`,
                }}
              >
                {ch}
              </span>
              <span
                data-char-fill
                className="absolute inset-0 block [clip-path:inset(100%_0_0_0)] will-change-[clip-path]"
              >
                {ch}
              </span>
            </span>
          </span>
        ))}
      </div>

      {/* bottom row: status text (left) + counter (right) */}
      <div className="pointer-events-none absolute bottom-[var(--pl-pad)] left-[var(--pl-pad)] right-[var(--pl-pad)] flex items-end justify-between font-sans text-[length:clamp(0.8rem,1vw,0.95rem)] tracking-[0.01em]">
        <span className="block h-[1.5em] overflow-hidden leading-[1.5em]">
          <span data-rise className="block opacity-0 will-change-transform">
            <span data-phase-track className="block will-change-transform">
              {PHASES.map((label) => (
                <span key={label} className="block h-[1.5em] whitespace-nowrap">
                  {label}
                </span>
              ))}
            </span>
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`${display.className} block overflow-hidden text-[length:clamp(3.5rem,10vw,9rem)] leading-[1.1] tabular-nums`}
        >
          <span data-rise className="flex items-start opacity-0 will-change-transform">
            {(
              [
                ["h", HUNDREDS],
                ["t", ROLL],
                ["o", ROLL],
              ] as const
            ).map(([col, digits]) => (
              <span key={col} className="block h-[1.1em] overflow-hidden">
                <span data-col={col} className="block will-change-transform">
                  {digits.map((d, i) => (
                    <span key={i} className="block h-[1.1em] text-center leading-[1.1em]">
                      {d}
                    </span>
                  ))}
                </span>
              </span>
            ))}
            <span className="ml-[0.25em] mt-[0.5em] text-[0.3em] leading-none">%</span>
          </span>
        </span>
      </div>
    </div>
  );
}
