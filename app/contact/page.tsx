"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkle } from "lucide-react";
import gsap from "gsap";
import { Navbar } from "@/components/ui/menu_navbar";

const services = [
  "Website design & development",
  "E-commerce website",
  "SEO & organic growth",
  "Mobile app development",
  "AI product / automation",
  "Website redesign",
  "Something else",
];
const budgets = ["Under $1,000", "$1,000–$3,000", "$3,000–$6,000", "$6,000–$10,000", "$10,000+", "Not sure yet"];
const timelines = ["As soon as possible", "Within 1 month", "1–3 months", "Flexible"];
const steps = ["Project", "Details", "Planning", "Your details"];

type FormData = {
  service: string; projectName: string; summary: string; audience: string;
  features: string; existingUrl: string; budget: string; timeline: string;
  platforms: string; seoFocus: string; integrations: string;
  name: string; email: string; company: string; phone: string;
};
const initial: FormData = {
  service: "", projectName: "", summary: "", audience: "", features: "", existingUrl: "",
  platforms: "", seoFocus: "", integrations: "",
  budget: "", timeline: "", name: "", email: "", company: "", phone: "",
};
const inputClass = "w-full rounded-xl border border-[#566053]/30 bg-white/55 px-4 py-3.5 text-[#122315] placeholder:text-[#999c91] outline-none transition focus:border-[#55dd4a] focus:bg-white/80";
const labelClass = "mb-2 block text-sm font-medium text-[#333333]";

