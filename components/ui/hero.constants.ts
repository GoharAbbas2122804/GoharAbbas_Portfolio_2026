import type { StaticImageData } from "next/image";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import portrait from "@/app/assets/Images/portfolioProfile.jpeg";

// ---------------------------------------------------------------------------
// Fonts — the signature didone serif + UI/mono labels (self-hosted by Next).
// ---------------------------------------------------------------------------
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  fallback: ["Bodoni Moda", "Georgia"],
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/** Portrait asset — landscape bust on a white backdrop that blends into the paper tone. */
export const PORTRAIT: StaticImageData = portrait;

/** Copy shown in the hero chrome. */
export const HERO_CONTENT = {
  name: "GOHAR ABBAS",
  scrollLabel: "SCROLL DOWN",
  copyrightLabel: "©2026",
  badgeLabel: "PORTFOLIO — 2026",
} as const;

/** Parameters for the canvas rectangle field (L1). */
export const CANVAS_CONFIG = {
  mobileBreakpoint: 768,
  desktopCount: 60,
  mobileCount: 35,
  /** Fraction of rectangles rendered as solid black slivers. */
  filledRatio: 0.18,
  size: { min: 10, max: 65 },
  sliver: { widthMin: 12, widthMax: 45, heightMin: 3, heightMax: 8 },
  rotation: { min: -20, max: 20 },
  speed: { min: 15, max: 45 },
  bob: { amplitudeMin: 12, amplitudeMax: 28, frequencyMin: 0.3, frequencyMax: 1.2 },
} as const;

/** Motion timing and parallax depths (all GSAP-driven). */
export const MOTION = {
  rectFadeDuration: 0.8,
  nameRevealDuration: 1.2,
  portraitRiseDuration: 1.1,
  nameOverlap: 0.25,
  portraitOverlap: 0.45,
  parallax: {
    nameDepth: 22,
    canvasDepth: 10,
    portraitDepth: 12,
    duration: 0.6,
  },
  scrollBob: {
    distance: 8,
    duration: 0.7,
  },
  reducedFadeDuration: 0.4,
  reducedRectFadeDuration: 0.3,
} as const;

