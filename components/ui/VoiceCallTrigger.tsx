"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PhoneCall } from "lucide-react";

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
        className="group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-[#55dd4a]/40 bg-[#122315]/95 px-5 py-3 text-sm font-medium text-[#f3ede4] shadow-2xl shadow-[#55dd4a]/15 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#55dd4a] hover:bg-[#162e1a] hover:text-[#55dd4a]"
        aria-label="Talk to AI Voice Agent"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#55dd4a] opacity-80" />
          <span className="relative inline-flex size-2.5 rounded-full bg-[#55dd4a]" />
        </span>
        <PhoneCall size={16} className="text-[#55dd4a] transition-transform duration-300 group-hover:rotate-12" />
        <span className="font-medium tracking-tight">Talk to AI Agent</span>
      </button>

      {isOpen && <VoiceAgentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
