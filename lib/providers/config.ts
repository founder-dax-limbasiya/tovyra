import * as SecureStore from "expo-secure-store";

const PROVIDER_CONFIG_KEY = "othri.provider.v1";

export interface ProviderConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
}

export interface ProviderSummary {
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
}

function isPrivateOrLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "::1" || host === "127.0.0.1") return true;
  if (/^10\.(\d{1,3}\.){2}\d{1,3}$/.test(host)) return true;
  if (/^192\.168\.(\d{1,3}\.)\d{1,3}$/.test(host)) return true;
  const match = host.match(/^172\.(\d{1,2})\.(\d{1,3})\.(\d{1,3})$/);
  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }
  return host.endsWith(".local");
}

export function normalizeProviderBaseUrl(input: string, apiKey?: string): string {
  const raw = input.trim();
  if (!raw) throw new Error("Enter the provider's API base URL.");

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid API URL, for example http://192.168.1.10:11434/v1.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Provider URLs must use HTTP or HTTPS.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Do not include credentials, query parameters or fragments in the provider URL.");
  }

  const localHost = isPrivateOrLoopbackHost(url.hostname);
  if (url.protocol === "http:" && !localHost) {
    throw new Error("Use HTTPS for internet-hosted providers. Plain HTTP is allowed only for a private LAN or local server.");
  }
  if (apiKey?.trim() && url.protocol !== "https:") {
    throw new Error("Use HTTPS when an API key is configured. For a local Ollama server, leave the API key blank.");
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

export async function loadProviderConfig(): Promise<ProviderConfig | null> {
  const raw = await SecureStore.getItemAsync(PROVIDER_CONFIG_KEY);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Saved provider settings could not be read. Clear them and configure the provider again.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Saved provider settings are invalid. Clear them and configure the provider again.");
  }

  const value = parsed as Record<string, unknown>;
  if (typeof value.baseUrl !== "string" || typeof value.model !== "string") {
    throw new Error("Saved provider settings are incomplete. Clear them and configure the provider again.");
  }

  return {
    baseUrl: value.baseUrl,
    model: value.model,
    apiKey: typeof value.apiKey === "string" ? value.apiKey : undefined,
  };
}

export async function loadProviderSummary(): Promise<ProviderSummary | null> {
  const config = await loadProviderConfig();
  if (!config) return null;
  return {
    baseUrl: config.baseUrl,
    model: config.model,
    hasApiKey: Boolean(config.apiKey),
  };
}

export async function saveProviderConfig(input: {
  baseUrl: string;
  model: string;
  apiKey?: string;
}): Promise<void> {
  const model = input.model.trim();
  if (!model) throw new Error("Enter the exact model ID supported by your provider.");
  if (model.length > 160) throw new Error("Model IDs must be 160 characters or fewer.");

  const current = await loadProviderConfig();
  const apiKey = input.apiKey?.trim() || current?.apiKey;
  const baseUrl = normalizeProviderBaseUrl(input.baseUrl, apiKey);

  await SecureStore.setItemAsync(
    PROVIDER_CONFIG_KEY,
    JSON.stringify({ baseUrl, model, apiKey })
  );
}

export async function clearProviderConfig(): Promise<void> {
  await SecureStore.deleteItemAsync(PROVIDER_CONFIG_KEY);
}
