import { createFileRoute } from "@tanstack/react-router";
import TemperatureGauge from "@/components/TemperatureGauge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Steampunk Termostat — wskaźnik temperatury" },
      {
        name: "description",
        content:
          "Świecący, steampunkowy wskaźnik temperatury z zębatą skalą — zadana i aktualna temperatura na jednym panelu.",
      },
      { property: "og:title", content: "Steampunk Termostat — wskaźnik temperatury" },
      {
        property: "og:description",
        content: "Świecący wskaźnik temperatury w stylu steampunk z precyzyjną, zębatą skalą.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="gauge-room flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16">
      <h1
        className="text-[var(--gauge-ember)] text-sm"
        style={{ letterSpacing: "0.5em", fontFamily: "var(--font-tech)", opacity: 0.6 }}
      >
        TERMOSTAT
      </h1>
      <TemperatureGauge target={18} current={21.3} status="CZUWANIE" />
    </main>
  );
}
