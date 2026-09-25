import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const TO = "akinwumi.fakokunde@gmail.com";

const PARTNER_TYPES = ["Reseller", "Implementation partner", "Referral partner", "Technology partner"];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: { code: "INVALID_BODY", message: "Invalid JSON body." } }, { status: 400 });
    }

    const company = String(body.company || "").trim().slice(0, 200);
    const contact_name = String(body.contact_name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 200);
    const phone = String(body.phone || "").trim().slice(0, 60);
    const country = String(body.country || "").trim().slice(0, 120);
    const website = String(body.website || "").trim().slice(0, 300);
    const partner_type = String(body.partner_type || "").trim().slice(0, 60);
    const region = String(body.region || "").trim().slice(0, 300);
    const client_base = String(body.client_base || "").trim().slice(0, 200);
    const years = String(body.years || "").trim().slice(0, 40);
    const lending_focus = String(body.lending_focus || "").trim().slice(0, 1000);
    const motivation = String(body.motivation || "").trim().slice(0, 4000);

    if (!company || !contact_name || !email || !country || !partner_type) {
      return Response.json({ error: { code: "MISSING_FIELDS", message: "Company, contact name, email, country and partner type are required." } }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: { code: "INVALID_EMAIL", message: "A valid email is required." } }, { status: 400 });
    }
    if (!PARTNER_TYPES.includes(partner_type)) {
      return Response.json({ error: { code: "INVALID_TYPE", message: "Select a valid partner type." } }, { status: 400 });
    }

    const subject = `New partner application — ${company} (${partner_type})`;
    const lines = [
      `New partner application from the CreditDecide Partners page.`,
      ``,
      `Company: ${company}`,
      `Contact: ${contact_name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      `Country / HQ: ${country}`,
      website ? `Website: ${website}` : "",
      `Partner type: ${partner_type}`,
      region ? `Regions / markets to deploy into: ${region}` : "",
      client_base ? `Current client base: ${client_base}` : "",
      years ? `Years in operation: ${years}` : "",
      lending_focus ? `Lending focus: ${lending_focus}` : "",
      motivation ? `Why partner with CreditDecide: ${motivation}` : "",
    ].filter(Boolean);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: TO,
      subject,
      body: lines.join("\n"),
      from_name: "CreditDecide Partners",
    });

    return Response.json({ ok: true, delivered_to: TO });
  } catch (error) {
    return Response.json({ error: { code: "SEND_FAILED", message: error?.message || "Failed to submit application." } }, { status: 500 });
  }
}