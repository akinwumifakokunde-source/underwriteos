import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Clock, Video, MapPin, Loader2, CheckCircle2, AlertTriangle, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FOREST = "#0B3D21";
const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const todayStr = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function BookingModal({ open, onClose }) {
  const [viewYear, setViewYear] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [use24h, setUse24h] = useState(true);
  const [stage, setStage] = useState("slots"); // slots | form | done
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", use_case: "" });
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState(null);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    if (!open) return;
    const today = todayStr();
    setSelectedDate(today);
    setStage("slots");
    setBooked(null);
    setBookError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && selectedDate) fetchSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedDate]);

  if (!open) return null;

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    setSlotsError(null);
    setSlots([]);
    try {
      const res = await base44.functions.invoke("apiBookDemo", { action: "availability", date });
      setSlots(res.data?.slots || []);
    } catch (e) {
      setSlotsError(e?.response?.data?.error?.message || "Couldn't load available times.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const fmtTime = (iso) => {
    const dtf = new Intl.DateTimeFormat(use24h ? "en-GB" : "en-US", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !use24h,
    });
    return dtf.format(new Date(iso));
  };

  const fmtDayHeader = (date) => {
    const dt = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/London", weekday: "short" }).format(
      new Date(date + "T12:00:00")
    );
    const day = Number(date.split("-")[2]);
    return `${dt} ${ordinal(day)}`;
  };

  const monthLabel = `${viewYear.toLocaleString("en-US", { month: "long" })} ${viewYear.getFullYear()}`;
  const first = new Date(viewYear.getFullYear(), viewYear.getMonth(), 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(viewYear.getFullYear(), viewYear.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const tStr = todayStr();
  const dateStr = (d) => {
    const mm = String(viewYear.getMonth() + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${viewYear.getFullYear()}-${mm}-${dd}`;
  };
  const isSelectable = (d) => dateStr(d) >= tStr;

  const prevMonth = () => {
    const t = new Date(viewYear);
    t.setMonth(t.getMonth() - 1);
    // don't go before current month
    const now = new Date();
    const cur = new Date(now.getFullYear(), now.getMonth(), 1);
    if (t < cur) return;
    setViewYear(t);
  };
  const nextMonth = () => {
    const t = new Date(viewYear);
    t.setMonth(t.getMonth() + 1);
    setViewYear(t);
  };

  const pickSlot = (iso) => {
    setSelectedSlot(iso);
    setStage("form");
    setBookError(null);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    setBooking(true);
    setBookError(null);
    try {
      const res = await base44.functions.invoke("apiBookDemo", {
        action: "book",
        start: selectedSlot,
        name: form.name,
        email: form.email,
        company: form.company,
        use_case: form.use_case,
      });
      setBooked(res.data);
      setStage("done");
    } catch (err) {
      setBookError(err?.response?.data?.error?.message || err.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const inputCls = "w-full text-sm rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-[#111] placeholder-[#9a9a9a] focus:outline-none focus:border-[#0B3D21] focus:ring-2 focus:ring-[#0B3D21]/15 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#f0f0f0]">
          <div>
            <h2 className="text-xl font-semibold text-[#111]">From documents to decision-ready memo.</h2>
            <p className="mt-1 text-sm text-[#666]">See it run on one of your files.</p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#111] -mt-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {stage === "done" && booked ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E8F5E9" }}>
              <CheckCircle2 className="w-7 h-7" style={{ color: FOREST }} />
            </div>
            <h3 className="text-lg font-semibold text-[#111]">You're booked in</h3>
            <p className="mt-1.5 text-sm text-[#666]">
              {new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(booked.start))} · 30 min · Google Meet
            </p>
            <p className="mt-1 text-sm text-[#666]">A calendar invite has been sent to {form.email}.</p>
            {booked.hangoutLink && (
              <a
                href={booked.hangoutLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-full"
                style={{ backgroundColor: FOREST }}
              >
                <Video className="w-4 h-4" /> Join Google Meet
              </a>
            )}
            <div className="mt-5">
              <button onClick={onClose} className="text-sm text-[#666] hover:text-[#111]">Close</button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-[260px_1fr_220px] gap-0">
            {/* Left — event details */}
            <div className="p-6 border-r border-[#f0f0f0]">
              <div className="flex -space-x-2 mb-3">
                {["#0B3D21", "#2E7D32"].map((c, i) => (
                  <span key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-semibold" style={{ backgroundColor: c }}>
                    {["C", "D"][i]}
                  </span>
                ))}
              </div>
              <div className="text-sm font-semibold text-[#111]">CreditDecide</div>
              <h3 className="mt-1 text-lg font-semibold text-[#111]">Product Demo</h3>
              <p className="mt-2 text-[13px] text-[#666] leading-relaxed">
                Book a 30-minute walkthrough. We'll run CreditDecide on one of your files and walk you through the memo, evidence and decision.
              </p>
              <ul className="mt-4 space-y-2.5 text-[13px] text-[#444]">
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#999]" /> 30m</li>
                <li className="flex items-center gap-2"><Video className="w-4 h-4 text-[#999]" /> Google Meet</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#999]" /> Europe/London</li>
              </ul>
            </div>

            {/* Center — calendar */}
            <div className="p-6 border-r border-[#f0f0f0]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#111]">{monthLabel}</span>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="w-7 h-7 rounded-md hover:bg-[#f5f5f5] flex items-center justify-center text-[#666]"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={nextMonth} className="w-7 h-7 rounded-md hover:bg-[#f5f5f5] flex items-center justify-center text-[#666]"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#999] mb-1">
                {DOW.map((d) => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (d === null) return <div key={i} />;
                  const ds = dateStr(d);
                  const selectable = isSelectable(d);
                  const selected = ds === selectedDate;
                  return (
                    <button
                      key={i}
                      disabled={!selectable}
                      onClick={() => setSelectedDate(ds)}
                      className={`relative h-10 rounded-lg text-sm transition-colors ${
                        selected
                          ? "text-white"
                          : selectable
                          ? "text-[#111] hover:bg-[#ebebeb] bg-[#f5f5f5]"
                          : "text-[#bbb] cursor-not-allowed"
                      }`}
                      style={selected ? { backgroundColor: "#111" } : undefined}
                    >
                      {d}
                      {selected && <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-1 h-1 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#999]">
                <CalendarDays className="w-3.5 h-3.5" /> Times shown in Europe/London · live availability
              </div>
            </div>

            {/* Right — slots / form */}
            <div className="p-6 flex flex-col">
              {stage === "form" ? (
                <form onSubmit={confirmBooking} className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[#111]">{fmtDayHeader(selectedDate)}</span>
                    <button type="button" onClick={() => setStage("slots")} className="text-[11px] text-[#666] hover:text-[#111]">Back</button>
                  </div>
                  <div className="rounded-lg bg-[#f5f5f5] px-3 py-2 text-[13px] text-[#444] mb-3">
                    {fmtTime(selectedSlot)} · 30 min
                  </div>
                  <div className="space-y-2.5">
                    <input className={inputCls} placeholder="Full name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input type="email" className={inputCls} placeholder="Work email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input className={inputCls} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    <textarea rows={2} className={inputCls} placeholder="Use case (optional)" value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })} />
                  </div>
                  {bookError && (
                    <div className="mt-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {bookError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={booking}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-full disabled:opacity-70"
                    style={{ backgroundColor: FOREST }}
                  >
                    {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />} Confirm booking
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[#111]">{selectedDate ? fmtDayHeader(selectedDate) : "Select a day"}</span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button onClick={() => setUse24h(false)} className={`px-1.5 py-0.5 rounded ${!use24h ? "bg-[#111] text-white" : "text-[#999]"}`}>12h</button>
                      <button onClick={() => setUse24h(true)} className={`px-1.5 py-0.5 rounded ${use24h ? "bg-[#111] text-white" : "text-[#999]"}`}>24h</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: "320px" }}>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8 text-[#999]"><Loader2 className="w-5 h-5 animate-spin" /></div>
                    ) : slotsError ? (
                      <div className="text-[12px] text-rose-600 px-1 py-4">{slotsError}</div>
                    ) : slots.length === 0 ? (
                      <div className="text-[12px] text-[#999] px-1 py-6 text-center">No times available — try the next day.</div>
                    ) : (
                      <div className="space-y-2">
                        {slots.map((iso) => (
                          <button
                            key={iso}
                            onClick={() => pickSlot(iso)}
                            className="w-full text-[13px] text-[#111] rounded-lg border border-[#e5e5e5] hover:border-[#111] hover:bg-[#fafafa] px-3 py-2 transition-colors"
                          >
                            {fmtTime(iso)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#f0f0f0]">
          <span className="text-[11px] text-[#bbb]">Powered by Google Calendar</span>
          <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#bbb] hover:text-[#666]">Open scheduling in a new tab</a>
        </div>
      </div>
    </div>
  );
}