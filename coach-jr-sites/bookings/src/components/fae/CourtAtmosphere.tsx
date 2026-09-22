import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; depth: number; drift: number; size: number };

/**
 * Lightweight, F.A.E.-branded court atmosphere for the opening viewport.
 * The canvas pauses off-tab, caps DPR, and paints only a static frame when
 * reduced motion is requested.
 */
export function CourtAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim();
    const foreground = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim();
    const background = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = !document.hidden;
    let particles: Particle[] = [];

    const seedParticles = () => {
      const count = Math.max(30, Math.min(88, Math.round((width * height) / 19000)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: ((index * 67) % 101) / 101,
        y: ((index * 43) % 97) / 97,
        depth: 0.22 + (((index * 31) % 73) / 73) * 0.78,
        drift: 0.35 + (((index * 19) % 37) / 37) * 0.75,
        size: 0.45 + (((index * 11) % 23) / 23) * 1.15,
      }));
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    const line = (x1: number, y1: number, x2: number, y2: number, opacity: number) => {
      context.globalAlpha = opacity;
      context.strokeStyle = gold;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      context.globalAlpha = 1;
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const horizon = height * 0.58;
      const pulse = reducedMotion.matches ? 0 : Math.sin(time * 0.00055) * 0.04;

      const glow = context.createRadialGradient(width * 0.5, horizon, 0, width * 0.5, horizon, width * 0.52);
      glow.addColorStop(0, `color-mix(in oklab, ${gold} ${(0.12 + pulse) * 100}%, transparent)`);
      glow.addColorStop(0.42, `color-mix(in oklab, ${gold} 4%, transparent)`);
      glow.addColorStop(1, "transparent");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.lineWidth = 0.75;
      for (let i = -7; i <= 7; i += 1) {
        line(width * 0.5, horizon, width * 0.5 + i * width * 0.13, height, 0.08);
      }
      for (let i = 0; i < 9; i += 1) {
        const progress = i / 8;
        const y = horizon + Math.pow(progress, 2.15) * (height - horizon);
        line(0, y, width, y, 0.045 + progress * 0.055);
      }

      const beam = context.createLinearGradient(0, 0, 0, horizon * 1.2);
      beam.addColorStop(0, `color-mix(in oklab, ${gold} 5%, transparent)`);
      beam.addColorStop(1, "transparent");
      context.fillStyle = beam;
      context.beginPath();
      context.moveTo(width * 0.12, 0);
      context.lineTo(width * 0.34, 0);
      context.lineTo(width * 0.58, horizon);
      context.lineTo(width * 0.42, horizon);
      context.closePath();
      context.fill();

      particles.forEach((particle, index) => {
        const motion = reducedMotion.matches ? 0 : (time * 0.000018 * particle.drift + index * 0.003) % 1;
        const y = ((particle.y + motion) % 1) * height;
        const alpha = 0.08 + particle.depth * 0.16;
        context.globalAlpha = alpha;
        context.fillStyle = index % 5 === 0 ? foreground : gold;
        context.beginPath();
        context.arc(particle.x * width, y, particle.size * particle.depth, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });

      const vignette = context.createRadialGradient(width * 0.5, height * 0.45, width * 0.08, width * 0.5, height * 0.45, width * 0.76);
      vignette.addColorStop(0.5, "transparent");
      vignette.addColorStop(1, `color-mix(in oklab, ${background} 72%, transparent)`);
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    const tick = (time: number) => {
      draw(time);
      if (running && !reducedMotion.matches) frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      running = !document.hidden;
      if (running && !reducedMotion.matches) frame = requestAnimationFrame(tick);
      else draw();
    };
    const onVisibility = () => restart();

    resize();
    draw();
    restart();
    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", restart);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", restart);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}