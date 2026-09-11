import { createFileRoute } from "@tanstack/react-router";
import TemperatureGauge from "@/components/TemperatureGauge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wskaźnik temperatury — zębatkowa skala" },
      {
        name: "description",
        content:
          "Wskaźnik temperatury na dashboard: zabytkowa zębatkowa skala z igłą, w świecącej pomarańczowej kolorystyce.",
      },
      { property: "og:title", content: "Wskaźnik temperatury — zębatkowa skala" },
      {
        property: "og:description",
        content: "Zabytkowa skala zegarowa jako wskaźnik temperatury w świecącym pomarańczowym tonie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="gauge-room flex min-h-screen items-center justify-center px-6 py-12">
      <TemperatureGauge value={21.3} min={0} max={50} label="TEMP °C" />
    </main>
  );
}
