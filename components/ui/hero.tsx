"use client";

import React from "react";

export default function Hero() {
  const scrollToAbout = () => {
    const aboutElem = document.querySelector(".about-section");
    if (aboutElem) {
      aboutElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 md:p-12">
      {/* Top Left Status Badge */}
      <div className="pt-16 md:pt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-black/8 text-[10px] md:text-xs font-semibold tracking-widest uppercase text-slate-800 pointer-events-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          AVAILABLE FOR 2026 PROJECTS
        </div>
      </div>

      {/* Bottom Action Bar & Scroll Down Indicator */}
      <div className="pb-8 md:pb-12 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={scrollToAbout}
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold tracking-widest uppercase hover:bg-slate-800 transition-all hover:scale-105 shadow-md cursor-pointer"
          >
            EXPLORE WORK &darr;
          </button>
        </div>

        <div className="text-center md:text-right text-[11px] font-mono font-medium tracking-widest uppercase text-slate-700/80">
          DESIGN &bull; DEVELOPMENT &bull; AI AGENTS
        </div>
      </div>
    </div>
  );
}
