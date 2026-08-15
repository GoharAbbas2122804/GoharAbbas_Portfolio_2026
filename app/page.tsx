import About from "@/components/ui/about";
import JellyfishDrift from "@/components/ui/hero_jellyfish";
import {
  ABOUT_CONFIG,
  ABOUT_LOCATION,
  ABOUT_PROJECTS,
  ABOUT_SOCIAL_LINKS,
} from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex-1">
      <JellyfishDrift />
      <About
        projects={ABOUT_PROJECTS}
        config={ABOUT_CONFIG}
        socialLinks={ABOUT_SOCIAL_LINKS}
        location={ABOUT_LOCATION}
      />
    </main>
  );
}
