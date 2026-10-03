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
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gohar Abbas",
    jobTitle: "Full-Stack Software Engineer",
    description:
      "Software engineer building web and mobile products, AI agents, and automation.",
    knowsAbout: [
      "Full-stack software development",
      "Web application development",
      "Mobile app development",
      "AI agents and automation",
      "Computer vision",
    ],
    sameAs: [
      "https://github.com/GoharAbbas2122804",
      "https://www.linkedin.com/in/gohar-abbas-106519321/",
    ],
  };

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 relative bg-[#0b0b0c] min-h-screen text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
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
