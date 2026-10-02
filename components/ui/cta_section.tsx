"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkle, ArrowsLeftRight, Rocket, ArrowRight } from "@phosphor-icons/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type CtaSectionProps = {
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  priceTag?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  features?: Array<{ icon: React.ReactNode; text: string }>;
  className?: string;
};

// Mosaic glowing pixel gradients to mimic the screenshot's vibrant pixel tiles
const PIXEL_GRADIENTS = [
  "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)", // Glowing Emerald Lime
  "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)", // Cosmic Purple
  "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)", // Deep Cyan Blue
  "linear-gradient(135deg, #facc15 0%, #4ade80 100%)", // Electric Yellow Green
  "linear-gradient(135deg, #34d399 0%, #059669 100%)", // Jade Green
];

export default function CtaSection({
  titleLine1 = "Your website,",
  titleLine2 = "in good hands.",
  subtitle = "Build, improve, & grow.",
  priceTag = "Starting at $5995.",
  primaryCtaText = "Get started",
  primaryCtaLink = "/contact",
  secondaryCtaText = "Book a call",
  secondaryCtaLink = "/contact",
  features = [
    {
      icon: <Sparkle className="w-4 h-4 text-white shrink-0" weight="fill" />,
      text: "Built to extend with AI",
    },
    {
      icon: <ArrowsLeftRight className="w-4 h-4 text-white shrink-0" weight="bold" />,
      text: "No developer bottlenecks",
    },
    {
      icon: <Rocket className="w-4 h-4 text-white shrink-0" weight="fill" />,
      text: "Launch in 4-6 weeks",
    },
  ],
  className = "",
}: CtaSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const topGridRef = useRef<HTMLDivElement>(null);
  const bottomGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      // 1. Entrance Reveal Timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      // Card subtle scale-in
      tl.fromTo(
        card,
        { opacity: 0, y: 40, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9 }
      );

      // Title lines staggered slide up
      tl.fromTo(
        [title1Ref.current, title2Ref.current],
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.8 },
        "-=0.5"
      );

      // Subtitle & price tag fade in
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
      }

      // Buttons animation
      if (buttonsRef.current) {
        tl.fromTo(
          buttonsRef.current.children,
          { opacity: 0, y: 25, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.6 },
          "-=0.4"
        );
      }

      // Features list stagger
      if (featuresRef.current) {
        tl.fromTo(
          featuresRef.current.children,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.5 },
          "-=0.3"
        );
      }

      // 2. Animated Mosaic Pixel Grid Tiles (Flicker & Pulse Loop)
      const glowingTiles = card.querySelectorAll(".pixel-tile-active");
      if (glowingTiles.length > 0) {
        gsap.to(glowingTiles, {
          opacity: "random(0.45, 1)",
          scale: "random(0.92, 1.08)",
          duration: "random(1.8, 3.5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            amount: 1.5,
            from: "random",
          },
        });
      }

      // 3. Interactive Primary Button Hover effect with GSAP
      const primaryBtn = primaryBtnRef.current;
      const arrow = arrowRef.current;
      if (primaryBtn && arrow) {
        const onEnter = () => {
          gsap.to(primaryBtn, { scale: 1.025, duration: 0.25, ease: "power2.out" });
          gsap.to(arrow, { x: 5, duration: 0.25, ease: "power2.out" });
        };
        const onLeave = () => {
          gsap.to(primaryBtn, { scale: 1, duration: 0.25, ease: "power2.out" });
          gsap.to(arrow, { x: 0, duration: 0.25, ease: "power2.out" });
        };

        primaryBtn.addEventListener("mouseenter", onEnter);
        primaryBtn.addEventListener("mouseleave", onLeave);

        return () => {
          primaryBtn.removeEventListener("mouseenter", onEnter);
          primaryBtn.removeEventListener("mouseleave", onLeave);
        };
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate grid cells for top and bottom matrix rows
  const renderTopGrid = () => {
    // Total cells in desktop grid row (28 cells)
    return Array.from({ length: 28 }).map((_, idx) => {
      // Statically designate indices for glowing mosaic tiles matching screenshot:
      // Index 3: Top Left floating tile
      // Index 23, 24: Top Right stacked glowing tiles
      const isTopLeftGlow = idx === 3;
      const isTopRightGlow = idx === 23;
      const isTopRightGlow2 = idx === 24;
      const isMobileGlow = idx >= 18 && idx <= 27; // Mobile top bar sequence

      return (
        <div
          key={`top-cell-${idx}`}
          className={`relative border-r border-b border-white/[0.04] aspect-square flex items-center justify-center transition-opacity duration-500`}
        >
          {isTopLeftGlow && (
            <div
              className="pixel-tile-active absolute inset-1 rounded-[2px] opacity-90 shadow-[0_0_12px_rgba(120,255,214,0.4)]"
              style={{ background: PIXEL_GRADIENTS[2] }}
            />
          )}
          {isTopRightGlow && (
            <div
              className="pixel-tile-active absolute inset-1 rounded-[2px] opacity-90 shadow-[0_0_14px_rgba(250,204,21,0.5)]"
              style={{ background: PIXEL_GRADIENTS[3] }}
            />
          )}
          {isTopRightGlow2 && (
            <div
              className="pixel-tile-active absolute inset-1 rounded-[2px] opacity-75 shadow-[0_0_10px_rgba(192,132,252,0.4)]"
              style={{ background: PIXEL_GRADIENTS[1] }}
            />
          )}
          {/* Mobile top grid iridescent strip */}
          <div
            className={`sm:hidden pixel-tile-active absolute inset-0.5 rounded-[1px] opacity-80 ${
              isMobileGlow ? "block" : "hidden"
            }`}
            style={{
              background: PIXEL_GRADIENTS[idx % PIXEL_GRADIENTS.length],
            }}
          />
        </div>
      );
    });
  };

  const renderBottomGrid = () => {
    return Array.from({ length: 28 }).map((_, idx) => {
      // Bottom left horizontal pixel chain matching screenshot (indices 1 to 6)
      const isBottomLeftGlow = idx >= 1 && idx <= 6;

      return (
        <div
          key={`bot-cell-${idx}`}
          className="relative border-r border-t border-white/[0.04] aspect-square flex items-center justify-center"
        >
          {isBottomLeftGlow && (
            <div
              className="pixel-tile-active absolute inset-1 rounded-[2px] opacity-90 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{
                background: PIXEL_GRADIENTS[idx % 2 === 0 ? 0 : 4],
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <section
      ref={containerRef}
      id="connect"
      className={`w-full bg-[#141416] border-y border-white/10 text-white overflow-hidden py-4 sm:py-8 ${className}`}
      aria-label="Call to Action"
    >
      <div
        ref={cardRef}
        className="relative w-full flex flex-col justify-between transition-colors"
      >
        {/* Top Window Header Chrome */}
        <div className="relative z-20 flex items-center justify-between px-6 sm:px-12 md:px-16 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c30] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c30] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c30] inline-block" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-neutral-500 uppercase select-none">
            Desktop view
          </span>
        </div>

        {/* Top Decorative Matrix Grid */}
        <div
          ref={topGridRef}
          aria-hidden="true"
          className="relative w-full grid grid-cols-14 sm:grid-cols-28 pointer-events-none opacity-80"
        >
          {renderTopGrid()}
        </div>

        {/* Core Content Area */}
        <div className="relative z-10 px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="space-y-1 sm:space-y-2 max-w-3xl">
              <h2
                ref={title1Ref}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]"
              >
                {titleLine1}
              </h2>
              <h2
                ref={title2Ref}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]"
              >
                {titleLine2}
              </h2>
            </div>

            {/* Subtitle / Pricing Badge */}
            <div className="lg:pb-3">
              <p
                ref={subtitleRef}
                className="text-xs sm:text-sm md:text-base text-neutral-400 font-normal tracking-wide whitespace-normal sm:whitespace-nowrap"
              >
                {subtitle}{" "}
                <span className="text-white font-semibold">{priceTag}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 sm:mt-14 max-w-7xl mx-auto"
          >
            {/* Primary Button */}
            <a
              ref={primaryBtnRef}
              href={primaryCtaLink}
              className="group relative inline-flex items-center justify-between gap-6 bg-white text-black font-semibold text-sm sm:text-base px-7 py-3.5 sm:px-8 sm:py-4 rounded-full shadow-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              <span>{primaryCtaText}</span>
              <div ref={arrowRef} className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-black" weight="bold" />
              </div>
            </a>

            {/* Secondary Button */}
            <a
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center bg-[#28282c] hover:bg-[#34343a] text-white font-semibold text-sm sm:text-base px-7 py-3.5 sm:py-4 rounded-full border border-white/5 transition-all duration-200"
            >
              {secondaryCtaText}
            </a>
          </div>

          {/* Value Proposition Badges */}
          <div
            ref={featuresRef}
            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 mt-10 sm:mt-16 text-xs sm:text-sm text-neutral-400 font-medium max-w-7xl mx-auto"
          >
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                {feat.icon}
                <span>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Decorative Matrix Grid */}
        <div
          ref={bottomGridRef}
          aria-hidden="true"
          className="relative w-full grid grid-cols-14 sm:grid-cols-28 pointer-events-none opacity-80"
        >
          {renderBottomGrid()}
        </div>
      </div>
    </section>
  );
}
