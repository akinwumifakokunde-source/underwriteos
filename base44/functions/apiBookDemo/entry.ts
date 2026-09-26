import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const ORGANIZER = "akinwumi.fakokunde@gmail.com";
const TZ = "Europe/London";
const SLOT_MINUTES = 30;
const START_HOUR = 9;
const END_HOUR = 20;
// Ignore events longer than this — they're placeholders/junk (e.g. a 5-year "intake"),
// not real meetings a demo would conflict with.
const MAX_MEETING_HOURS = 24;

// Europe/London is UTC+0 (GMT) except BST (last Sun March -> last Sun Oct), UTC+1.
function londonOffsetHours(year, month, day) {
  const lastSundayUTC = (y, m) => {
    const d = new Date(Date.UTC(y, m, 31));
    return Date.UTC(y, m, 31 - d.getUTCDay());
  };
  const bstStart = lastSundayUTC(year, 2);
  const bstEnd = lastSundayUTC(year, 9);
  const t = Date.UTC(year, month, day);
  return (t >= bstStart && t < bstEnd) ? 1 : 0;
}

// Real busy intervals from the events list, filtering out all-day events,
// "Free" (transparent) events, and junk multi-day placeholders.
async function fetchBusy(auth, timeMin, timeMax) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ORGANIZER)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url, { headers: auth });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Calendar query failed");
  }
  const data = await res.json();
  const busy = [];
  for (const e of data.items || []) {
    if (!e.start?.dateTime || !e.end?.dateTime) continue; // skip all-day
    if (e.transparency === "transparent") continue; // marked Free
    const s = new Date(e.start.dateTime).getTime();
    const en = new Date(e.end.dateTime).getTime();
    if (!isFinite(s) || !isFinite(en)) continue;
    if ((en - s) > MAX_MEETING_HOURS * 3600 * 1000) continue; // skip junk long events
    busy.push({ start: s, end: en });
  }
  return busy;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
    const auth = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    if (action === "availability") {
      const date = body.date;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return Response.json({ error: "Invalid date" }, { status: 400 });
      }
      const [y, m, d] = date.split("-").map(Number);
      // Mon–Fri only: 0 = Sunday, 6 = Saturday
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      if (dow === 0 || dow === 6) {
        return Response.json({ slots: [], tz: TZ });
      }
      const offset = londonOffsetHours(y, m - 1, d);
      const dayStart = Date.UTC(y, m - 1, d, START_HOUR - offset, 0, 0);
      const dayEnd = Date.UTC(y, m - 1, d, END_HOUR - offset, 0, 0);

      const busy = await fetchBusy(auth, new Date(dayStart).toISOString(), new Date(dayEnd).toISOString());

      const slots = [];
      const now = Date.now();
      for (let t = dayStart; t + SLOT_MINUTES * 60000 <= dayEnd; t += SLOT_MINUTES * 60000) {
        const sEnd = t + SLOT_MINUTES * 60000;
        if (sEnd <= now) continue;
        const overlap = busy.some((r) => t < r.end && sEnd > r.start);
        if (!overlap) slots.push(new Date(t).toISOString());
      }
      return Response.json({ slots, tz: TZ });
    }

    if (action === "book") {
      const { start, name, email, company, use_case, meeting_type } = body;
      if (!start || !email || !name) {
        return Response.json({ error: "Name, email and a time are required." }, { status: 400 });
      }
      if (String(name).length > 120 || String(email).length > 200) {
        return Response.json({ error: "Invalid input." }, { status: 400 });
      }
      const isPartner = meeting_type === "partner";
      const startMs = new Date(start).getTime();
      if (isNaN(startMs)) return Response.json({ error: "Invalid time." }, { status: 400 });
      const endMs = startMs + SLOT_MINUTES * 60000;
      if (endMs <= Date.now()) {
        return Response.json({ error: "That time is in the past." }, { status: 400 });
      }

      // Realtime conflict re-check before creating
      try {
        const busy = await fetchBusy(auth, new Date(startMs).toISOString(), new Date(endMs).toISOString());
        const conflict = busy.some((r) => startMs < r.end && endMs > r.start);
        if (conflict) {
          return Response.json({ error: "That time was just taken. Please pick another slot." }, { status: 409 });
        }
      } catch (e) {
        // proceed — the create call will still validate
      }

      const requestId = crypto.randomUUID();
      const evRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ORGANIZER)}/events?conferenceDataVersion=1`,
        {
          method: "POST",
          headers: auth,
          body: JSON.stringify({
            summary: isPartner
              ? `CreditDecide Partner Intro — ${company || name}`
              : `CreditDecide Demo — ${company || name}`,
            description: [
              isPartner
                ? "Booked via the CreditDecide partner page."
                : "Booked via the CreditDecide demo page.",
              "",
              `Name: ${name}`,
              `Email: ${email}`,
              `Company: ${company || "—"}`,
              `Use case: ${use_case || "—"}`,
            ].join("\n"),
            start: { dateTime: new Date(startMs).toISOString(), timeZone: TZ },
            end: { dateTime: new Date(endMs).toISOString(), timeZone: TZ },
            attendees: [{ email }],
            conferenceData: {
              createRequest: { requestId, conferenceSolutionKey: { type: "hangoutsMeet" } },
            },
            guestsCanModify: false,
            guestsCanInviteOthers: false,
          }),
        }
      );
      if (!evRes.ok) {
        const err = await evRes.json().catch(() => ({}));
        return Response.json({ error: err?.error?.message || "Failed to create the booking." }, { status: 502 });
      }
      const ev = await evRes.json();

      // Notify the admin that a new booking was made
      try {
        const when = new Intl.DateTimeFormat("en-GB", {
          dateStyle: "full", timeStyle: "short", timeZone: TZ,
        }).format(new Date(startMs));
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ORGANIZER,
          subject: isPartner
            ? `New partner intro booked — ${name}${company ? ` (${company})` : ""}`
            : `New demo booked — ${name}${company ? ` (${company})` : ""}`,
          body: [
            `A new ${isPartner ? "partner intro" : "product demo"} has been booked.`,
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            `Company: ${company || "—"}`,
            `Use case: ${use_case || "—"}`,
            `When: ${when} (${TZ})`,
            `Duration: 30 minutes`,
            ev.hangoutLink ? `Google Meet: ${ev.hangoutLink}` : "",
            ev.htmlLink ? `Calendar event: ${ev.htmlLink}` : "",
          ].filter(Boolean).join("\n"),
        });
      } catch (e) {
        // non-fatal — the booking itself still succeeded
      }

      return Response.json({
        id: ev.id,
        hangoutLink: ev.hangoutLink,
        start: ev.start?.dateTime,
        end: ev.end?.dateTime,
        htmlLink: ev.htmlLink,
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}