import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";

// NEON RUN — a tiny neon-retro endless runner shown while analysis runs.
// Pure presentational canvas game. Controls: Space / tap to jump, Esc to close.

const W = 800;
const H = 300;
const GROUND_Y = 240;
const GRAVITY = 0.9;
const JUMP_V = -15;
const PLAYER_SIZE = 26;

export default function NeonRun({ onClose }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("ready"); // ready | playing | dead
  const [speed, setSpeed] = useState(340);
  const stateRef = useRef({
    phase: "ready",
    player: { y: GROUND_Y - PLAYER_SIZE, vy: 0 },
    obstacles: [],
    speed: 340,
    dist: 0,
    spawnAt: 60,
    last: 0,
  });

  // keep phase in ref for the loop
  useEffect(() => {
    stateRef.current.phase = phase;
  }, [phase]);

  const reset = () => {
    const s = stateRef.current;
    s.player = { y: GROUND_Y - PLAYER_SIZE, vy: 0 };
    s.obstacles = [];
    s.speed = 340;
    s.dist = 0;
    s.spawnAt = 60;
    setScore(0);
    setSpeed(340);
  };

  const start = () => {
    reset();
    setPhase("playing");
  };

  const jump = () => {
    const s = stateRef.current;
    if (s.phase === "ready") {
      start();
      return;
    }
    if (s.phase === "dead") {
      start();
      return;
    }
    if (s.player.y >= GROUND_Y - PLAYER_SIZE - 1) {
      s.player.vy = JUMP_V;
    }
  };

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      } else if (e.code === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const draw = (ts) => {
      const s = stateRef.current;
      if (!s.last) s.last = ts;
      const dt = Math.min(32, ts - s.last) / 16.67; // normalized to ~60fps
      s.last = ts;

      // background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a0b2e");
      grad.addColorStop(1, "#0d0517");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // grid floor
      ctx.strokeStyle = "rgba(75,0,130,0.35)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = GROUND_Y; y <= H; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // neon floor line
      ctx.strokeStyle = "#00f2ff";
      ctx.shadowColor = "#00f2ff";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (s.phase === "playing") {
        s.dist += s.speed * dt * 0.02;
        s.speed = 340 + Math.floor(s.dist * 0.6);
        setSpeed(s.speed);

        // player physics
        s.player.vy += GRAVITY * dt;
        s.player.y += s.player.vy * dt;
        if (s.player.y > GROUND_Y - PLAYER_SIZE) {
          s.player.y = GROUND_Y - PLAYER_SIZE;
          s.player.vy = 0;
        }

        // spawn obstacles
        s.spawnAt -= dt;
        if (s.spawnAt <= 0) {
          const h = 18 + Math.random() * 22;
          s.obstacles.push({ x: W + 10, w: 16 + Math.random() * 10, h });
          s.spawnAt = 40 + Math.random() * 50;
        }
        // move obstacles
        s.obstacles.forEach((o) => (o.x -= s.speed * dt * 0.06));
        s.obstacles = s.obstacles.filter((o) => o.x + o.w > -20);

        // collision
        const px = 70;
        const py = s.player.y;
        for (const o of s.obstacles) {
          if (
            px < o.x + o.w - 2 &&
            px + PLAYER_SIZE - 2 > o.x &&
            py < GROUND_Y - 2 &&
            py + PLAYER_SIZE > GROUND_Y - o.h
          ) {
            s.phase = "dead";
            setPhase("dead");
          }
        }

        setScore(Math.floor(s.dist));
      }

      // draw obstacles (purple spikes)
      ctx.fillStyle = "#4b0082";
      ctx.shadowColor = "#7c3aed";
      ctx.shadowBlur = 6;
      s.obstacles.forEach((o) => {
        const baseY = GROUND_Y;
        ctx.beginPath();
        ctx.moveTo(o.x, baseY);
        ctx.lineTo(o.x + o.w / 2, baseY - o.h);
        ctx.lineTo(o.x + o.w, baseY);
        ctx.closePath();
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // draw player (magenta square, cyan eyes, lime glow)
      ctx.shadowColor = "#ccff00";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(70, s.player.y, PLAYER_SIZE, PLAYER_SIZE);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#00f2ff";
      ctx.fillRect(76, s.player.y + 7, 4, 4);
      ctx.fillRect(86, s.player.y + 7, 4, 4);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden border border-[#2a1a44] shadow-2xl"
        onClick={(e) => {
          if (e.target === e.currentTarget) jump();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0517] border-b border-[#2a1a44]">
          <div className="flex items-baseline gap-3">
            <span className="text-white font-bold tracking-wide text-sm uppercase">Neon Run</span>
            <span className="text-[#00f2ff] font-mono text-[11px]">{speed} PX/S</span>
          </div>
          <span className="text-white font-mono text-sm">{score}</span>
        </div>

        {/* Canvas */}
        <div
          className="relative bg-[#0d0517] cursor-pointer select-none"
          style={{ aspectRatio: `${W} / ${H}` }}
          onClick={jump}
          onTouchStart={(e) => {
            e.preventDefault();
            jump();
          }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="absolute inset-0 w-full h-full"
          />
          {phase !== "playing" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 py-5 rounded-xl border border-[#00f2ff]/60 bg-[#0d0517]/80">
                <div className="text-white font-bold text-2xl tracking-wide">
                  {phase === "dead" ? "GAME OVER" : "READY?"}
                </div>
                <div className="mt-2 text-[#ccff00] uppercase tracking-widest text-xs font-semibold">
                  {phase === "dead" ? "Tap / space to retry" : "Tap / space to jump"}
                </div>
                <div className="mt-1.5 text-white/80 text-xs">
                  {phase === "dead" ? `You cleared ${score}m. ` : ""}Clear the spike line. Speed keeps climbing.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0517] border-t border-[#2a1a44]">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 text-white text-xs hover:text-[#00f2ff] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to analysis
          </button>
          <span className="text-[#808080] text-[11px]">Space to jump · Esc to go back</span>
          <span className="text-white font-mono text-xs">{score}</span>
        </div>
      </div>
    </div>
  );
}