"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { useEffect, useRef } from "react";

/* ---------------- Social Icon SVG Components ---------------- */
const ThreadsIcon = ({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={{ fill: "currentColor", ...style }} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.186 24.004c-3.141 0-5.876-.928-8.13-2.76-2.128-1.727-3.411-4.045-3.815-6.892-.259-1.834-.055-3.694.59-5.378.69-1.802 1.83-3.328 3.3-4.417 2.05-1.517 4.542-2.31 7.206-2.3 2.873 0 5.485.932 7.55 2.695 1.94 1.656 3.129 3.84 3.441 6.315.228 1.805.004 3.633-.648 5.286-.71 1.801-1.884 3.322-3.393 4.397-1.921 1.368-4.225 2.074-6.852 2.054h-.249zm.344-22.187c-2.298 0-4.444.686-6.208 1.986-1.272.937-2.254 2.253-2.839 3.805-.558 1.451-.735 3.056-.511 4.639.349 2.459 1.455 4.458 3.284 5.942 1.954 1.588 4.316 2.39 7.02 2.39h.215c2.268.017 4.254-.593 5.903-1.766 1.305-.929 2.32-2.242 2.935-3.797.564-1.428.758-3.007.56-4.566-.271-2.138-1.296-4.025-2.964-5.457-1.782-1.522-4.038-2.326-6.523-2.326l-.872.15zm-2.029 11.238c.636 0 1.258.118 1.849.351.492.194.945.474 1.347.833-.918 1.151-2.062 1.776-3.402 1.859-1.076.066-2.046-.289-2.733-1.002-.638-.662-.924-1.564-.805-2.54.167-1.375 1.059-2.455 2.28-2.766.425-.108.868-.146 1.314-.113.626.046 1.229.239 1.791.572.769.456 1.378 1.121 1.81 1.979-.705.811-1.611 1.237-2.695 1.267-.282.008-.553-.035-.808-.128-.396-.145-.718-.397-.932-.731l.988-.582z" />
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...style }} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={{ fill: "currentColor", ...style }} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
  </svg>
);

const GithubIcon = ({ className = "h-4 w-4", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={{ fill: "currentColor", ...style }} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);


/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Social Links ---------------- */
const socialLinks = [
  { name: "LinkedIn", icon: LinkedinIcon, href: "https://www.linkedin.com/in/gohar-abbas-106519321/" },
  { name: "GitHub", icon: GithubIcon, href: "https://github.com/GoharAbbas2122804/" },
  { name: "Threads", icon: ThreadsIcon, href: "https://www.threads.com/@goharabbas2122804" },
  { name: "Instagram", icon: InstagramIcon, href: "https://www.instagram.com/goharabbas2122804/" },
];

/* ---------------- Footer Component ---------------- */
export default function Footer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="relative min-h-[85vh] lg:h-screen w-full overflow-hidden bg-black text-white border-t border-white/10 flex flex-col justify-between">
      
      {/* Background video */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        loop
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
      />

      {/* Noise overlay */}
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />

      {/* Top bar with Social Media Icons */}
      <nav className="relative z-20 flex justify-center pt-0">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 rounded-b-2xl md:rounded-b-3xl bg-black/90 backdrop-blur-md px-8 py-3.5 border-x border-b border-white/15 shadow-2xl">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.name}
                title={item.name}
                className="group relative p-1.5 transition-colors"
                style={{ color: "rgba(225, 224, 204, 0.85)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.85)")}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 group-hover:scale-115" />
              </a>
            );
          })}
        </div>
      </nav>

      {/* Footer content - Full Width Content Container */}
      <div className="relative z-20 w-full px-6 sm:px-12 md:px-16 lg:px-20 pb-8 sm:pb-12 md:pb-14 pt-24">
        <div className="grid grid-cols-12 items-end gap-6 max-w-7xl mx-auto">
          
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <h2
              className="font-medium leading-[0.8] tracking-[-0.07em] text-[24vw] sm:text-[22vw] md:text-[19vw] lg:text-[17vw] xl:text-[16vw]"
              style={{ color: "#E1E0CC" }}
            >
              <WordsPullUp text="GOHAR" showAsterisk />
            </h2>
          </div>

          <div className="col-span-12 flex flex-col gap-5 lg:col-span-5 xl:col-span-4 lg:pb-4">
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base md:text-lg font-normal"
              style={{ color: "rgba(225, 224, 204, 0.85)", lineHeight: 1.35 }}
            >
              Gohar is a full-stack engineer and creative developer passionate about building high-impact digital experiences and modern web applications.
            </motion.p>

            {/* Direct Contact Pills (Email & Phone) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row flex-wrap gap-3"
            >
              <a
                href="mailto:GoharAbbas2122804@gmail.com"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#E1E0CC] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/15 transition-all shadow-md backdrop-blur-sm"
              >
                <Mail className="h-4 w-4 text-[#E1E0CC]" />
                <span>GoharAbbas2122804@gmail.com</span>
              </a>
              <a
                href="tel:+923344290186"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#E1E0CC] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/15 transition-all shadow-md backdrop-blur-sm"
              >
                <Phone className="h-4 w-4 text-[#E1E0CC]" />
                <span>+92 334 4290186</span>
              </a>
            </motion.div>

            <motion.a
              href="/contact"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="group inline-flex items-center gap-3 self-start rounded-full bg-[#E1E0CC] py-1.5 pl-6 pr-2 text-sm font-semibold text-black transition-all hover:bg-white hover:gap-4 sm:text-base shadow-xl"
            >
              Let&apos;s connect
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                <ArrowRight className="h-4 w-4" style={{ color: "#E1E0CC" }} />
              </span>
            </motion.a>

          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer, Footer as PrismaHero };
