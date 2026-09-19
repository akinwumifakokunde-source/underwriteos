import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Swipe-down pull-to-refresh for touch devices. Activates only when the page
// is scrolled to the top. Calls onRefresh when the pull exceeds the threshold.
export default function PullToRefresh({ onRefresh, isRefreshing, children, threshold = 70 }) {
  const [pull, setPull] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = (e) => {
    if (window.scrollY > 0 || isRefreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const onTouchMove = (e) => {
    if (!pulling.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY <= 0) {
      setPull(Math.min(dy * 0.5, threshold + 24));
    }
  };

  const onTouchEnd = () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= threshold && onRefresh) onRefresh();
    setPull(0);
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div style={{ height: pull }} className="flex items-center justify-center overflow-hidden">
        {(pull > 8 || isRefreshing) && (
          <Loader2 className={`w-5 h-5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
        )}
      </div>
      {children}
    </div>
  );
}