export type AchievementId =
  | "first-mistake"
  | "no-self-control"
  | "bro-please"
  | "touch-grass"
  | "final-boss"
  | "why";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  "first-mistake": { id: "first-mistake", title: "FIRST MISTAKE", description: "Pressed the button once." },
  "no-self-control": { id: "no-self-control", title: "NO SELF CONTROL", description: "Pressed the button 10 times." },
  "bro-please": { id: "bro-please", title: "BRO PLEASE", description: "Pressed the button 25 times." },
  "touch-grass": { id: "touch-grass", title: "TOUCH GRASS", description: "Stayed away from the button for 60 seconds." },
  "final-boss": { id: "final-boss", title: "FINAL BOSS", description: "Reached the explosion sequence." },
  why: { id: "why", title: "WHY", description: "Pressed it 100 times." },
};

const STORAGE_KEY = "dont-press-state-v1";

export type SavedGame = {
  count: number;
  highest: number;
  achievements: AchievementId[];
};

export const EMPTY_GAME: SavedGame = { count: 0, highest: 0, achievements: [] };

export function loadGame(): SavedGame {
  if (typeof window === "undefined") return EMPTY_GAME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_GAME;
    const parsed = JSON.parse(raw) as Partial<SavedGame>;
    const count = Number.isFinite(parsed.count) ? Math.max(0, Number(parsed.count)) : 0;
    const highest = Number.isFinite(parsed.highest) ? Math.max(count, Number(parsed.highest)) : count;
    const achievements = Array.isArray(parsed.achievements)
      ? parsed.achievements.filter((id): id is AchievementId => id in ACHIEVEMENTS)
      : [];
    return { count, highest, achievements };
  } catch {
    return EMPTY_GAME;
  }
}

export function saveGame(game: SavedGame) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    // The prank still works when private browsing blocks storage.
  }
}

export const MILESTONE_LINES: Record<number, string> = {
  7: "NASA has been informed.",
  8: "Your WiFi has resigned.",
  9: "Your refrigerator knows what you did.",
  10: "Your browser has contacted your mother.",
  11: "Your keyboard has filed a complaint.",
  12: "THE COUNCIL HAS BEEN SUMMONED.",
  25: "Bro. Please.",
  42: "You found the answer. Not the question.",
  50: "This is now a lifestyle choice.",
  69: "The button is embarrassed for you.",
  100: "One hundred. There is still no prize.",
};

const ABSURD_LINES = [
  "A nearby toaster has entered witness protection.",
  "Your search history has requested a transfer.",
  "The moon has seen enough.",
  "A committee has been formed about this.",
  "Your cursor is reconsidering its career.",
  "The cloud is disappointed. Which cloud? Yes.",
  "An intern just had to file paperwork.",
  "Your tab has become self-aware.",
  "A pigeon has been dispatched.",
  "The button has retained legal counsel.",
  "Your commitment is becoming difficult to explain.",
  "Somewhere, a printer has started screaming.",
];

export function consequenceFor(count: number) {
  const fallback = "The button has run out of ways to judge you.";
  return MILESTONE_LINES[count] ?? ABSURD_LINES[(count * 7 + 3) % ABSURD_LINES.length] ?? fallback;
}

export function achievementsForCount(count: number): AchievementId[] {
  const unlocked: AchievementId[] = [];
  if (count >= 1) unlocked.push("first-mistake");
  if (count >= 6) unlocked.push("final-boss");
  if (count >= 10) unlocked.push("no-self-control");
  if (count >= 25) unlocked.push("bro-please");
  if (count >= 100) unlocked.push("why");
  return unlocked;
}
