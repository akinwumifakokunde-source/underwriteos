import React, { useEffect, useRef } from "react";

// Animated dotted globe on a canvas. It eases its rotation to bring the active
// market's coordinates to the front, highlights that node with a pulsing ring,
// and flies a small plane along an arc to it. Continuously rolling forward.

const R = 150;
const CX = 200;
const CY = 200;

// Rough continent blobs so land dots read as a world map as the globe rolls.
const BLOBS = [
  { lat: 45, lon: -100, r: 42 }, // North America
  { lat: -15, lon: -60, r: 36 }, // South America
  { lat: 50, lon: 12, r: 20 },   // Europe
  { lat: 5, lon: 20, r: 40 },    // Africa
  { lat: 35, lon: 95, r: 55 },   // Asia
  { lat: -25, lon: 135, r: 22 }, // Oceania
];
const isLand = (lat, lon) => BLOBS.some((b) => Math.hypot(lat - b.lat, lon - b.lon) < b.r);

const DOTS = [];
for (let lat = -80; lat <= 80; lat += 7) {
  for (let lon = -180; lon <= 180; lon += 7) {
    DOTS.push({ latR: (lat * Math.PI) / 180, lon, land: isLand(lat, lon) });
  }
}

const bezier = (p, x0, y0, x1, y1, x2, y2) => {
  const u = 1 - p;
  return { x: u * u * x0 + 2 * u * p * x1 + p * p * x2, y: u * u * y0 + 2 * u * p * y1 + p * p * y2 };
};
const bezierTangent = (p, x0, x1, x2) => 2 * (1 - p) * (x1 - x0) + 2 * p * (x2 - x1);

function drawPlane(ctx, x, y, ang, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.PI / 2);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#a1f0c1";
  ctx.shadowColor = "#a1f0c1";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(5, 4);
  ctx.lineTo(2, 4);
  ctx.lineTo(2, 7);
  ctx.lineTo(-2, 7);
  ctx.lineTo(-2, 4);
  ctx.lineTo(-5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function GlobeGraphic({ market }) {
  const canvasRef = useRef(null);
  const rotRef = useRef(0);
  const targetRef = useRef(0);
  const marketRef = useRef(market);
  const rafRef = useRef(0);

  // Recompute target rotation (always rolling forward) when the market changes.
  useEffect(() => {
    marketRef.current = market;
    let t = (-market.lon * Math.PI) / 180;
    t = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    while (t < rotRef.current + 0.3) t += 2 * Math.PI;
    targetRef.current = t;
  }, [market]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const loop = (time) => {
      rotRef.current += (targetRef.current - rotRef.current) * 0.05;
      // normalize once settled so rotation never accumulates beyond 2π
      if (Math.abs(targetRef.current - rotRef.current) < 0.01) {
        rotRef.current = ((rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        targetRef.current = rotRef.current;
      }
      const rot = rotRef.current;
      ctx.clearRect(0, 0, 400, 400);

      for (const d of DOTS) {
        const lonR = (d.lon * Math.PI) / 180 + rot;
        const z = Math.cos(d.latR) * Math.cos(lonR);
        if (z < 0) continue;
        const x = CX + R * Math.cos(d.latR) * Math.sin(lonR);
        const y = CY - R * Math.sin(d.latR);
        ctx.globalAlpha = d.land ? 0.92 : 0.16 + z * 0.3;
        ctx.fillStyle = d.land ? "#a1f0c1" : "#2ecc71";
        ctx.beginPath();
        ctx.arc(x, y, d.land ? 1.8 : 1.2, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const m = marketRef.current;
      const aLatR = (m.lat * Math.PI) / 180;
      const aLonR = (m.lon * Math.PI) / 180 + rot;
      const az = Math.cos(aLatR) * Math.cos(aLonR);
      if (az > 0.15) {
        const ax = CX + R * Math.cos(aLatR) * Math.sin(aLonR);
        const ay = CY - R * Math.sin(aLatR);
        const fade = Math.min(1, (az - 0.15) / 0.4);
        const pulse = 6 + 3 * Math.sin(time / 300);

        ctx.globalAlpha = 0.22 * fade;
        ctx.fillStyle = "#a1f0c1";
        ctx.beginPath(); ctx.arc(ax, ay, pulse + 5, 0, 2 * Math.PI); ctx.fill();
        ctx.globalAlpha = 0.4 * fade;
        ctx.beginPath(); ctx.arc(ax, ay, 5.5, 0, 2 * Math.PI); ctx.fill();
        ctx.globalAlpha = fade;
        ctx.beginPath(); ctx.arc(ax, ay, 2.8, 0, 2 * Math.PI); ctx.fill();

        const sx = 42, sy = 150;
        const cx = (sx + ax) / 2;
        const cy = Math.min(sy, ay) - 70;
        ctx.strokeStyle = `rgba(46,204,113,${0.18 * fade})`;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ax, ay); ctx.stroke();
        ctx.strokeStyle = `rgba(161,240,193,${0.85 * fade})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ax, ay); ctx.stroke();

        const p = (time % 3000) / 3000;
        const pt = bezier(p, sx, sy, cx, cy, ax, ay);
        const tx = bezierTangent(p, sx, cx, ax);
        const ty = bezierTangent(p, sy, cy, ay);
        drawPlane(ctx, pt.x, pt.y, Math.atan2(ty, tx), fade);
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <div
          className="w-[330px] h-[330px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46,204,113,0.22) 0%, rgba(46,204,113,0.06) 45%, transparent 70%)",
            filter: "blur(18px)",
          }}
        />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ width: "100%", maxWidth: 480, aspectRatio: "1 / 1", height: "auto" }}
      />
    </div>
  );
}