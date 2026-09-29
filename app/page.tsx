import About from "@/components/ui/about";
import HeroAboutOverlay from "@/components/ui/HeroAboutOverlay";
import Certificates from "@/components/ui/certificates";
import { Navbar } from "@/components/ui/menu_navbar";
import Services from "@/components/ui/services";
import CtaSection from "@/components/ui/cta_section";
import Footer from "@/components/ui/footer";
import {
  ABOUT_CONFIG,
  ABOUT_LOCATION,
  ABOUT_PROJECTS,
  ABOUT_SOCIAL_LINKS,
} from "@/lib/constants";
import { ScrollFeatures } from "@/components/ui/ScrollServices";
import Timeline from "@/components/ui/timeline";
import { StaggerTestimonials } from "@/components/ui/testimonials";
import WorksWheel, { DEFAULT_PROJECT_ITEMS } from "@/components/ui/work2026";
import LatestServices from "@/components/ui/LatestServices";

export default function Home() {
  return (
    <main className="flex-1 relative bg-[#0b0b0c] min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <HeroAboutOverlay />
      {/* <About
        projects={ABOUT_PROJECTS}
        config={ABOUT_CONFIG}
        socialLinks={ABOUT_SOCIAL_LINKS}
        location={ABOUT_LOCATION}
      /> */}
      <Timeline />
      <ScrollFeatures />
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



