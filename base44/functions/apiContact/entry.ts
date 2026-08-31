import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const TO = "akinfaks@yahoo.com";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: { code: "INVALID_BODY", message: "Invalid JSON body." } }, { status: 400 });
    }

    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 200);
    const message = String(body.message || "").trim().slice(0, 4000);

    if (!name || !email || !message) {
      return Response.json({ error: { code: "MISSING_FIELDS", message: "Name, email, and message are required." } }, { status: 400 });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return Response.json({ error: { code: "INVALID_EMAIL", message: "A valid email is required." } }, { status: 400 });
    }

    const subject = `New contact message from ${name}`;
    const bodyText = [
      `New message from the CreditDecide contact form.`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      ``,
      `Message:`,
      message,
    ].join("\n");

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: TO,
      subject,
      body: bodyText,
      from_name: "CreditDecide Contact",
    });

    return Response.json({ ok: true, delivered_to: TO });
  } catch (error) {
    return Response.json({ error: { code: "SEND_FAILED", message: error?.message || "Failed to send message." } }, { status: 500 });
  }
}