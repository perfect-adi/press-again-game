import { useCallback, useRef, useState } from "react";

type SoundKind = "click" | "warning" | "terminal" | "lock" | "launch" | "explosion" | "achievement";

export function usePrankSound() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  const toggle = useCallback(() => setEnabled((value) => !value), []);

  const play = useCallback((kind: SoundKind) => {
    if (!enabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);

    const settings: Record<SoundKind, [OscillatorType, number, number, number]> = {
      click: ["sine", 180, 110, 0.08],
      warning: ["square", 420, 220, 0.35],
      terminal: ["sawtooth", 95, 180, 0.55],
      lock: ["square", 780, 980, 0.18],
      launch: ["sawtooth", 120, 38, 0.7],
      explosion: ["sawtooth", 75, 24, 1.2],
      achievement: ["sine", 440, 880, 0.45],
    };
    const [type, start, end, duration] = settings[kind];
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(end, 1), now + duration);
    gain.gain.setValueAtTime(kind === "explosion" ? 0.16 : 0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [enabled]);

  return { enabled, toggle, play };
}