export default function ContactPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const animation = gsap.matchMedia(page);
    animation.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-contact-intro]", { opacity: 0, y: 24, duration: 0.8, stagger: 0.12, ease: "power3.out" });
        gsap.from("[data-contact-panel]", { opacity: 0, y: 30, scale: 0.985, duration: 0.9, delay: 0.15, ease: "power3.out" });
    });
    return () => animation.revert();
  }, []);
  useEffect(() => {
    if (status !== "sent" || !pageRef.current) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });
      timeline.fromTo("[data-success-badge]", { scale: 0, rotation: -24 }, { scale: 1, rotation: 0, duration: 0.65 });
      timeline.fromTo("[data-success-copy]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power3.out" }, "-=0.25");
    }, pageRef);
    return () => context.revert();
  }, [status]);
  const set = (key: keyof FormData, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const validateStep = () => {
    if (step === 0 && !form.service) return "Choose the kind of project you have in mind.";
    if (step === 1 && (!form.projectName.trim() || !form.summary.trim())) return "Add a project name and a short description.";
    if (step === 2 && (!form.budget || !form.timeline)) return "Choose a budget range and timeline, or select “Not sure yet” / “Flexible”.";
    if (step === 3 && (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email))) return "Add your name and a valid email address.";
    return "";
  };
  const next = () => {
    const issue = validateStep();
    if (issue) { setErrorMessage(issue); return; }
    setErrorMessage("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const issue = validateStep();
    if (issue) { setErrorMessage(issue); return; }
    setStatus("sending"); setErrorMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, website: new FormData(event.currentTarget).get("website") }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Your message could not be sent. Please try again.");
      }
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Your message could not be sent. Please try again.");
    }
  };

  return (
    <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#f3ede4] px-5 py-7 text-[#122315] sm:px-8 lg:px-12">
      <Navbar />
      <div className="pointer-events-none absolute -right-44 top-12 size-[30rem] rounded-full bg-[#55dd4a]/[0.08] blur-[130px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 pb-16 pt-20 sm:pt-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:pt-28">
        <aside className="relative overflow-hidden rounded-[1.5rem] bg-[#122315] p-7 text-[#f3ede4] sm:p-10 lg:sticky lg:top-8 lg:self-start lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 size-64 rounded-full border border-[#77e46e]/20" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-8 size-48 rounded-full border border-[#77e46e]/15" />
          <p data-contact-intro className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#77e46e]"><Sparkle size={14} /> Project inquiry</p>
          <h1 data-contact-intro className="relative max-w-xl font-poster text-[2.85rem] font-bold uppercase leading-[0.88] tracking-[-0.045em] sm:text-[3.5rem] lg:text-[3.25rem] xl:text-[4rem] 2xl:text-[4.25rem]"><span className="whitespace-nowrap">Let’s make</span><br /><span className="whitespace-nowrap">your idea</span><br /><span className="text-[#55dd4a]">real.</span></h1>
          <p data-contact-intro className="relative mt-7 max-w-md text-base leading-7 text-[#f3ede4]/70">A few focused questions help me understand what you’re building and how I can help. It takes about two minutes.</p>
          <div className="relative mt-10 hidden border-t border-[#f3ede4]/20 pt-5 sm:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#77e46e]">A good place to start</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#f3ede4]/65">Share the problem you want to solve. We can map the features, scope, and next steps together.</p>
          </div>
          <div className="relative mt-8 inline-flex rotate-[-7deg] items-center rounded-md bg-[#55dd4a] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#122315]">Let’s map it out</div>
        </aside>

        <section data-contact-panel className="rounded-[1.5rem] border border-[#566053]/25 bg-[#f8f3eb] p-5 shadow-xl shadow-[#122315]/10 sm:p-8 lg:p-10">
          {status === "sent" ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[28rem] flex-col items-start justify-center">
              <div data-success-badge className="mb-7 grid size-16 place-items-center rounded-full border-2 border-[#338c2c]/35 bg-[#55dd4a]/25 text-[#122315]"><Check size={28} strokeWidth={2.5} /></div>
              <p data-success-copy className="font-mono text-xs uppercase tracking-[0.2em] text-[#338c2c]">Message received · You’re on the trail</p>
              <h2 data-success-copy className="mt-4 font-poster text-5xl font-bold uppercase leading-none tracking-tight">Thanks, {form.name.split(" ")[0]}.</h2>
              <p data-success-copy className="mt-4 max-w-md leading-7 text-[#626d66]">Your project brief is on its way. I’ll review the details and get back to you at <span className="font-medium text-[#122315]">{form.email}</span>.</p>
              <Link data-success-copy href="/" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#122315] px-5 py-3 text-sm font-semibold text-[#f3ede4] transition hover:bg-[#243a26]">Back to portfolio <ArrowRight size={16} /></Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between gap-4">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#788075]">Step {step + 1} of {steps.length}</p><h2 className="mt-2 font-display text-2xl font-semibold">{steps[step]}</h2></div>
                <span className="font-mono text-xs text-[#788075]">0{step + 1} <span className="text-[#566053]/20">/ 0{steps.length}</span></span>
              </div>
              <div className="mb-9 flex gap-2" aria-label={`Step ${step + 1} of ${steps.length}`}>
                {steps.map((name, index) => <div key={name} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${index <= step ? "bg-[#55dd4a]" : "bg-[#566053]/20"}`} />)}
              </div>
              <form onSubmit={submit}>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="min-h-[22rem]">
                    {step === 0 && <fieldset><legend className="mb-4 text-sm text-[#626d66]">What would you like to build?</legend><div className="grid gap-2 sm:grid-cols-2">{services.map((service) => <button key={service} type="button" onClick={() => set("service", service)} className={`rounded-xl border px-4 py-4 text-left text-sm transition ${form.service === service ? "border-[#55dd4a] bg-[#55dd4a]/15 text-[#122315]" : "border-[#566053]/25 bg-white/45 text-[#566053] hover:border-white/25 hover:text-[#122315]"}`}><span className={`mr-2 inline-block size-2 rounded-full ${form.service === service ? "bg-[#55dd4a]" : "bg-white/20"}`} />{service}</button>)}</div></fieldset>}
                    {step === 1 && <div className="space-y-5"><div><label className={labelClass} htmlFor="projectName">Give your project a working name</label><input id="projectName" className={inputClass} placeholder="e.g. A better way to book appointments" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} maxLength={100} /></div><div><label className={labelClass} htmlFor="summary">{form.service === "SEO & organic growth" ? "What would you like search to do for your business?" : form.service === "Mobile app development" ? "What should the app help people do?" : "What are you hoping to create?"}</label><textarea id="summary" className={`${inputClass} min-h-28 resize-y`} placeholder="Describe the idea, the problem it solves, and what success looks like." value={form.summary} onChange={(e) => set("summary", e.target.value)} maxLength={2500} /></div><div><label className={labelClass} htmlFor="audience">Who is it for? <span className="text-[#788075]">(optional)</span></label><input id="audience" className={inputClass} placeholder="Your customers, your team, everyone…" value={form.audience} onChange={(e) => set("audience", e.target.value)} maxLength={300} /></div>{["Website redesign", "E-commerce website", "SEO & organic growth"].includes(form.service) && <div><label className={labelClass} htmlFor="existingUrl">Current website <span className="text-[#788075]">(optional)</span></label><input id="existingUrl" className={inputClass} type="url" placeholder="https://" value={form.existingUrl} onChange={(e) => set("existingUrl", e.target.value)} maxLength={500} /></div>}{form.service === "SEO & organic growth" && <div><label className={labelClass} htmlFor="seoFocus">Priority services, search terms, or locations <span className="text-[#788075]">(optional)</span></label><input id="seoFocus" className={inputClass} placeholder="e.g. dental clinic in Lahore, online consultations" value={form.seoFocus} onChange={(e) => set("seoFocus", e.target.value)} maxLength={500} /></div>}{form.service === "Mobile app development" && <fieldset><legend className={labelClass}>Which platforms should it support?</legend><div className="grid grid-cols-3 gap-2">{["iOS", "Android", "Both"].map((platform) => <button key={platform} type="button" onClick={() => set("platforms", platform)} className={`rounded-xl border px-3 py-3 text-sm transition ${form.platforms === platform ? "border-[#55dd4a] bg-[#55dd4a]/15 text-[#122315]" : "border-[#566053]/25 text-[#566053] hover:border-white/25"}`}>{platform}</button>)}</div></fieldset>}<div><label className={labelClass} htmlFor="features">{form.service === "SEO & organic growth" ? "What have you tried so far?" : "Must-have features or integrations"} <span className="text-[#788075]">(optional)</span></label><textarea id="features" className={`${inputClass} min-h-24 resize-y`} placeholder={form.service === "SEO & organic growth" ? "Current rankings, analytics, or past SEO work…" : "Bookings, payments, user accounts, search…"} value={form.features} onChange={(e) => set("features", e.target.value)} maxLength={1200} /></div>{["Mobile app development", "AI product / automation"].includes(form.service) && <div><label className={labelClass} htmlFor="integrations">Tools or services to connect <span className="text-[#788075]">(optional)</span></label><input id="integrations" className={inputClass} placeholder="Payments, calendar, CRM, AI provider…" value={form.integrations} onChange={(e) => set("integrations", e.target.value)} maxLength={500} /></div>}</div>}
                    {step === 2 && <div className="space-y-8"><fieldset><legend className={labelClass}>What investment range feels right?</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{budgets.map((budget) => <button key={budget} type="button" onClick={() => set("budget", budget)} className={`rounded-xl border px-3 py-4 text-sm transition ${form.budget === budget ? "border-[#55dd4a] bg-[#55dd4a]/15 text-[#122315]" : "border-[#566053]/25 text-[#566053] hover:border-white/25 hover:text-[#122315]"}`}>{budget}</button>)}</div></fieldset><fieldset><legend className={labelClass}>When would you like to get started?</legend><div className="grid grid-cols-2 gap-2">{timelines.map((timeline) => <button key={timeline} type="button" onClick={() => set("timeline", timeline)} className={`rounded-xl border px-3 py-4 text-sm transition ${form.timeline === timeline ? "border-[#55dd4a] bg-[#55dd4a]/15 text-[#122315]" : "border-[#566053]/25 text-[#566053] hover:border-white/25 hover:text-[#122315]"}`}>{timeline}</button>)}</div></fieldset><p className="text-xs leading-5 text-[#788075]">These are just starting points. We can refine the scope and estimate together.</p></div>}
                    {step === 3 && <div className="space-y-5"><p className="mb-5 text-sm leading-6 text-[#626d66]">Where can I reach you to talk through the next steps?</p><div><label className={labelClass} htmlFor="name">Your name</label><input id="name" autoComplete="name" className={inputClass} placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} /></div><div><label className={labelClass} htmlFor="email">Email address</label><input id="email" autoComplete="email" className={inputClass} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254} /></div><div className="grid gap-5 sm:grid-cols-2"><div><label className={labelClass} htmlFor="company">Company <span className="text-[#788075]">(optional)</span></label><input id="company" autoComplete="organization" className={inputClass} placeholder="Company name" value={form.company} onChange={(e) => set("company", e.target.value)} maxLength={150} /></div><div><label className={labelClass} htmlFor="phone">Phone <span className="text-[#788075]">(optional)</span></label><input id="phone" autoComplete="tel" className={inputClass} type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={50} /></div></div><label className="sr-only" htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden="true" /></div>}
                  </motion.div>
                </AnimatePresence>
                {errorMessage && <p role="alert" className="mb-4 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm text-rose-200">{errorMessage}</p>}
                <div className="mt-7 flex items-center justify-between border-t border-[#566053]/25 pt-6">
                  {step > 0 ? <button type="button" onClick={() => { setErrorMessage(""); setStep((current) => current - 1); }} className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm text-[#626d66] transition hover:text-[#122315]"><ArrowLeft size={16} /> Back</button> : <span className="text-xs text-[#999c91]">No commitment. Just a conversation.</span>}
                  {step < steps.length - 1 ? <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-[#55dd4a] px-5 py-3 text-sm font-semibold text-[#122315] transition hover:bg-[#45c43a]">Continue <ArrowRight size={16} /></button> : <button type="submit" disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-full bg-[#55dd4a] px-5 py-3 text-sm font-semibold text-[#122315] transition hover:bg-[#45c43a] disabled:cursor-wait disabled:opacity-60">{status === "sending" ? "Sending…" : "Send project brief"} <ArrowRight size={16} /></button>}
                </div>
              </form>
            </>
          )}
        </section>
      </div>
      <footer className="relative z-10 mx-auto flex max-w-7xl justify-between border-t border-[#566053]/25 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#999c91]"><span>Gohar Abbas · Portfolio 2026</span><span>Built with intention</span></footer>
    </main>
  );
}
