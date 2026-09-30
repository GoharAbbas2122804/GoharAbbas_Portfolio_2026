import dynamic from "next/dynamic";
import { Navbar } from "@/components/ui/menu_navbar";
import HeroAboutOverlay from "@/components/ui/HeroAboutOverlay";
import { DEFAULT_PROJECT_ITEMS } from "@/components/ui/work2026";

// Below-the-fold sections loaded dynamically with matching BACKGROUND_CHUNKS in preloader.tsx
const Timeline = dynamic(() => import("@/components/ui/timeline"));
const Services = dynamic(() => import("@/components/ui/services"));
const WorksWheel = dynamic(() => import("@/components/ui/work2026"));
const Certificates = dynamic(() => import("@/components/ui/certificates"));
const LatestServices = dynamic(() => import("@/components/ui/LatestServices"));
const StaggerTestimonials = dynamic(() =>
  import("@/components/ui/testimonials").then((mod) => ({ default: mod.StaggerTestimonials }))
);
const CtaSection = dynamic(() => import("@/components/ui/cta_section"));
const Footer = dynamic(() => import("@/components/ui/footer"));

export default function Home() {
  return (
    <main className="flex-1 relative bg-[#0b0b0c] min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <HeroAboutOverlay />
      <Timeline />
      <Services />
      <WorksWheel
        label="Works '26"
        action="View"
        items={DEFAULT_PROJECT_ITEMS}
        className="h-screen w-full bg-[#0b0b0c] text-white"
      />
      <Certificates />
      <LatestServices />
      <StaggerTestimonials />
      <CtaSection />
      <Footer />
    </main>
  );
}
