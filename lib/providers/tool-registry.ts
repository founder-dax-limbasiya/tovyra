import type { ModelToolCall } from "./openai-compatible";
import { addMemoryEntry } from "../storage/memory";
import { createLocalTask } from "../storage/tasks";

export function isSupportedLocalTool(call: ModelToolCall): boolean {
  return call.type === "function" &&
    (call.function.name === "create_task" || call.function.name === "save_memory");
}

function parseArguments(raw: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("The model supplied invalid action arguments.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The action arguments must be a JSON object.");
  }
  return value as Record<string, unknown>;
}

function assertAllowedKeys(args: Record<string, unknown>, keys: string[]): void {
  const extras = Object.keys(args).filter((key) => !keys.includes(key));
  if (extras.length > 0) throw new Error("The action included unsupported fields and was blocked.");
}

export async function executeApprovedLocalTool(call: ModelToolCall): Promise<string> {
  if (!isSupportedLocalTool(call)) {
    throw new Error("This action is not available in OTHRI.");
  }

  const args = parseArguments(call.function.arguments);

  if (call.function.name === "create_task") {
    assertAllowedKeys(args, ["title", "description"]);
    if (typeof args.title !== "string") throw new Error("The task title must be text.");
    if (args.description !== undefined && typeof args.description !== "string") {
      throw new Error("The task description must be text.");
    }
    await createLocalTask(args.title, typeof args.description === "string" ? args.description : "");
    return JSON.stringify({ ok: true, result: "Task saved on this device.", title: args.title.trim() });
  }

  assertAllowedKeys(args, ["category", "content"]);
  const categories = ["profile", "preference", "goal", "context"] as const;
  if (typeof args.category !== "string" || !categories.includes(args.category as typeof categories[number])) {
    throw new Error("The memory category is not supported.");
  }
  if (typeof args.content !== "string") throw new Error("The memory content must be text.");

  await addMemoryEntry(args.category as typeof categories[number], args.content);
  return JSON.stringify({ ok: true, result: "Memory saved on this device.", category: args.category });
}
