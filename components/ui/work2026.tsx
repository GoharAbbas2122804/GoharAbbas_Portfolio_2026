"use client";

// A portfolio index built as a wheel you turn.
import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string;
  /** Optional category or short tag */
  category?: string;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items?: WorksWheelItem[];
  /** Sits in the middle of the ring. @default undefined */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default undefined */
  action?: string;
}

export const DEFAULT_PROJECT_ITEMS: WorksWheelItem[] = [
  {
    title: "Ghost AI Lead Generation",
    image: "/assets/projectImages/Ghost_AI_Lead_Generation.png",
    href: "https://ghost-ai-beryl.vercel.app/dashboard",
    category: "AI & Automation",
  },
  {
    title: "Yaseen Medical Clinic",
    image: "/assets/projectImages/yaseenMedicalClinic.png",
    href: "https://yaseenmedicalclinic.com/",
    category: "Healthcare Platform",
  },
  {
    title: "Royal Fragrance",
    image: "/assets/projectImages/RoyalFragrances.png",
    href: "https://royale-fragrances.vercel.app/",
    category: "Luxury E-Commerce",
  },
  {
    title: "Signalist Stock Analyzer",
    image: "/assets/projectImages/signalist.jpeg",
    href: "https://signalist-stock-market-analyzer-rjo.vercel.app/",
    category: "Fintech & AI Analytics",
  },
  {
    title: "Admin Panel",
    image: "/assets/projectImages/adminPanel.jpg",
    href: "https://admin-panel-pied-five.vercel.app/",
    category: "Enterprise Dashboard",
  },
  {
    title: "Layers Landing Page",
    image: "/assets/projectImages/layers_landingPage.jpeg",
    href: "https://layers-landing-page-theta.vercel.app/",
    category: "SaaS Landing Page",
  },
  {
    title: "MetaData Keyboard Shop",
    image: "/assets/projectImages/metaData_keyboard_website.jpg",
    href: "https://metadata-mechanical-keyboard.vercel.app/",
    category: "3D Interactive Web",
  },
  {
    title: "Mojito Landing Page",
    image: "/assets/projectImages/mojito_landingPage.jpg",
    href: "https://mojito-landing-page-eight.vercel.app/",
    category: "Brand Showcase",
  },
  {
    title: "Nike Shoes Concept",
    image: "/assets/projectImages/nike_shoes.jpeg",
    href: "https://nike-shoes-jade.vercel.app/",
    category: "Interactive Footwear",
  },
  {
    title: "Zyrah E-Commerce",
    image: "/assets/projectImages/zyrah_E_commerce.png",
    href: "https://zyrah.vercel.app/",
    category: "Fashion E-Commerce",
  },
  {
    title: "Univoice Mobile App",
    image: "/assets/projectImages/Univoice_Mobile_APp.png",
    href: "https://github.com/GoharAbbas2122804/voicetovc",
    category: "Mobile Application",
  },
  {
    title: "Flow Productivity App",
    image: "/assets/projectImages/Flow_Productivity_app.png",
    href: "https://github.com/GoharAbbas2122804/Flow_Productivity-App",
    category: "Productivity System",
  },
];

/* Geometry constants */
const CARD_H = 0.38;
const CARD_MAX_W = 0.38;
const CARD_RATIO = 1.52;
const STEP = 36; // Degrees between cards on the drum
const DRUM = 2.22;
const LENS = 2.7;
const RING_R = 1.14;
const BOW = 1.82;
const TITLE = 0.11;
const INDEX = 0.035;
const CULL = 1.8;

