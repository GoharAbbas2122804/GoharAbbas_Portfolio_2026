"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import Image from "next/image";

/* ---------- Types ---------- */

interface ServiceItem {
  id: string;
  name: string;
  role: string;
  image: string;
}

/* ---------- Data ---------- */

const SERVICES: ServiceItem[] = [
  {
    id: "01",
    name: "Full Stack Web Systems",
    role: "Architecture & Engineering",
    image: "/assets/services/fullstack_web.png",
  },
  {
    id: "02",
    name: "iOS & Android App Dev",
    role: "Mobile Native & Cross-Platform",
    image: "/assets/services/mobile_app_dev.png",
  },
  {
    id: "03",
    name: "AI Agents Development",
    role: "Autonomous Workflows & Tools",
    image: "/assets/services/ai_agents_dev.png",
  },
  {
    id: "04",
    name: "Computer Vision & AI Models",
    role: "Object Detection & Model Training",
    image: "/assets/services/computer_vision_ai.png",
  },
];

/* ---------- Main Component ---------- */

export default function LatestServices() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position resources (Global for the floating card)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics for the floating card
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Detect mobile for conditional rendering logic
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    // Offset the cursor card so it doesn't block the text
    mouseX.set(e.clientX + 20);
    mouseY.set(e.clientY + 20);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full cursor-default bg-neutral-950 px-6 py-24 text-neutral-200 md:px-12"
    >
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://cdn.21st.dev/assets/localized/3c2cc307b5ac6a906361df25133b605d31812b016296bfa912355817c768d347.svg')] opacity-[0.05] mix-blend-overlay" />

      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-4xl font-light tracking-tighter text-white sm:text-6xl md:text-8xl">
              Services <span className="text-neutral-600">Offered</span>
            </h1>
          </div>
          <div className="h-px flex-1 bg-neutral-900 mx-8 hidden md:block" />
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
            Capabilities &amp; Expertise &apos;26
          </p>
        </motion.header>

        {/* The List */}
        <div className="flex flex-col">
          {SERVICES.map((service, index) => (
            <ServiceRow
              key={service.id}
              data={service}
              index={index}
              isActive={activeId === service.id}
              setActiveId={setActiveId}
              isMobile={isMobile}
              isAnyActive={activeId !== null}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP ONLY: Global Floating Cursor Image */}
      {/* We use Portal-like fixed positioning to ensure it floats above everything smoothly */}
      {!isMobile && (
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
        >
          <AnimatePresence mode="wait">
            {activeId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -2, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, rotate: 2, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative h-72 w-96 overflow-hidden rounded-2xl border border-white/20 bg-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
              >
                {/* Find the active image */}
                {(() => {
                  const activeService = SERVICES.find((s) => s.id === activeId);
                  if (!activeService) return null;
                  return (
                    <>
                      <Image
                        src={activeService.image}
                        alt={activeService.name}
                        fill
                        unoptimized
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out"
                      />

                      {/* Overlay Metadata */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent p-5 flex flex-col justify-end">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                              {activeService.id} · {activeService.role}
                            </span>
                            <h4 className="text-base font-bold text-white tracking-tight">
                              {activeService.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white border border-white/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Row Component ---------- */

function ServiceRow({
  data,
  index,
  isActive,
  setActiveId,
  isMobile,
  isAnyActive,
}: {
  data: ServiceItem;
  index: number;
  isActive: boolean;
  setActiveId: (id: string | null) => void;
  isMobile: boolean;
  isAnyActive: boolean;
}) {
  const isDimmed = isAnyActive && !isActive;

  return (
    <motion.div
      layout // This enables smooth height animation on mobile
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDimmed ? 0.3 : 1,
        y: 0,
        backgroundColor:
          isActive && isMobile ? "rgba(255,255,255,0.03)" : "transparent",
      }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => !isMobile && setActiveId(data.id)}
      onMouseLeave={() => !isMobile && setActiveId(null)}
      onClick={() => isMobile && setActiveId(isActive ? null : data.id)}
      className={`group relative border-t border-neutral-900 transition-colors duration-500 last:border-b ${
        isMobile ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="relative z-10 flex flex-col py-8 md:flex-row md:items-center md:justify-between md:py-12">
        {/* Name & Index Section */}
        <div className="flex items-baseline gap-6 md:gap-12 pl-4 md:pl-0 transition-transform duration-500 group-hover:translate-x-4">
          <span className="font-mono text-xs text-neutral-600 group-hover:text-emerald-400 transition-colors">
            0{index + 1}
          </span>
          <h2 className="text-3xl font-medium tracking-tight text-neutral-400 transition-colors duration-300 group-hover:text-white md:text-6xl">
            {data.name}
          </h2>
        </div>

        {/* Role & Icon Section */}
        <div className="mt-4 flex items-center justify-between pl-12 pr-4 md:mt-0 md:justify-end md:gap-12 md:pl-0 md:pr-0">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 transition-colors group-hover:text-neutral-400">
            {data.role}
          </span>

          {/* Mobile Toggle Icon */}
          <div className="block md:hidden text-neutral-500">
            {isActive ? <Minus size={18} /> : <Plus size={18} />}
          </div>

          {/* Desktop Arrow */}
          <motion.div
            animate={{ x: isActive ? 0 : -10, opacity: isActive ? 1 : 0 }}
            className="hidden md:block text-white"
          >
            <ArrowUpRight size={28} strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>

      {/* MOBILE ONLY: Inline Accordion Image */}
      <AnimatePresence>
        {isMobile && isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-neutral-900/50"
          >
            <div className="p-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={data.image}
                  alt={data.name}
                  className="h-full w-full object-cover"
                  fill
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs uppercase tracking-widest text-white">
                    Service Overview
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
