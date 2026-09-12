import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { PrankStage, type EffectMode } from "./PrankEffects";
import { usePrankSound } from "../hooks/use-prank-sound";
import {
  ACHIEVEMENTS,
  EMPTY_GAME,
  achievementsForCount,
  checkDoubleRefreshReset,
  consequenceFor,
  loadGame,
  saveGame,
  type Achievement,
  type AchievementId,
  type SavedGame,
} from "../lib/dont-press";

type Scene = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  fine?: string;
  button?: string;
  effect?: EffectMode;
  progress?: Array<{ label: string; value: number }>;
};

const initialScene: Scene = {
  title: "DON'T PRESS",
  subtitle: "Seriously.",
  button: "DON'T PRESS",
  effect: "calm",
};

const pause = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

function sceneAfterCount(count: number): Scene {
  if (count === 1) return { title: "I told you not to.", button: "DON'T PRESS AGAIN", effect: "calm" };
  if (count === 2) return { title: "OKAY.", subtitle: "You really don't learn, do you?", button: "DON'T PRESS", fine: "Seriously. Last warning.", effect: "calm" };
  if (count === 3) return { title: "DON'T PRESS AGAIN.", subtitle: "This warning has been professionally typeset.", button: "DON'T PRESS", effect: "calm" };
  if (count === 4) return { title: "...", subtitle: "You pressed it again.", button: "DEFINITELY DON'T PRESS", fine: "Your laptop may explode.", effect: "blackout" };
  if (count === 5) return { title: "DON'T PRESS IT.", subtitle: "Your laptop may explode.", button: "DEFINITELY DON'T PRESS", effect: "calm" };
  if (count >= 6) return { eyebrow: `PRESS ${count + 1}`, title: consequenceFor(count), subtitle: "You could have simply stopped.", button: "PRESS AGAIN", effect: "calm" };
  return initialScene;
}

