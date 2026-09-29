"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Plus_Jakarta_Sans, Space_Grotesk, Syne } from "next/font/google";

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

type Testimonial = {
  name: string;
  role: string;
  location: string;
  project: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Dr. Nauman Yaseen",
    role: "Clinic Principal",
    location: "Pakistan",
    project: "Medical Clinic Website System",
    quote:
      "Gohar built a complete website system for our clinic — calm, clear, and easy for patients to use. Booking and information finally live in one place, and the delivery was as careful as the work itself.",
  },
  {
    name: "Fatima",
    role: "Product Owner",
    location: "Pakistan",
    project: "Flutter Mobile Application",
    quote:
      "He designed and shipped our Flutter app with real attention to motion, layout, and edge cases. We went from scattered screens to a product that feels finished — and he stayed sharp through every revision.",
  },
  {
    name: "Saim",
    role: "Founder",
    location: "Pakistan",
    project: "Travel Agency Website",
    quote:
      "Our travel agency needed both a working website and a landing page that could convert. Gohar delivered both, on time, with a structure that made packages easy to scan and enquire about.",
  },
  {
    name: "Ayesha Siddiqui",
    role: "Founder",
    location: "Karachi, Pakistan",
    project: "Boutique Storefront",
    quote:
      "He treated the storefront like a real shop floor: product hierarchy, mobile checkout, and copy that did not fight the brand. Launch week was quiet because the site simply worked.",
  },
  {
    name: "Hamza Qureshi",
    role: "Operations Lead",
    location: "Islamabad, Pakistan",
    project: "Internal Web Dashboard",
    quote:
      "Gohar rebuilt our ops dashboard so the team could stop chasing spreadsheets. The interface is fast, the data is honest, and he explained trade-offs without making us feel like we needed another engineer.",
  },
  {
    name: "Mehwish Ali",
    role: "Program Director",
    location: "Lahore, Pakistan",
    project: "Education Platform",
    quote:
      "Parents and faculty had to understand the product in one sitting. He kept the UI restrained, the flows obvious, and the handoff documented. That kind of discipline is rare.",
  },
  {
    name: "James Whitaker",
    role: "Product Lead",
    location: "London, United Kingdom",
    project: "SaaS Marketing Site",
    quote:
      "We needed a site that could stand next to a mature product, not a template. Gohar tightened the narrative, shipped clean front-end, and left us with a codebase we could actually extend.",
  },
  {
    name: "Sofia Almeida",
    role: "Studio Director",
    location: "Lisbon, Portugal",
    project: "Studio Website",
    quote:
      "The work felt editorial rather than decorative. He listened, pushed back when the layout was getting noisy, and delivered a site that still looks considered months later.",
  },
  {
    name: "Kenji Nakamura",
    role: "Founder",
    location: "Tokyo, Japan",
    project: "Product Web App",
    quote:
      "Communication was precise across time zones, and the engineering matched it. He shipped the web app with the performance and structure we asked for — no theatre, just finished work.",
  },
];

function splitColumns(items: Testimonial[]) {
  const middle = Math.ceil(items.length / 2);
  return [items.slice(0, middle), items.slice(middle)] as const;
}

const columns = splitColumns(testimonials);

function ReviewCard({ quote, name, role, location, project }: Testimonial) {
  return (
    <article className="testimonial-card group relative w-[320px] sm:w-[380px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#131316]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-[#18181c] hover:shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
        <div>
          <h4 className={`text-base font-bold text-white tracking-tight ${spaceGrotesk.className}`}>
            {name}
          </h4>
          <p className="text-xs text-zinc-400">
            {role} · <span className="text-zinc-500">{location}</span>
          </p>
        </div>
        <span
          aria-hidden="true"
          className={`select-none text-4xl leading-none text-white/20 group-hover:text-white/40 transition-colors ${syne.className}`}
        >
          ”
        </span>
      </div>
      <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 line-clamp-4">
        "{quote}"
      </p>
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
        <span className={`font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors ${spaceGrotesk.className}`}>
          {project}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">Verified Client</span>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  className = "",
}: {
  items: Testimonial[];
  reverse?: boolean;
  className?: string;
}) {
  const loop = [...items, ...items, ...items];

  return (
    <div className={`testimonial-row-container relative w-full overflow-hidden py-1 ${className}`}>
      <div
        className="testimonial-track flex flex-row gap-5 sm:gap-6 will-change-transform"
        data-reverse={reverse ? "true" : "false"}
      >
        {loop.map((item, idx) => (
          <ReviewCard key={`${item.name}-${idx}`} {...item} />
        ))}
      </div>
    </div>
  );
}

