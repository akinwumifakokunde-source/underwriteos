import React, { useState } from "react";
import { Play, MonitorPlay } from "lucide-react";

// Paste your demo video embed URL here to make it live.
//   Loom:     https://www.loom.com/embed/<id>
//   YouTube:  https://www.youtube.com/embed/<id>
// Leave empty to show a "coming soon" placeholder.
const DEMO_VIDEO_URL = "";

const HIGHLIGHTS = [
  "Create borrower & application",
  "Pull credit + bank data",
  "Normalize into risk signals",
  "Policy evaluation & AI memo",
  "Defensible decision",
];

export default function DemoVideo() {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(DEMO_VIDEO_URL);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20" id="demo">
      <div className="max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> Watch the demo
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          A full underwriting decision, end to end, in 60 seconds.
        </h2>
        <p className="mt-4 text-[#a0a5b0] leading-relaxed">
          No login required to watch — see the entire pipeline run from borrower intake to a traceable, defensible decision.
        </p>
      </div>

      <div className="rounded-2xl border border-[#2a2f3a] bg-[#13161f] overflow-hidden">
        <div className="relative w-full aspect-video bg-[#0a0c12]">
          {hasVideo && playing ? (
            <iframe
              src={DEMO_VIDEO_URL}
              className="absolute inset-0 w-full h-full"
              title="UnderwriteOS demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : hasVideo ? (
            <button
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#00e6b8] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-[#0a0c12] ml-1" />
              </div>
              <span className="text-sm text-[#a0a5b0]">Play 60-second demo</span>
            </button>
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1c2029] border border-[#2a2f3a] flex items-center justify-center">
                <MonitorPlay className="w-7 h-7 text-[#5b6472]" />
              </div>
              <span className="text-sm text-[#5b6472]">Demo video coming soon</span>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-[#1c2029]">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {HIGHLIGHTS.map((h, i) => (
              <div key={h} className="flex items-center gap-2 text-xs text-[#c7ccd6]">
                <span className="text-[#00e6b8] font-mono">{String(i + 1).padStart(2, "0")}</span>
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}