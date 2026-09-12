import { createFileRoute } from "@tanstack/react-router";
import { DontPressGame } from "../components/DontPressGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DON'T PRESS — An Escalating Button Prank" },
      { name: "description", content: "One suspicious button. Six bad decisions. Infinite ridiculous consequences." },
      { property: "og:title", content: "DON'T PRESS" },
      { property: "og:description", content: "One suspicious button. Six bad decisions. Infinite ridiculous consequences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DontPressGame,
});
