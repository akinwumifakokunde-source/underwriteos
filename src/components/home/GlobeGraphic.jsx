import React, { useEffect, useRef } from "react";

// Animated dotted globe on a canvas. It eases its rotation to bring the active
// market's coordinates to the front, highlights that node with a pulsing ring,
// and flies a small plane along an arc to it. Continuously rolling forward.

const R = 150;
const CX = 200;
const CY = 200;

// Simplified continent outlines (lat, lon) so the dot grid resolves into a
// recognizable world map as the globe rolls. Point-in-polygon land test.
const CONTINENTS = [
  // North America — Alaska across Canada, down the east coast, around the Gulf
  // and Central America, back up the west coast.
  [[66,-165],[70,-140],[72,-100],[68,-85],[60,-72],[50,-58],[44,-60],[40,-72],[34,-78],[30,-80],[26,-80],[25,-82],[28,-90],[29,-95],[26,-98],[20,-97],[15,-93],[11,-85],[9,-78],[14,-90],[18,-100],[24,-110],[30,-116],[38,-122],[48,-128],[58,-135],[64,-155],[66,-165]],
  // Greenland
  [[80,-30],[80,-18],[74,-16],[68,-24],[64,-40],[70,-50],[76,-55],[80,-45],[80,-30]],
  // South America — top of Colombia down to Tierra del Fuego and back up the west.
  [[10,-72],[6,-60],[2,-50],[-3,-42],[-8,-35],[-15,-39],[-24,-43],[-34,-52],[-44,-63],[-52,-68],[-55,-70],[-50,-74],[-40,-72],[-30,-71],[-20,-70],[-12,-77],[-5,-81],[2,-79],[8,-77],[10,-72]],
  // Europe
  [[60,-6],[62,18],[60,30],[56,36],[50,40],[45,28],[40,26],[38,20],[40,14],[43,8],[44,0],[48,-6],[55,-8],[60,-6]],
  // Africa — Mediterranean coast across to the Horn, down the east to the Cape,
  // back up the west coast.
  [[36,-7],[34,12],[32,22],[30,33],[24,36],[18,38],[12,43],[10,51],[0,43],[-6,41],[-12,40],[-22,35],[-30,32],[-34,20],[-34,17],[-30,15],[-22,14],[-12,12],[-2,9],[5,0],[8,-4],[9,-8],[12,-14],[18,-17],[24,-12],[30,-10],[34,-9],[36,-7]],
  // Asia — Siberia across to the Pacific, down through China and SE Asia to the
  // Indian subcontinent and back across the Middle East.
  [[70,28],[74,55],[76,90],[72,130],[66,165],[60,162],[55,148],[50,140],[45,135],[40,128],[35,122],[30,120],[24,118],[20,110],[14,106],[8,100],[6,103],[10,98],[16,94],[20,88],[24,80],[22,70],[26,62],[30,56],[36,50],[42,46],[48,42],[54,36],[58,32],[64,28],[70,28]],
  // Oceania — Australia + New Guinea arc
  [[-8,115],[-10,125],[-14,135],[-22,142],[-34,150],[-38,146],[-36,138],[-34,130],[-30,122],[-26,116],[-20,114],[-12,113],[-8,115]],
  // New Zealand
  [[-34,173],[-38,176],[-43,170],[-46,167],[-44,170],[-40,174],[-35,174],[-34,173]],
];

const pointInPoly = (lat, lon, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i]; // [lat, lon]
    const [yj, xj] = poly[j];
    const intersect = (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
    if ((yi > lat) !== (yj > lat) && intersect) inside = !inside;
  }
  return inside;
};
const isLand = (lat, lon) => CONTINENTS.some((p) => pointInPoly(lat, lon, p));

const DOTS = [];
for (let lat = -78; lat <= 80; lat += 5) {
  for (let lon = -180; lon <= 180; lon += 5) {
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
          className="w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] lg:w-[600px] lg:h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(46,204,113,0.28) 0%, rgba(46,204,113,0.08) 45%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ width: "100%", maxWidth: 600, aspectRatio: "1 / 1", height: "auto" }}
      />
    </div>
  );
}