export function DontPressGame() {
  const [game, setGame] = useState<SavedGame>(EMPTY_GAME);
  const [scene, setScene] = useState<Scene>(initialScene);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<Achievement | null>(null);
  const [ready, setReady] = useState(false);
  const mountedRef = useRef(true);
  const clickTimes = useRef<number[]>([]);
  const { enabled, toggle, play } = usePrankSound();

  const safeScene = useCallback((next: Scene) => {
    if (mountedRef.current) setScene(next);
  }, []);

  const unlockAchievements = useCallback((ids: AchievementId[], nextGame: SavedGame) => {
    const fresh = ids.filter((id) => !nextGame.achievements.includes(id));
    if (!fresh.length) return nextGame;
    const updated = { ...nextGame, achievements: [...nextGame.achievements, ...fresh] };
    const newest = fresh.at(0);
    if (newest) setToast(ACHIEVEMENTS[newest]);
    play("achievement");
    window.setTimeout(() => mountedRef.current && setToast(null), 3600);
    return updated;
  }, [play]);

  useEffect(() => {
    mountedRef.current = true;
    const stored = loadGame();
    const shouldReset = checkDoubleRefreshReset();
    const loaded = shouldReset ? { ...stored, count: 0 } : stored;
    if (shouldReset) saveGame(loaded);
    setGame(loaded);
    if (loaded.count > 0) setScene(sceneAfterCount(loaded.count));
    else setScene(shouldReset ? { ...initialScene, fine: "Counter reset." } : initialScene);
    setReady(true);
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const idleTimer = window.setTimeout(() => {
      setScene({ title: "Finally.", subtitle: "A responsible human.", button: "DON'T RUIN THIS", effect: "calm" });
      setGame((current) => {
        const updated = unlockAchievements(["touch-grass"], current);
        saveGame(updated);
        return updated;
      });
    }, 60000);
    return () => window.clearTimeout(idleTimer);
  }, [game.count, ready, unlockAchievements]);

  const updateGame = useCallback((count: number) => {
    setGame((current) => {
      const next = { ...current, count, highest: Math.max(current.highest, count) };
      const updated = unlockAchievements(achievementsForCount(count), next);
      saveGame(updated);
      return updated;
    });
  }, [unlockAchievements]);

  const runFirst = async () => {
    safeScene({ title: "You pressed it.", effect: "calm" });
    await pause(900);
    safeScene({ title: "I told you not to.", effect: "calm" });
    await pause(950);
    safeScene(sceneAfterCount(1));
  };

  const runTerminal = async () => {
    play("warning");
    safeScene({ eyebrow: "SYSTEM WARNING", title: "DON'T PRESS AGAIN", subtitle: "Otherwise your computer might get hacked.", fine: "Fictional warning. No device access is taking place.", effect: "warning" });
    await pause(1350);
    safeScene({ title: "CONNECTING...", subtitle: "Pretending very convincingly.", effect: "warning" });
    await pause(1100);
    play("terminal");
    safeScene({ title: "ACCESS GRANTED", subtitle: "SIMULATION ONLY", effect: "terminal" });
    await pause(2700);
    safeScene(sceneAfterCount(2));
  };

  const runLocation = async () => {
    play("warning");
    safeScene({ eyebrow: "SECURITY ALERT", title: "The CIA has been notified.", subtitle: "Attempting to determine your location...", fine: "A completely fake action-movie location sequence.", effect: "location", progress: [{ label: "LOCATING...", value: 38 }] });
    await pause(1050);
    safeScene({ eyebrow: "SECURITY ALERT", title: "The CIA has been notified.", subtitle: "Attempting to determine your location...", fine: "Still fake. No location permission is requested.", effect: "location", progress: [{ label: "LOCATING...", value: 38 }, { label: "SATELLITE CONNECTION...", value: 64 }] });
    await pause(1050);
    safeScene({ eyebrow: "TARGET ACQUIRED", title: "LOCATION:", subtitle: "[REDACTED]", fine: "Because the website does not know where you are.", effect: "location" });
    await pause(1450);
    safeScene(sceneAfterCount(3));
  };

  const runAircraft = async () => {
    play("lock");
    safeScene({ eyebrow: "FICTIONAL DEFENSE SYSTEM", title: "TARGET ACQUIRED", subtitle: "Action-movie parody engaged.", effect: "aircraft" });
    await pause(2500);
    play("launch");
    safeScene({ eyebrow: "LOCK CONFIRMED", title: "INCOMING", subtitle: "This seems like an overreaction.", effect: "aircraft" });
    await pause(1550);
    safeScene({ title: "...", effect: "blackout" });
    await pause(1000);
    safeScene(sceneAfterCount(4));
  };

  const runFifth = async () => {
    safeScene({ title: "...", effect: "blackout" });
    await pause(1300);
    safeScene({ title: "You pressed it again.", effect: "blackout" });
    await pause(1300);
    safeScene(sceneAfterCount(5));
  };

  const runExplosion = async () => {
    safeScene({ title: "OH NO.", effect: "blackout" });
    await pause(700);
    for (const number of [3, 2, 1]) {
      play("warning");
      safeScene({ title: String(number), effect: "warning" });
      await pause(620);
    }
    play("explosion");
    safeScene({ title: "BOOM", subtitle: "A tasteful, entirely fictional explosion.", effect: "explosion" });
    await pause(3200);
    safeScene({ title: "...", effect: "calm" });
    await pause(1200);
    safeScene({ title: "Your laptop is fine.", subtitle: "Probably.", effect: "calm" });
    await pause(1350);
    safeScene({ eyebrow: "YOU PRESSED IT 6 TIMES", title: "There was literally no reason to do that.", button: "PRESS AGAIN", effect: "calm" });
  };

  const runInfinite = async (count: number) => {
    const now = Date.now();
    clickTimes.current = [...clickTimes.current.filter((time) => now - time < 5000), now];
    if (clickTimes.current.length >= 4) {
      play("warning");
      safeScene({ title: "BRO. STOP.", subtitle: "The button cannot process this level of enthusiasm.", effect: "glitch" });
      clickTimes.current = [];
      await pause(1400);
      safeScene({ eyebrow: `PRESS ${count}`, title: consequenceFor(count), subtitle: "That was genuinely unnecessary.", button: "PRESS AGAIN", effect: "calm" });
      return;
    }
    if (count === 42) {
      play("achievement");
      safeScene({ title: "YOU WIN.", subtitle: "There was never anything to win.", effect: "calm" });
      await pause(1800);
    } else if (Math.random() < 0.035) {
      play("terminal");
      safeScene({ title: "...", effect: "glitch" });
      await pause(1300);
      safeScene({ title: "Nice try.", effect: "calm" });
      await pause(900);
    } else {
      play(count % 10 === 0 ? "explosion" : count % 5 === 0 ? "warning" : "lock");
      safeScene({ eyebrow: `PRESS ${count}`, title: consequenceFor(count), subtitle: "The situation continues to deteriorate.", effect: count % 5 === 0 ? "warning" : "calm" });
      await pause(900);
    }
    safeScene({ eyebrow: `PRESS ${count}`, title: consequenceFor(count), subtitle: count % 3 === 0 ? "There is no prize." : "Your commitment is concerning.", button: "PRESS AGAIN", effect: "calm" });
  };

  const handlePress = async () => {
    if (locked || !ready) return;
    setLocked(true);
    play("click");
    const nextCount = game.count + 1;
    updateGame(nextCount);
    try {
      if (nextCount === 1) await runFirst();
      else if (nextCount === 2) await runTerminal();
      else if (nextCount === 3) await runLocation();
      else if (nextCount === 4) await runAircraft();
      else if (nextCount === 5) await runFifth();
      else if (nextCount === 6) await runExplosion();
      else await runInfinite(nextCount);
    } finally {
      if (mountedRef.current) setLocked(false);
    }
  };

  const progress = useMemo(() => scene.progress ?? [], [scene.progress]);

  if (!ready) return <div className="min-h-svh bg-background" />;

  return (
    <PrankStage mode={scene.effect ?? "calm"}>
      <header className="prank-header">
        <span className="brand-mark">A VERY SERIOUS INTERFACE</span>
        <div className="flex items-center gap-3">
          <span className="counter">PRESS COUNT: {game.count}<br />HIGHEST: {game.highest}</span>
          <button className="sound-toggle" type="button" onClick={toggle} aria-label={enabled ? "Turn sound off" : "Turn sound on"} title={enabled ? "Sound on" : "Sound off"}>
            {enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
        </div>
      </header>

      <section className="copy-stack" aria-live="polite" aria-atomic="true">
        {scene.eyebrow && <p className="eyebrow">{scene.eyebrow}</p>}
        <h1 className="main-title">{scene.title}</h1>
        {scene.subtitle && <p className="main-subtitle">{scene.subtitle}</p>}
        {progress.length > 0 && (
          <div className="loading-stack">
            {progress.map((item) => (
              <div className="loading-row" key={item.label}>
                <span>{item.label}</span>
                <div className="loading-track"><div className="loading-fill" style={{ "--progress": `${item.value}%` } as React.CSSProperties} /></div>
              </div>
            ))}
          </div>
        )}
        {scene.button && (
          <div className="button-rig">
            <button className="press-button" type="button" onClick={handlePress} disabled={locked} aria-label={scene.button}>
              {scene.button}
            </button>
          </div>
        )}
        {scene.fine && <p className="fine-print">{scene.fine}</p>}
      </section>

      <p className="reset-hint">Refresh twice quickly to reset the counter.</p>


      {toast && (
        <aside className="achievement-toast" role="status">
          <strong>ACHIEVEMENT UNLOCKED · {toast.title}</strong>
          <span>{toast.description}</span>
        </aside>
      )}
    </PrankStage>
  );
}
