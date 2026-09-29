"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus_Jakarta_Sans, Space_Grotesk, Syne } from "next/font/google";

gsap.registerPlugin(ScrollTrigger);

// ── Google Fonts matching the reference image ─────────────────────────────
const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// ── Skill tags matching the reference design ──────────────────────────────
const SKILL_TAGS = [
  "Brand Design",
  "Product Design",
  "UX | UI",
  "Art Direction",
  "Motion & 3D",
  "Full-Stack Dev",
];

// ── Artistic Red SVGs (matching reference image #2 red floating artwork above head) ─
const RED_ARTWORK = [
  {
    id: "surfer",
    title: "Balance & Motion",
    x: "52%",
    y: "-8%",
    svg: (
      <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#e63946] fill-current">
        <path d="M50 10c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zm-15 25l12-5 8 10-6 15 15-8 4-15 8 3-5 18-20 11-8-14-6 3v12h-6V42l10-7zm-20 45c20-5 50-5 70 0l-5 5c-18-4-42-4-60 0l-5-5z" />
      </svg>
    ),
  },
  {
    id: "moon",
    title: "Vision & Depth",
    x: "30%",
    y: "12%",
    svg: (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-[#e63946] fill-current">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M50 15a35 35 0 0 1 0 70 25 25 0 0 0 0-70z" />
        <circle cx="38" cy="40" r="4" opacity="0.7" />
        <circle cx="45" cy="62" r="6" opacity="0.7" />
        <circle cx="32" cy="58" r="3" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "wave",
    title: "Flow & Dynamics",
    x: "42%",
    y: "2%",
    svg: (
      <svg viewBox="0 0 100 100" className="w-11 h-11 text-[#e63946] fill-current">
        <path d="M10 65c15-20 30-35 45-35 12 0 18 8 15 18-3 10-15 15-25 10s-5-15 5-15c5 0 8 3 8 7 0 2-1 4-3 5m-30 25c25-30 50-45 75-45" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "bird",
    title: "Precision & Speed",
    x: "15%",
    y: "28%",
    svg: (
      <svg viewBox="0 0 100 100" className="w-11 h-11 text-[#e63946] fill-current">
        <path d="M20 50l30-25c5 10 15 15 25 15l-15 10 25 20-35-10-10 15-5-20-15-5zM10 50l35 2 45-2-40-5z" />
      </svg>
    ),
  },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const artworkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Entry animations on scroll
      gsap.set(nameRef.current, { opacity: 0, y: 50 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
      gsap.set(tagsRef.current, { opacity: 0, y: 30 });
      gsap.set(imageWrapRef.current, { opacity: 0, scale: 0.95 });

      // Staggered reveal timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
        },
      });

      tl.to(imageWrapRef.current, { opacity: 1, scale: 1, duration: 1, ease: "expo.out" })
        .to(nameRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }, "-=0.7")
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.5")
        .to(tagsRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .call(() => {
          // Reveal red artwork with creative spring pop
          artworkRefs.current.forEach((el, index) => {
            if (!el) return;
            gsap.fromTo(
              el,
              { opacity: 0, scale: 0, y: 25, rotate: -15 },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                rotate: 0,
                duration: 0.8,
                ease: "back.out(2)",
                delay: index * 0.12,
              }
            );
          });
        });

      // Subtle float animation for the red artwork icons
      artworkRefs.current.forEach((el, index) => {
        if (!el) return;
        gsap.to(el, {
          y: "-=8",
          rotate: index % 2 === 0 ? 5 : -5,
          duration: 2 + index * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });
      });

      // Mouse interactive tilt on image container
      const wrap = imageWrapRef.current;
      if (!wrap) return;

      const onMouseMove = (e: MouseEvent) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(imageRef.current, {
          rotateY: x * 10,
          rotateX: -y * 8,
          duration: 0.5,
          ease: "power2.out",
        });

        // Red icons drift dynamically on hover over image
        artworkRefs.current.forEach((el, i) => {
          if (!el) return;
          const factor = (i + 1) * 8;
          gsap.to(el, {
            x: x * factor,
            y: y * factor,
            duration: 0.6,
            ease: "power2.out",
          });
        });
      };

      const onMouseLeave = () => {
        gsap.to(imageRef.current, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.8,
          ease: "expo.out",
        });
        artworkRefs.current.forEach((el) => {
          if (!el) return;
          gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "expo.out" });
        });
      };

      wrap.addEventListener("mousemove", onMouseMove);
      wrap.addEventListener("mouseleave", onMouseLeave);

      return () => {
        wrap.removeEventListener("mousemove", onMouseMove);
        wrap.removeEventListener("mouseleave", onMouseLeave);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`about-ref-section ${jakarta.className}`}
      aria-label="About Gohar Abbas"
    >
      <div className="about-ref-container">
        {/* ════════════════ LEFT COLUMN: Typography & Tags ════════════════ */}
        <div className="about-ref-left">
          {/* Main Name Heading with matching font style */}
          <h2 ref={nameRef} className={`about-ref-title ${syne.className}`}>
            <span className="about-ref-title-top">
              Goh<span className="about-ref-o-stylized">a</span>r
            </span>
            <br />
            <span className="about-ref-title-bottom">Abbas</span>
          </h2>

          {/* Subtitles matching reference text */}
          <div ref={subtitleRef} className="about-ref-subtitles">
            <p className="about-ref-tagline">
              Brands, products &amp; the art in between.
            </p>
            <p className="about-ref-motto">
              I take the fun seriously.
            </p>
          </div>

          {/* Outlined Filter / Skill Tags matching reference image pills */}
          <div ref={tagsRef} className="about-ref-tags-wrapper">
            <div className="about-ref-tags-row">
              <span className="about-ref-tag-pill">Brand Design</span>
              <span className="about-ref-tag-pill">Product Design</span>
              <span className="about-ref-tag-pill">UX | UI</span>
            </div>
            <div className="about-ref-tags-row">
              <span className="about-ref-tag-pill">Art Direction</span>
              <span className="about-ref-tag-pill">Motion &amp; 3D</span>
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT COLUMN: Image & Red Floating Artwork ════════════════ */}
        <div className="about-ref-right">
          <div
            ref={imageWrapRef}
            className="about-ref-image-wrapper"
            style={{ perspective: "1000px" }}
          >
            {/* The Silhouette Profile Image */}
            <div className="about-ref-image-box">
              <img
                ref={imageRef}
                src="/about-profile-dummy.png"
                alt="Gohar Abbas"
                draggable={false}
                className="about-ref-photo"
              />

              {/* Floating Red Vector Artwork (Image 2 effect) */}
              {RED_ARTWORK.map((art, index) => (
                <div
                  key={art.id}
                  ref={(el) => {
                    artworkRefs.current[index] = el;
                  }}
                  className="about-ref-red-icon"
                  style={{ left: art.x, top: art.y }}
                  title={art.title}
                >
                  {art.svg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
