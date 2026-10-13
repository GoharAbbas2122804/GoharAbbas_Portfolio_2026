"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PhoneCall, Sparkles } from "lucide-react";

const VoiceAgentModal = dynamic(() => import("./VoiceAgentModal"), {
  ssr: false,
});

export default function VoiceCallTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-white/15 bg-[#090b14]/90 px-5 py-3 text-sm font-medium text-white shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(56,189,248,0.18)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-cyan-400/60 hover:bg-[#0d1428] hover:shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_35px_rgba(56,189,248,0.35)]"
        aria-label="Talk to AI Voice Agent"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-80" />
          <span className="relative inline-flex size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </span>
        <PhoneCall size={15} className="text-cyan-400 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        <span className="font-semibold tracking-tight text-white/95 text-xs sm:text-sm">Talk to AI Agent</span>
      </button>

      {isOpen && <VoiceAgentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