export function StaggerTestimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const listeners: Array<() => void> = [];
    const splits: SplitText[] = [];
    let marqueeTweens: Array<gsap.core.Tween | null> = [];
    let speedProxy: { v: number } | null = null;
    let decayTimer: number | undefined;

    const ctx = gsap.context(() => {
      const headerBits = headerRef.current
        ? headerRef.current.querySelectorAll(".testimonial-header-item")
        : [];
      const title = titleRef.current;
      const divider = section.querySelector<HTMLElement>(".testimonial-divider");
      const dot = section.querySelector<HTMLElement>(".testimonial-dot");
      const trackEls = Array.from(
        section.querySelectorAll<HTMLDivElement>(".testimonial-track")
      );

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

      gsap.set(headerBits, { autoAlpha: 0, y: 24 });
      gsap.set(words, { autoAlpha: 0, yPercent: 70 });
      gsap.set(divider, { scaleX: 0 });

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      intro
        .to(headerBits, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0)
        .to(
          words,
          { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.08, ease: "power4.out" },
          0.1
        )
        .to(divider, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 0.45);

      speedProxy = { v: 1 };
      const applySpeed = () => {
        marqueeTweens.forEach((tween) => tween && tween.timeScale(speedProxy!.v));
      };

      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(1, 2.2, 1 + Math.abs(self.getVelocity()) / 1800);
          gsap.killTweensOf(speedProxy);
          speedProxy!.v = boost;
          applySpeed();
          window.clearTimeout(decayTimer);
          decayTimer = window.setTimeout(() => {
            gsap.to(speedProxy, {
              v: 1,
              duration: 0.6,
              ease: "power2.out",
              overwrite: "auto",
              onUpdate: applySpeed,
            });
          }, 150);
        },
      });

      // Spotlight cursor follow
      const spot = section.querySelector<HTMLElement>(".testimonial-spotlight");
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

      gsap.to(".testimonial-gradient", {
        backgroundPosition: "200% 0%",
        duration: 9,
        repeat: -1,
        ease: "none",
        delay: 1.5,
      });

      // Horizontal Marquee Animations
      const tracks = trackEls.filter((track) => track && track.offsetParent);
      const rowListeners: Array<() => void> = [];

      if (reduceMotion) {
        marqueeTweens = [];
        gsap.set(tracks, { x: 0 });
        return;
      }

      const tweens = tracks.map((track) => {
        const singleSetWidth = track.scrollWidth / 3;
        if (singleSetWidth < 10) return null;
        const isReverse = track.dataset.reverse === "true";
        const duration = Math.max(25, singleSetWidth / 35);

        // Reverse = true: Left to Right (-distance -> 0)
        // Reverse = false: Right to Left (0 -> -distance)
        return gsap.fromTo(
          track,
          { x: isReverse ? -singleSetWidth : 0 },
          {
            x: isReverse ? 0 : -singleSetWidth,
            duration,
            ease: "none",
            repeat: -1,
          }
        );
      });

      marqueeTweens = tweens;

      // Pause marquee on hover over rows/cards for comfortable reading
      tracks.forEach((track, index) => {
        const container = track.closest<HTMLElement>(".testimonial-row-container");
        const tween = tweens[index];
        if (!container || !tween) return;

        const pause = () => tween.pause();
        const play = () => tween.play();
        container.addEventListener("pointerenter", pause);
        container.addEventListener("pointerleave", play);
        rowListeners.push(() => {
          container.removeEventListener("pointerenter", pause);
          container.removeEventListener("pointerleave", play);
        });
      });

      listeners.push(() => rowListeners.forEach((off) => off()));
    }, section);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => ScrollTrigger.refresh())
        .catch(() => undefined);
    }

    return () => {
      ctx.revert();
      splits.forEach((split) => split.revert());
      window.clearTimeout(decayTimer);
      if (speedProxy) gsap.killTweensOf(speedProxy);
      listeners.forEach((off) => off());
    };
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      aria-label="Client testimonials"
      className={`relative isolate flex min-h-[85dvh] w-full flex-col justify-center gap-10 overflow-hidden bg-[#0b0b0c] text-white py-16 sm:py-24 ${jakarta.className}`}
    >
      {/* Background Ambience & Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="testimonial-grid pointer-events-none absolute inset-0 z-0 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_60px)]" />

      <div className="testimonial-spotlight pointer-events-none absolute left-0 top-0 z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_45%,transparent_70%)]" />

      {/* Section Header */}
      <header
        ref={headerRef}
        className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center gap-3.5 text-center px-4"
      >
        <div className="testimonial-header-item flex items-center gap-2.5">
          <span className="testimonial-dot h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
          <span
            className={`text-xs font-bold uppercase tracking-[0.28em] text-zinc-400 ${spaceGrotesk.className}`}
          >
            Client Endorsements
          </span>
        </div>

        <h2
          ref={titleRef}
          className={`testimonial-title text-[clamp(2.1rem,min(6vw,4.5rem),4.5rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-white ${syne.className}`}
        >
          <span data-split className="block">
            What Clients Say
          </span>
          <span
            data-split
            className="testimonial-gradient block bg-[linear-gradient(100deg,#ffffff_0%,#d4d4d8_28%,#71717a_52%,#e4e4e7_78%,#ffffff_100%)] bg-[length:260%_100%] bg-clip-text text-transparent"
          >
            After We Shipped
          </span>
        </h2>

        <span className="testimonial-divider block h-px w-20 origin-center bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <p className="testimonial-header-item max-w-md text-xs leading-relaxed text-zinc-400 sm:max-w-lg sm:text-sm">
          Verified feedback from founders, product leads, and directors across Pakistan, United Kingdom, Portugal, and Japan.
        </p>
      </header>

      {/* Dual Horizontal Marquee Rows */}
      <div className="relative z-20 flex w-full flex-col gap-5 sm:gap-6 overflow-hidden">
        {/* Side Gradient Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-16 sm:w-36 bg-gradient-to-r from-[#0b0b0c] via-[#0b0b0c]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-16 sm:w-36 bg-gradient-to-l from-[#0b0b0c] via-[#0b0b0c]/80 to-transparent" />

        {/* Top Row: Left to Right */}
        <MarqueeRow items={columns[0]} reverse={true} />

        {/* Bottom Row: Right to Left */}
        <MarqueeRow items={columns[1]} reverse={false} />
      </div>
    </section>
  );
}

export default StaggerTestimonials;
