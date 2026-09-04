"use client";

import React, { useEffect, useRef } from "react";

// 24 Deterministic bubbles for SSR safety
// speedFactor: 1.5 to 3.0 to make them move VERY noticeably
const INITIAL_BUBBLES = [
  { id: 1, baseVx: 10, baseVy: 10, size: 8, speedFactor: 1 },
  { id: 2, baseVx: 25, baseVy: 20, size: 5, speedFactor: 1 },
  { id: 3, baseVx: 45, baseVy: 15, size: 10, speedFactor: 1 },
  { id: 4, baseVx: 70, baseVy: 10, size: 6, speedFactor: 1 },
  { id: 5, baseVx: 90, baseVy: 25, size: 7, speedFactor: 1 },

  { id: 6, baseVx: 15, baseVy: 40, size: 9, speedFactor: 1 },
  { id: 7, baseVx: 35, baseVy: 35, size: 4, speedFactor: 1 },
  { id: 8, baseVx: 55, baseVy: 45, size: 8, speedFactor: 1 },
  { id: 9, baseVx: 80, baseVy: 35, size: 5, speedFactor: 1 },
  { id: 10, baseVx: 95, baseVy: 50, size: 7, speedFactor: 1 },
];

export default function WelcomeInteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mutable Interaction State (no React re-renders)
  const state = useRef({
    isMobile: false,
    isActive: false,
    mouse: { x: -1000, y: -1000 },
    bubbles: INITIAL_BUBBLES.map((b) => ({
      ...b,
      x: 0, y: 0,
      vx: 0, vy: 0,
      targetVx: 0, targetVy: 0,
      sizePx: 0,
      currentOpacity: 0.2 // Base opacity
    }))
  });

  useEffect(() => {
    state.current.isMobile = window.innerWidth <= 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (state.current.isMobile) return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      state.current.bubbles.forEach((b) => {
        b.x = (b.baseVx / 100) * w;
        b.y = (b.baseVy / 100) * h;
        b.sizePx = (b.size / 100) * w;

        // Fast initial random wander direction
        const angle = Math.random() * Math.PI * 2;
        const speed = (2 + Math.random() * 3) * b.speedFactor; // Faster baseline
        b.targetVx = Math.cos(angle) * speed;
        b.targetVy = Math.sin(angle) * speed;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Main Physics Loop
  useEffect(() => {
    if (state.current.isMobile) return;

    let rAF: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2); // 60fps normalize
      lastTime = time;
      const s = state.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Update Bubbles
      for (let i = 0; i < s.bubbles.length; i++) {
        const b = s.bubbles[i];
        const el = bubbleRefs.current[i];
        if (!el) continue;

        // Random wander steering (change direction occasionally)
        if (Math.random() < 0.02) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (2 + Math.random() * 3) * b.speedFactor;
          b.targetVx = Math.cos(angle) * speed;
          b.targetVy = Math.sin(angle) * speed;
        }

        // Steer velocity towards target (inertia)
        b.vx += (b.targetVx - b.vx) * 0.03 * dt;
        b.vy += (b.targetVy - b.vy) * 0.03 * dt;

        let targetOpacity = 0.2; // Default soft orange opacity

        // Cursor Interaction (Repulsion & Hover Color)
        if (s.isActive) {
          const dxC = b.x - s.mouse.x;
          const dyC = b.y - s.mouse.y;
          const distC = Math.sqrt(dxC * dxC + dyC * dyC);
          const repelRadius = 300; // Large interaction radius

          if (distC < repelRadius) {
            // Push bubble away
            const force = Math.pow((repelRadius - distC) / repelRadius, 2);
            b.vx += (dxC / distC) * force * 10.0 * dt;
            b.vy += (dyC / distC) * force * 10.0 * dt;

            // Increase orange opacity based on closeness (max 0.9 solid orange)
            targetOpacity = 0.3 + (force * 0.7);
          }
        }

        // Smooth Opacity Interpolation
        b.currentOpacity += (targetOpacity - b.currentOpacity) * 0.1 * dt;

        // Subtle Bubble-to-Bubble Repulsion
        for (let j = i + 1; j < s.bubbles.length; j++) {
          const other = s.bubbles[j];
          const dxB = b.x - other.x;
          const dyB = b.y - other.y;
          const distB = Math.sqrt(dxB * dxB + dyB * dyB);
          const minD = (b.sizePx + other.sizePx) / 2 + 20;

          if (distB < minD && distB > 0) {
            const force = (minD - distB) / minD;
            const fx = (dxB / distB) * force * 2.0 * dt;
            const fy = (dyB / distB) * force * 2.0 * dt;

            b.vx += fx;
            b.vy += fy;
            other.vx -= fx;
            other.vy -= fy;
          }
        }

        // Apply Velocity with Light Friction
        b.vx *= 0.98;
        b.vy *= 0.98;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Screen Wrap/Bounce (Soft wrap)
        const margin = b.sizePx;
        if (b.x < -margin) b.x = w + margin;
        if (b.x > w + margin) b.x = -margin;
        if (b.y < -margin) b.y = h + margin;
        if (b.y > h + margin) b.y = -margin;

        // Apply Transform and Opacity directly
        // We use rgba with the dynamic currentOpacity to handle the color transition
        el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
        el.style.backgroundColor = `rgba(226, 137, 65, ${b.currentOpacity})`;
      }

      rAF = requestAnimationFrame(loop);
    };

    rAF = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAF);
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (state.current.isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      state.current.mouse.x = e.clientX - rect.left;
      state.current.mouse.y = e.clientY - rect.top;
    }
  };

  const handlePointerEnter = () => {
    state.current.isActive = true;
  };

  const handlePointerLeave = () => {
    state.current.isActive = false;
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,137,65,0.04)_0%,transparent_80%)] pointer-events-none" />

      {/* Fast Moving Bubbles */}
      {INITIAL_BUBBLES.map((b, i) => (
        <div
          key={`bubble-${b.id}`}
          ref={(el) => { bubbleRefs.current[i] = el; }}
          className="absolute rounded-full pointer-events-none mix-blend-multiply"
          style={{
            // Server-side safe positions (JS overrides these immediately)
            left: `${b.baseVx}vw`,
            top: `${b.baseVy}vh`,
            width: `${b.size}vw`,
            height: `${b.size}vw`,
            backgroundColor: `rgba(226, 137, 65, 0.2)`,
            marginLeft: `-${b.size / 2}vw`,
            marginTop: `-${b.size / 2}vw`,
            willChange: "transform, background-color"
          }}
        />
      ))}
    </div>
  );
}
