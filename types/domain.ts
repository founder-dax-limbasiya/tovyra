export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_for_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  enabled: boolean;
}

export interface ActionApproval {
  id: string;
  actionName: string;
  explanation: string;
  requestedScope: string[];
  status: ApprovalStatus;
  createdAt: string;
  expiresAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  approvalId?: string;
}

export interface MemoryRecord {
  id: string;
  category: "profile" | "preference" | "goal" | "context";
  content: string;
  createdAt: string;
  updatedAt: string;
  source: "user" | "approved_import";
}