const DRAG_UNITS = 420;
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items = DEFAULT_PROJECT_ITEMS,
  label = "Works '26",
  action = "Visit",
  className,
  ...props
}: WorksWheelProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  const stRef = React.useRef<ScrollTrigger | null>(null);

  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  // Track drag distance to differentiate tap/click from scroll drag
  const dragStart = React.useRef<{ y: number; moved: boolean }>({ y: 0, moved: false });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Pin section with GSAP ScrollTrigger
  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${Math.max(count, 1) * 350}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
      onUpdate: (self) => {
        target.current = self.progress * (count + 0.15);
      },
    });
    stRef.current = st;

    return () => {
      st.kill();
      stRef.current = null;
    };
  }, [count]);

  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const isMobile = w < 768;
    const cardHFactor = isMobile ? 0.32 : CARD_H;
    const cardWFactor = isMobile ? 0.82 : CARD_MAX_W;
    const cardW = Math.min(h * cardHFactor * CARD_RATIO, w * cardWFactor);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
      isMobile,
    };
  }, [stage, count]);

  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      const clampedNext = clamp(next, 0, last + 1);
      target.current = clampedNext;
      if (stRef.current) {
        const targetProgress = clampedNext / (count + 0.15);
        const start = stRef.current.start;
        const end = stRef.current.end;
        const targetScroll = start + targetProgress * (end - start);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
      }
    },
    [count, last],
  );

  const activeItem = items[active];

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label={label}
      className={cn(
        "bg-[#0b0b0c] text-white relative h-screen w-full overflow-hidden select-none flex items-center justify-center isolate",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className="focus-visible:outline-emerald-500 absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          dragStart.current = { y: event.clientY, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragStart.current.y === 0 && !dragStart.current.moved) return;
          const delta = dragStart.current.y - event.clientY;
          if (Math.abs(delta) > 5) {
            dragStart.current.moved = true;
          }
          to(target.current + delta / DRAG_UNITS);
          dragStart.current.y = event.clientY;
        }}
        onPointerUp={() => {
          dragStart.current.y = 0;
          if (target.current > 1) to(Math.round(target.current));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const isCurrentActive = i === active;
            return (
              <React.Fragment key={item.title}>
                <div
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={isCurrentActive}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden] transition-shadow duration-300"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <div className="bg-[#141416] border border-white/15 hover:border-emerald-500/50 shadow-2xl relative block size-full overflow-hidden rounded-2xl transition-all duration-300 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      onError={(e) => {
                        // Fallback image handling
                        const target = e.currentTarget;
                        target.style.display = "none";
                      }}
                      className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay for visual quality & text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

                    {/* Top Right External Link Badge */}
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          // Prevent pointer drag handling from intercepting link clicks
                          e.stopPropagation();
                        }}
                        aria-label={`Open ${item.title} in new tab`}
                        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-emerald-500 text-white hover:text-black border border-white/20 hover:border-emerald-400 backdrop-blur-md text-xs font-semibold tracking-wide transition-all duration-300 shadow-lg hover:scale-105"
                      >
                        <span>{action}</span>
                        <svg
                          viewBox="0 0 24 24"
                          className="size-3.5 fill-none stroke-currentColor stroke-[2.2]"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : null}

                    {/* Bottom Card Title & Category overlay for easy scanning */}
                    <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none flex flex-col gap-0.5">
                      {item.category ? (
                        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold">
                          {item.category}
                        </span>
                      ) : null}
                      <h3 className="text-sm md:text-base font-bold text-white drop-shadow-md line-clamp-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Center Wheel Intro Label */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center tracking-tight font-extrabold text-white/90 drop-shadow-lg"
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>

      {/* Floating Action HUD for Active Selected Project */}
      {activeItem ? (
        <div className="absolute bottom-8 left-6 md:left-12 z-30 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 bg-black/60 backdrop-blur-xl border border-white/10 p-4 md:px-6 md:py-3.5 rounded-2xl shadow-2xl max-w-[90vw] md:max-w-xl transition-all duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              {activeItem.category || "Featured Project"}
            </span>
            <h2 className="text-base md:text-lg font-bold text-white truncate max-w-[280px] md:max-w-md">
              {activeItem.title}
            </h2>
          </div>
          {activeItem.href ? (
            <a
              href={activeItem.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md shrink-0 cursor-pointer"
            >
              <span>Visit Project</span>
              <svg
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-currentColor stroke-[2.5]"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : null}
        </div>
      ) : null}

      {/* Index list down the right-hand side with responsive scrolling */}
      <ol
        className="text-muted-foreground absolute top-[10%] right-[3%] z-30 text-right leading-[1.6] max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar hidden sm:block"
        style={{ fontSize: Math.max(metrics.index, 11) }}
      >
        {items.map((item, i) => (
          <li key={item.title} className="my-1">
            <button
              type="button"
              onClick={() => to(i + 1)}
              className={cn(
                "focus-visible:outline-emerald-500 cursor-pointer transition-all duration-300 outline-none text-xs md:text-sm hover:text-white/90 text-white/50",
                i === active && "text-emerald-400 font-bold tracking-wide text-sm md:text-base drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
              )}
            >
              {i === active ? "● " : ""}{item.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default WorksWheel;

