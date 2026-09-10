import About from "@/components/ui/about";
import Certificates from "@/components/ui/certificates";
import Hero from "@/components/ui/hero";
import { Navbar } from "@/components/ui/menu_navbar";
import Services from "@/components/ui/services";
import ParallaxStripSlider from "@/components/ui/services";
import {
  ABOUT_CONFIG,
  ABOUT_LOCATION,
  ABOUT_PROJECTS,
  ABOUT_SOCIAL_LINKS,
} from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex-1 relative">
      <Navbar />
      <Hero />
      <About
        projects={ABOUT_PROJECTS}
        config={ABOUT_CONFIG}
        socialLinks={ABOUT_SOCIAL_LINKS}
        location={ABOUT_LOCATION}
      />
      <div className="h-screen w-full">
        <ParallaxStripSlider />
      </div>
      <Services />
      <Certificates />
    </main>
  );
}
