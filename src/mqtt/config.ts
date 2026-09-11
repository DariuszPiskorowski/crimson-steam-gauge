export type MqttConfig = {
  /** broker address, e.g. mqtt://1.0.0.27:9001 */
  brokerUrl: string;
  /** websocket address used by the browser, e.g. ws://1.0.0.27:9001 */
  websocketUrl: string;
  username: string;
  password: string;
  /** topic to subscribe to */
  topic: string;
  /** path inside the JSON payload, e.g. data.sensors.temperature */
  payloadPath: string;
};

export const DEFAULT_MQTT_CONFIG: MqttConfig = {
  brokerUrl: "mqtt://1.0.0.27:9001",
  websocketUrl: "ws://1.0.0.27:9001",
  username: "",
  password: "",
  topic: "",
  payloadPath: "",
};

const STORAGE_KEY = "mqtt-config";

export function loadMqttConfig(): MqttConfig {
  if (typeof window === "undefined") return DEFAULT_MQTT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MQTT_CONFIG;
    return { ...DEFAULT_MQTT_CONFIG, ...(JSON.parse(raw) as Partial<MqttConfig>) };
  } catch {
    return DEFAULT_MQTT_CONFIG;
  }
}

export function saveMqttConfig(config: MqttConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Reads a dotted path out of a parsed JSON payload. */
export function pickPayloadValue(payload: unknown, path: string): number | null {
  if (!path) {
    const n = Number(payload);
    return Number.isFinite(n) ? n : null;
  }
  let current: unknown = payload;
  for (const key of path.split(".").filter(Boolean)) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  const n = Number(current);
  return Number.isFinite(n) ? n : null;
}
