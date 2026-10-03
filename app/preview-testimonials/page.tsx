"use client";

import { useEffect, useState } from "react";
import { StaggerTestimonials } from "@/components/ui/testimonials";

export default function PreviewTestimonials() {
  const [report, setReport] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      const lines: string[] = [];
      const dump = (label: string, el: Element | null) => {
        if (!el) return lines.push(`${label}: MISSING`);
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        lines.push(
          `${label}: op=${cs.opacity} vis=${cs.visibility} disp=${cs.display} tr=${cs.transform.slice(0, 60)} rect=${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)}`
        );
      };
      const title = document.querySelector(".testimonial-title");
      lines.push(`titleWords=${title ? title.querySelectorAll("div,span").length : "?"}`);
      const firstWord = title?.querySelector("[data-split] > *");
      const secondLine = title?.querySelector("[data-split]:nth-of-type(2)") ?? title?.querySelectorAll("[data-split]")[1];
      dump("line1-children", firstWord ?? null);
      dump("line2", secondLine ?? null);
      dump("divider", document.querySelector(".testimonial-divider"));
      dump("para", document.querySelector(".testimonial-header-item:last-child"));
      dump("eyebrow", document.querySelector(".testimonial-header-item"));
      dump("stage", document.querySelector(".testimonial-stage"));
      dump("scrim", document.querySelector(".testimonial-scrim"));
      dump("headerInner", document.querySelector(".testimonial-stage")?.parentElement?.querySelector(".z-30 > div") ?? null);
      const h2 = document.querySelector(".testimonial-title");
      if (h2) lines.push(`h2 html: ${h2.innerHTML.slice(0, 600)}`);
      setReport(lines.join("\n"));
    }, 4500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <main id="main-content" tabIndex={-1} className="relative min-h-screen bg-[#0b0b0c]">
      <style>{`nextjs-portal{display:none!important}`}</style>
      <StaggerTestimonials />
      <pre
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          zIndex: 9999,
          maxWidth: "100vw",
          maxHeight: "45vh",
          overflow: "hidden",
          background: "#ff0",
          color: "#000",
          fontSize: 11,
          padding: 6,
          whiteSpace: "pre-wrap",
        }}
      >
        {report}
      </pre>
    </main>
  );
}
