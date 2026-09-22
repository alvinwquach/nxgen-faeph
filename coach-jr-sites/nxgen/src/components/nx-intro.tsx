import { useEffect, useRef, useState } from "react";

/**
 * One-time brand intro: the launch film plays, then a light-streak wipe hands
 * off into the site. The clip is the social ad, trimmed to the hook line
 * ("…now that I got your attention?") and the logo lock, then faded — see
 * public/intro-ad.mp4 (cut + compressed from WEBSITE SOCIAL AD.mp4).
 *
 * Restraint, so it never costs a visitor a registration:
 *  - plays ONCE per browser session (sessionStorage), never on repeat views
 *  - skippable immediately — Skip button or Escape
 *  - skipped for reduced-motion users and on first paint if already seen,
 *    so there is no flash
 *  - autoplays muted (the only reliable autoplay); a Sound button unmutes and
 *    replays from the top so the hook is heard from the first word
 *  - closes itself the moment the film ends, on error, or after a safety cap,
 *    so a decode failure never traps anyone
 *
 * To disable site-wide: remove <NxIntro /> from src/routes/__root.tsx.
 */
const SESSION_KEY = "nxgen_intro_seen";
const SRC = "/intro-ad.mp4";
// Film runs ~6.2s; cap well past that so a stalled/failed load still releases.
const SAFETY_MS = 9000;

export function NxIntro() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pct, setPct] = useState(0);
  const [muted, setMuted] = useState(true);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = true; // storage blocked — treat as seen so we never trap anyone
    }
    const reduced =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduced) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      return;
    }
    setShow(true);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
  }, []);

  // Kick off playback + safety release once the overlay is up.
  useEffect(() => {
    if (!show) return;
    const v = vidRef.current;
    if (v) {
      // Try sound-on first; browsers block unmuted autoplay without a prior
      // gesture, so fall back to muted (which always plays) and expose Sound.
      v.muted = false;
      v.play().then(() => setMuted(false)).catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => beginClose());
      });
    }
    timers.current.push(window.setTimeout(beginClose, SAFETY_MS));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Escape to skip.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") beginClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Hold the page still while the intro owns the screen.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  function beginClose() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const v = vidRef.current;
    if (v) { try { v.pause(); } catch { /* ignore */ } }
    setClosing(true);
    window.setTimeout(() => setShow(false), 720);
  }

  function enableSound() {
    const v = vidRef.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0; // replay so the hook line is heard from the first word
    v.play().then(() => setMuted(false)).catch(() => { /* stay muted */ });
  }

  function onProgress() {
    const v = vidRef.current;
    if (!v || !v.duration) return;
    setPct(Math.min(100, (v.currentTime / v.duration) * 100));
  }

  if (!show) return null;

  return (
    <div className={`nxi${closing ? " out" : ""}`} role="presentation" aria-hidden="true">
      <video
        ref={vidRef}
        className="nxi-vid"
        src={SRC}
        poster="/intro-ad-poster.jpg"
        muted={muted}
        autoPlay
        playsInline
        preload="auto"
        onTimeUpdate={onProgress}
        onEnded={beginClose}
        onError={beginClose}
      />
      <div className="nxi-scan" />
      <div className="nxi-vig" />
      {/* Light-streak wipe — echoes the film's own transition, plays on close. */}
      <div className="nxi-wipe" />

      <div className="nxi-load">
        <div className="nxi-track"><i style={{ width: `${pct}%` }} /></div>
        <div className="nxi-pct">{Math.round(pct)}<span>%</span></div>
      </div>

      {muted && (
        <button className="nxi-sound" type="button" onClick={enableSound}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a9 9 0 0 1 0 14" />
          </svg>
          Tap for sound
        </button>
      )}
      <button className="nxi-skip" type="button" onClick={beginClose}>Skip intro</button>
    </div>
  );
}
