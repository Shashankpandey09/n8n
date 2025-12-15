import axios from "axios";
import { create } from "zustand";
export enum ExecutionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  RUNNING = "RUNNING",
  TESTING = "TESTING",
}
export enum TaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
type ExecutedNodesType = {
  nodeId: string;
  status: TaskStatus;
  execution: {
    status: ExecutionStatus;
  };
};
export interface ExecutionTask {
  id: number;
  nodeId: string;
  status: TaskStatus;
  attempts: number;
  input?: any;
  output?: any;
  error?: string;
  startedAt: string;
  finishedAt: string;
}
export interface Execution {
  id: number;
  workflow: {
    title: string;
    id: string;
  };
  status: ExecutionStatus;
  tasks: ExecutionTask[];
  createdAt: string;
}
interface ExecutionState {
  executions: Execution[];
  isLoading: boolean;
  error: string | null;
  isTestActive: Boolean;
  ExecutionId: number | null;
  ExecutedNodes: ExecutedNodesType[];
  fetchExecutions: () => Promise<void>;
  fetchExecutionTaskStatus: (executionId: number | null) => Promise<void>;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  executions: [],
  isLoading: false,
  error: null,
  isTestActive: false,
  ExecutionId: null,
  ExecutedNodes: [],
  fetchExecutions: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await axios.get(
        "http://localhost:3000/api/v1/workflow/executions",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.ok) {
        set({ executions: res.data.executions, isLoading: false });
      } else {
        set({ error: "Failed to fetch executions", isLoading: false });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.error ?? "Error while fetching Executions",
      });
    }
  },
  fetchExecutionTaskStatus: async (executionId: number | null) => {
    if (!executionId) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/workflow/executionTask/${executionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const executedNodes = res.data.executedNodes ?? [];

      const currentStatus =
        executedNodes.length > 0
          ? executedNodes[0].execution.status
          : ExecutionStatus.PENDING;

      if (
        currentStatus === ExecutionStatus.SUCCESS ||
        currentStatus === ExecutionStatus.FAILED
      ) {
        set({
          isTestActive: false,
          ExecutionId: executionId,
          ExecutedNodes: executedNodes,
        });
      } else {
        set({
          isTestActive: true,
          ExecutionId: executionId,
          ExecutedNodes: executedNodes,
        });
      }
    } catch (error) {
      console.error("Error fetching execution status:", error);
      set({ isTestActive: false });
    }
  },
}));
