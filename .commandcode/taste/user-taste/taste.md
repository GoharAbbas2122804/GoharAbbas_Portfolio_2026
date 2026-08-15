# User Taste
- Builds UI by importing pre-built components from the 21st.dev UI/UX library, then expects the agent to fix integration issues (missing packages, type errors, syntax issues) and wire the component into the site. Confidence: 0.7
- Primary project is a Next.js (App Router) + TypeScript portfolio site using a shadcn-style `components/ui/` directory and Three.js/@react-three/fiber for animated visuals (e.g., hero sections). Confidence: 0.65
- Uses GSAP (GreenSock) for animations, including ScrambleTextPlugin for text-scramble effects. Confidence: 0.65
- Uses Tailwind CSS v4 (via `@tailwindcss/postcss` in `postcss.config.mjs`). Confidence: 0.6
- Prefers separating component data/props into a dedicated constants file (e.g., `constant.ts`) rather than inlining them, and is open to the agent choosing the most appropriate filename/structure for the case. Confidence: 0.7
- Gives high-level, end-goal directives ("fix the errors and render this as my hero section") and expects the agent to autonomously handle dependency installs, version mismatches, build/tooling errors (e.g., missing PostCSS/Tailwind modules), and page integration. Confidence: 0.6
