import React, { useMemo } from "react";
import { Plane } from "lucide-react";

// Dotted globe rendered as an orthographic projection of a lat/long dot grid,
// with two soft "landmass" blobs approximating the Americas, a few glowing
// hubs, and a flight-path arc with an airplane at its origin.
const R = 150;
const CX = 200;
const CY = 200;
const ROT = (60 * Math.PI) / 180; // rotate so the Americas face the viewer

const inLand = (lat, lon) => {
  const d1 = Math.hypot(lat - 45, lon + 100); // North America blob
  const d2 = Math.hypot(lat + 15, lon + 60); // South America blob
  return d1 < 40 || d2 < 34;
};

const HUBS = [
  { lat: 40, lon: -74 },   // New York
  { lat: -23, lon: -46 },  // São Paulo
  { lat: 19, lon: -99 },   // Mexico City
];

export default function GlobeGraphic() {
  const { dots, hubs } = useMemo(() => {
    const dots = [];
    for (let lat = -80; lat <= 80; lat += 7) {
      for (let lon = -180; lon <= 180; lon += 7) {
        const latR = (lat * Math.PI) / 180;
        const lonR = (lon * Math.PI) / 180 + ROT;
        const z = Math.cos(latR) * Math.cos(lonR);
        if (z < 0) continue; // front hemisphere only
        const x = R * Math.cos(latR) * Math.sin(lonR);
        const y = R * Math.sin(latR);
        dots.push({ x: CX + x, y: CY - y, z, land: inLand(lat, lon) });
      }
    }
    const hubs = HUBS.map((p) => {
      const latR = (p.lat * Math.PI) / 180;
      const lonR = (p.lon * Math.PI) / 180 + ROT;
      return { x: CX + R * Math.cos(latR) * Math.sin(lonR), y: CY - R * Math.sin(latR) };
    });
    return { dots, hubs };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* atmospheric halo */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          className="w-[330px] h-[330px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46,204,113,0.22) 0%, rgba(46,204,113,0.06) 45%, transparent 70%)",
            filter: "blur(18px)",
          }}
        />
      </div>

      <svg viewBox="0 0 400 400" className="relative w-full h-full">
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.land ? 1.8 : 1.2}
            fill={d.land ? "#a3f5c7" : "#2ecc71"}
            opacity={d.land ? 0.92 : 0.22 + d.z * 0.28}
          />
        ))}

        {/* active hubs */}
        {hubs.map((h, i) => (
          <g key={i}>
            <circle cx={h.x} cy={h.y} r={7} fill="#a3f5c7" opacity="0.22" />
            <circle cx={h.x} cy={h.y} r={2.8} fill="#a3f5c7" />
          </g>
        ))}

        {/* flight trajectory: glow underlay + bright line */}
        <path
          d="M 42 150 Q 128 58 212 150"
          fill="none"
          stroke="#2ecc71"
          strokeWidth="5"
          opacity="0.18"
          strokeLinecap="round"
        />
        <path
          d="M 42 150 Q 128 58 212 150"
          fill="none"
          stroke="#a3f5c7"
          strokeWidth="1.4"
          opacity="0.85"
          strokeLinecap="round"
          strokeDasharray="0"
        />
      </svg>

      {/* airplane at the arc origin (left side, pointing toward the globe) */}
      <div
        className="absolute"
        style={{ left: "10.5%", top: "37.5%", transform: "translate(-50%, -50%)" }}
        aria-hidden
      >
        <Plane className="w-5 h-5 text-white drop-shadow-[0_0_6px_rgba(163,245,199,0.6)]" />
      </div>
    </div>
  );
}