import About from "@/components/ui/about";
import Certificates from "@/components/ui/certificates";
import Hero from "@/components/ui/Hero";
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

export default function Home() {
  return (
    <main className="flex-1 relative bg-[#0b0b0c] min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <About
        projects={ABOUT_PROJECTS}
        config={ABOUT_CONFIG}
        socialLinks={ABOUT_SOCIAL_LINKS}
        location={ABOUT_LOCATION}
      />
      {/* <ScrollServices  /> */}
      <Services />
      <Certificates />
      <CtaSection />
      <Footer />
    </main>
  );
}



