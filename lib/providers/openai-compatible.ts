import type { ProviderConfig } from "./config";

export interface ModelToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatTurn {
  role: "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  toolCallId?: string;
  toolCalls?: ModelToolCall[];
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
      tool_calls?: ModelToolCall[];
    };
  }>;
  error?: {
    message?: string;
  };
}

export interface AssistantResponse {
  content: string;
  toolCalls: ModelToolCall[];
}

export const OTHRI_LOCAL_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a local task on the user's phone. Only call when the user explicitly asks to add or create a task. The app will ask for approval before saving.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short task title, maximum 120 characters." },
          description: { type: "string", description: "Optional task note, maximum 1000 characters." },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a user-provided fact, preference or goal to local memory. Only call when the user explicitly asks OTHRI to remember or save it. The app will ask for approval before saving.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["profile", "preference", "goal", "context"] },
          content: { type: "string", description: "A concise memory entry, maximum 1000 characters." },
        },
        required: ["category", "content"],
        additionalProperties: false,
      },
    },
  },
] as const;

const SYSTEM_PROMPT = `You are OTHRI, a personal AI assistant.
Be useful, direct and transparent. Ask clarifying questions when needed.
You do not have access to the user's device, files, other apps, accounts or the internet unless the app explicitly provides a connected tool.
You have two local tools: create_task and save_memory. Use them only when the user clearly asks to create a task or save/remember information. Do not infer permission from a vague statement. The app will show each proposed action to the user and will execute it only after they approve it.
Never claim a task or memory has been saved until the tool returns a successful result.
External, destructive or irreversible actions require explicit user approval. You have no external tools and cannot send messages, publish content, control other apps, browse or access accounts.`;

export async function createAssistantResponse(
  config: ProviderConfig,
  conversation: ChatTurn[]
): Promise<AssistantResponse> {
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
            ...conversation.map((turn) => ({
              role: turn.role,
              content: turn.content,
              ...(turn.name ? { name: turn.name } : {}),
              ...(turn.toolCallId ? { tool_call_id: turn.toolCallId } : {}),
              ...(turn.toolCalls ? { tool_calls: turn.toolCalls } : {}),
            })),
          ],
          tools: OTHRI_LOCAL_TOOLS,
          tool_choice: "auto",
        }),
        signal: controller.signal,
      });
    } catch {
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

    const message = payload.choices?.[0]?.message;
    if (!message) throw new Error("The provider response did not contain a chat message.");

    const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
    const validIds = new Set<string>();
    for (const call of toolCalls) {
      if (
        !call ||
        call.type !== "function" ||
        typeof call.id !== "string" ||
        !call.id.trim() ||
        !call.function ||
        typeof call.function.name !== "string" ||
        typeof call.function.arguments !== "string" ||
        validIds.has(call.id)
      ) {
        throw new Error("The provider returned a malformed or duplicate tool call. No local action was performed.");
      }
      validIds.add(call.id);
    }
    const content = typeof message.content === "string" ? message.content.trim() : "";

    if (toolCalls.length === 0 && !content) {
      throw new Error("The provider returned no text or tool request. Check the model ID and API compatibility.");
    }
    if (toolCalls.length > 3) {
      throw new Error("The model requested too many actions at once. Ask it to handle a maximum of three actions.");
    }

    return { content, toolCalls };
  } finally {
    clearTimeout(timeout);
  }
}

export async function listAvailableModels(
  config: Pick<ProviderConfig, "baseUrl" | "apiKey">
): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}/models`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        throw new Error("Model discovery timed out. Check the provider server and network.");
      }
      throw new Error("Could not reach the provider's /models endpoint.");
    }

    const raw = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error(response.ok
        ? "The provider returned an unexpected model-list response."
        : `Model discovery failed with HTTP ${response.status}.`);
    }

    if (!response.ok) {
      const errorMessage =
        payload && typeof payload === "object" && "error" in payload &&
        typeof (payload as { error?: { message?: unknown } }).error?.message === "string"
          ? (payload as { error: { message: string } }).error.message.slice(0, 240)
          : `HTTP ${response.status}`;
      throw new Error(`Model discovery failed: ${errorMessage}`);
    }

    if (!payload || typeof payload !== "object" || !Array.isArray((payload as { data?: unknown }).data)) {
      throw new Error("This provider does not expose an OpenAI-compatible /models list. Enter the model ID manually.");
    }

    const models = (payload as { data: unknown[] }).data
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const id = (item as { id?: unknown }).id;
        return typeof id === "string" && id.trim() ? id.trim() : null;
      })
      .filter((id): id is string => Boolean(id));

    return Array.from(new Set(models));
  } finally {
    clearTimeout(timeout);
  }
}
