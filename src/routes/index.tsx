import { createFileRoute, Link } from "@tanstack/react-router";
import TemperatureGauge from "@/components/TemperatureGauge";
import { useMqttValue } from "@/mqtt/useMqttValue";

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
  const { value, status } = useMqttValue();

  return (
    <main className="gauge-room flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      <TemperatureGauge value={value ?? 21.3} min={0} max={50} label="TEMP °C" />
      <div
        className="flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-[var(--gauge-ember)] opacity-70"
        style={{ fontFamily: "var(--font-tech)" }}
      >
        <span>MQTT: {status}</span>
        <Link to="/mqtt" className="hover:opacity-100">
          ustawienia
        </Link>
      </div>
    </main>
  );
}
