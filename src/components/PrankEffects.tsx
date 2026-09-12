import type { ReactNode } from "react";

export type EffectMode = "calm" | "warning" | "terminal" | "location" | "aircraft" | "explosion" | "blackout" | "glitch";

const glyphs = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  text: Array.from({ length: 18 }, (__, inner) => String.fromCharCode(0x30a0 + ((index * 17 + inner * 13) % 90))).join(""),
}));

const particles = Array.from({ length: 36 }, (_, index) => index);

export function PrankStage({ mode, children }: { mode: EffectMode; children: ReactNode }) {
  return (
    <main className={`prank-stage effect-${mode}`} data-effect={mode}>
      <div className="ambient-grid" aria-hidden="true" />
      {mode === "terminal" && (
        <div className="terminal-rain" aria-hidden="true">
          {glyphs.map((column) => <span key={column.id} style={{ "--i": column.id } as React.CSSProperties}>{column.text}</span>)}
        </div>
      )}
      {mode === "aircraft" && <AircraftEffect />}
      {mode === "explosion" && <ExplosionEffect />}
      <div className="stage-content">{children}</div>
      <div className="vignette" aria-hidden="true" />
    </main>
  );
}

function AircraftEffect() {
  return (
    <div className="aircraft-scene" aria-hidden="true">
      <div className="radar-sweep" />
      <div className="reticle"><i /><i /><i /><i /><span /></div>
      <div className="jet"><span className="jet-body" /><span className="jet-wing jet-wing-left" /><span className="jet-wing jet-wing-right" /><span className="jet-flame" /></div>
      <div className="missile"><span /></div>
    </div>
  );
}

function ExplosionEffect() {
  return (
    <div className="explosion-scene" aria-hidden="true">
      <div className="flash" />
      <div className="blast-core" />
      <div className="smoke-column" />
      <div className="smoke-cap" />
      {particles.map((particle) => <i key={particle} style={{ "--p": particle } as React.CSSProperties} />)}
    </div>
  );
}
