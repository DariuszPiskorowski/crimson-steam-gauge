import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEFAULT_MQTT_CONFIG, loadMqttConfig, saveMqttConfig, type MqttConfig } from "@/mqtt/config";

export const Route = createFileRoute("/mqtt")({
  head: () => ({
    meta: [
      { title: "Ustawienia MQTT — wskaźnik temperatury" },
      {
        name: "description",
        content:
          "Adres brokera, dane logowania, topik i fragment payloadu JSON, z którego wskaźnik pobiera temperaturę.",
      },
      { property: "og:title", content: "Ustawienia MQTT — wskaźnik temperatury" },
      {
        property: "og:description",
        content: "Konfiguracja brokera MQTT, topiku i ścieżki w payloadzie JSON.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MqttSettings,
});

const FIELDS: { key: keyof MqttConfig; label: string; placeholder: string; type?: string }[] = [
  { key: "brokerUrl", label: "Broker", placeholder: "mqtt://1.0.0.27:9001" },
  { key: "websocketUrl", label: "WebSocket", placeholder: "ws://1.0.0.27:9001" },
  { key: "username", label: "Użytkownik", placeholder: "" },
  { key: "password", label: "Hasło", placeholder: "", type: "password" },
  { key: "topic", label: "Topik", placeholder: "dom/salon/czujnik" },
  { key: "payloadPath", label: "Payload (ścieżka w JSON)", placeholder: "data.sensors.temperature" },
];

function MqttSettings() {
  const [config, setConfig] = useState<MqttConfig>(DEFAULT_MQTT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(loadMqttConfig());
  }, []);

  return (
    <main className="gauge-room min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-xl">
        <h1
          className="text-[var(--gauge-ember)] text-2xl tracking-[0.2em]"
          style={{ fontFamily: "var(--font-tech)" }}
        >
          MQTT
        </h1>
        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            saveMqttConfig(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span
                className="text-xs uppercase tracking-[0.25em] text-[var(--gauge-ember)] opacity-70"
                style={{ fontFamily: "var(--font-tech)" }}
              >
                {f.label}
              </span>
              <input
                type={f.type ?? "text"}
                value={config[f.key]}
                placeholder={f.placeholder}
                onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
                className="mt-2 w-full rounded-md border border-[var(--gauge-brass)]/60 bg-[var(--gauge-glass)] px-3 py-2 text-[var(--gauge-ember-hot)] outline-none focus:border-[var(--gauge-ember)]"
                style={{ fontFamily: "var(--font-tech)" }}
              />
            </label>
          ))}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="rounded-md border border-[var(--gauge-ember)] px-5 py-2 text-[var(--gauge-ember-hot)] tracking-[0.2em] transition-colors hover:bg-[var(--gauge-ember)]/10"
              style={{ fontFamily: "var(--font-tech)" }}
            >
              ZAPISZ
            </button>
            <Link to="/" className="text-sm text-[var(--gauge-ember)] opacity-70 hover:opacity-100">
              ← wskaźnik
            </Link>
            {saved && <span className="text-sm text-[var(--gauge-ember-hot)]">zapisano</span>}
          </div>
        </form>
      </div>
    </main>
  );
}
