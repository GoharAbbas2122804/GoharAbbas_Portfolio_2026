"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface LogoProps {
  isVisible?: boolean;
  isMenuOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Logo({
  isVisible = true,
  isMenuOpen = false,
  onClick,
  className = "",
}: LogoProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const underlineRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  // Load Google Font for handwriting script matching reference image
  useEffect(() => {
    const id = "gohar-signature-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Sacramento&family=Dancing+Script:wght@500;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // GSAP Handwriting stroke & reveal animation
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const ctx = gsap.context(() => {
      // 1. Animate Underline flourish drawing effect
      if (underlineRef.current) {
        const length = underlineRef.current.getTotalLength();
        gsap.set(underlineRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(underlineRef.current, {
          strokeDashoffset: 0,
          duration: 1.3,
          delay: 0.15,
          ease: "power2.out",
        });
      }

      // 2. Animate Signature Text Reveal
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, scale: 0.95, y: 2 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
          }
        );
      }
    }, btn);

    return () => ctx.revert();
  }, []);

  // Redraw interaction on mouse enter
  const handleMouseEnter = () => {
    if (underlineRef.current) {
      const length = underlineRef.current.getTotalLength();
      gsap.fromTo(
        underlineRef.current,
        { strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }
      );
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      ref={buttonRef}
      role="button"
      tabIndex={0}
      aria-label="Gohar - Signature Logo (Scroll to top)"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`group nav-logo-btn relative inline-flex items-center justify-center cursor-pointer select-none transition-all duration-300 ease-out transform ${
        isVisible || isMenuOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-6 pointer-events-none"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 110 32"
          className="w-18 sm:w-22 h-5 sm:h-6 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Cursive Script Signature */}
          <text
            ref={textRef}
            x="4"
            y="22"
            className="fill-white font-normal text-[26px] sm:text-[28px] tracking-normal transition-colors duration-300 group-hover:fill-emerald-400"
            style={{ fontFamily: "'Sacramento', 'Dancing Script', cursive" }}
          >
            Gohar
          </text>

          {/* Underline Flourish Vector Stroke */}
          <path
            ref={underlineRef}
            d="M 6 27 Q 50 33, 102 25"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-white/80 group-hover:text-emerald-400 transition-colors duration-300"
          />

          {/* Decorative Sparkle Accent */}
          <circle
            cx="105"
            cy="24"
            r="1.5"
            className="fill-emerald-400 animate-pulse"
          />
        </svg>
      </div>
    </button>
  );
}

