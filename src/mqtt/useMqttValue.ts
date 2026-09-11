import { useEffect, useState } from "react";
import { loadMqttConfig, pickPayloadValue, type MqttConfig } from "./config";

export type MqttStatus = "idle" | "connecting" | "connected" | "error";

/** Subscribes to the configured topic and returns the latest numeric value. */
export function useMqttValue(config?: MqttConfig) {
  const [value, setValue] = useState<number | null>(null);
  const [status, setStatus] = useState<MqttStatus>("idle");

  useEffect(() => {
    const cfg = config ?? loadMqttConfig();
    if (!cfg.websocketUrl || !cfg.topic) return;

    let client: { end: (force?: boolean) => void } | null = null;
    let cancelled = false;
    setStatus("connecting");

    void (async () => {
      const mqtt = (await import("mqtt")).default;
      if (cancelled) return;
      const c = mqtt.connect(cfg.websocketUrl, {
        ...(cfg.username ? { username: cfg.username } : {}),
        ...(cfg.password ? { password: cfg.password } : {}),
        reconnectPeriod: 5000,
      });

      client = c;
      c.on("connect", () => {
        setStatus("connected");
        c.subscribe(cfg.topic);
      });
      c.on("error", () => setStatus("error"));
      c.on("message", (_topic: string, message: Uint8Array) => {
        const text = new TextDecoder().decode(message);
        let parsed: unknown = text;
        try {
          parsed = JSON.parse(text);
        } catch {
          /* plain value */
        }
        const next = pickPayloadValue(parsed, cfg.payloadPath);
        if (next !== null) setValue(next);
      });
    })();

    return () => {
      cancelled = true;
      client?.end(true);
    };
  }, [config]);

  return { value, status };
}
