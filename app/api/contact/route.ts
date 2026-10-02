const recipient = "goharabbas2122804@gmail.com";
const services = ["Website design & development", "E-commerce website", "SEO & organic growth", "Mobile app development", "AI product / automation", "Website redesign", "Something else"];
const allowedFields = ["service", "projectName", "summary", "audience", "features", "existingUrl", "budget", "timeline", "name", "email", "company", "phone", "platforms", "seoFocus", "integrations"] as const;

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: "Contact form email is not configured yet." }, { status: 503 });

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid payload");
    payload = parsed as Record<string, unknown>;
  }
  catch { return Response.json({ error: "Please submit a valid project brief." }, { status: 400 }); }

  // Honeypot field used to filter basic automated submissions.
  if (typeof payload.website === "string" && payload.website.trim()) return Response.json({ ok: true });
  const data = Object.fromEntries(allowedFields.map((key) => [key, typeof payload[key] === "string" ? (payload[key] as string).trim().slice(0, key === "summary" ? 2500 : 1200) : ""])) as Record<(typeof allowedFields)[number], string>;
  if (!data.name || !/^\S+@\S+\.\S+$/.test(data.email) || !services.includes(data.service) || !data.projectName || !data.summary || !data.budget || !data.timeline) {
    return Response.json({ error: "Please complete the required project details and contact fields." }, { status: 400 });
  }

  const rows = [
    ["Name", data.name], ["Email", data.email], ["Company", data.company || "—"], ["Phone", data.phone || "—"],
    ["Service", data.service], ["Project", data.projectName], ["Budget", data.budget], ["Timeline", data.timeline],
    ["Existing website", data.existingUrl || "—"], ["Audience", data.audience || "—"], ["Must-have features / experience", data.features || "—"],
    ["Platforms", data.platforms || "—"], ["SEO focus", data.seoFocus || "—"], ["Integrations", data.integrations || "—"],
  ];
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
  const html = `<main style="font-family:Arial,sans-serif;color:#151719;max-width:680px;margin:auto"><p style="color:#059669;font-size:12px;letter-spacing:2px;text-transform:uppercase">New portfolio inquiry</p><h1 style="font-size:28px">${escapeHtml(data.projectName)}</h1><p style="white-space:pre-wrap;line-height:1.7">${escapeHtml(data.summary)}</p><table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th align="left" style="padding:10px;border-bottom:1px solid #e5e7eb;color:#64748b">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`).join("")}</table></main>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [recipient],
        reply_to: data.email,
        subject: `New ${data.service} inquiry: ${data.projectName.replace(/[\r\n]+/g, " ").slice(0, 100)}`,
        html,
      }),
    });
    if (!response.ok) {
      const resendError = await response.json().catch(() => null) as { message?: string } | null;
      console.error("Resend rejected the contact email", response.status, resendError?.message || "Unknown Resend error");
      if (response.status === 403) {
        return Response.json({ error: "Resend is restricting this recipient. Verify your sending domain in Resend, then set the From address to that verified domain." }, { status: 502 });
      }
      return Response.json({ error: "Email delivery failed. Please try again in a moment." }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact email request failed", error);
    return Response.json({ error: "Email delivery failed. Please try again in a moment." }, { status: 502 });
  }
}
