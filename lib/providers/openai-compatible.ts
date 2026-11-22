import type { ProviderConfig } from "./config";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  error?: {
    message?: string;
  };
}

const SYSTEM_PROMPT = `You are OTHRI, a personal AI assistant.
Be useful, direct and transparent. Ask clarifying questions when needed.
You do not have access to the user's device, files, other apps, accounts or the internet unless the app explicitly provides a connected tool.
Do not claim to have performed actions, changed settings, saved data or accessed external services unless a connected tool has returned a verified success.
External, destructive or irreversible actions require explicit user approval. When no tool is connected, explain that you can prepare instructions or a draft but cannot execute the action.`;

export async function createAssistantReply(
  config: ProviderConfig,
  conversation: ChatTurn[]
): Promise<string> {
  if (conversation.length === 0) throw new Error("Write a message before sending.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          stream: false,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversation.map((turn) => ({ role: turn.role, content: turn.content })),
          ],
        }),
        signal: controller.signal,
      });
    } catch (cause) {
      if (controller.signal.aborted) {
        throw new Error("The provider took too long to respond. Check the server and try again.");
      }
      throw new Error("Could not reach the provider. Check the URL, network and server status.");
    }

    const raw = await response.text();
    let payload: ChatCompletionResponse;
    try {
      payload = JSON.parse(raw) as ChatCompletionResponse;
    } catch {
      throw new Error(response.ok
        ? "The provider returned an unexpected response format."
        : `Provider request failed with HTTP ${response.status}.`);
    }

    if (!response.ok) {
      const providerMessage = typeof payload.error?.message === "string"
        ? payload.error.message.slice(0, 300)
        : `HTTP ${response.status}`;
      throw new Error(`Provider error: ${providerMessage}`);
    }

    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("The provider returned no text response. Check the model ID and API compatibility.");
    }

    return content.trim();
  } finally {
    clearTimeout(timeout);
  }
}
