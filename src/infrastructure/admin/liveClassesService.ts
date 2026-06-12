import { apiClient } from "@/infrastructure/http/apiClient";

export type MeetingStatus = "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
export type MeetingType = "ALL_BATCH" | "CUSTOM_STUDENTS";

export interface AllowedStudent {
  id: string;
  liveSessionId: string;
  studentId: string;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  startTime: string; // ISO String from backend
  duration: number; // in minutes
  status: MeetingStatus;
  type: MeetingType;
  batchId: string;
  instructorId: string;
  dyteMeetingId: string;
  createdAt: string;
  updatedAt: string;
  allowedStudents?: AllowedStudent[];
  // UI fields added after mapping
  batchName?: string;
}

const MEETING_URL =
  (import.meta.env.VITE_MEETING_SERVICE_URL as string | undefined) ??
  (import.meta.env.VITE_ADMIN_SERVICE_URL as string | undefined) ??
  "http://localhost:4002";

const base = `${MEETING_URL}/api/meetings`;

export const liveClassesService = {
  getMeetingsByBatch: async (batchId: string, status?: MeetingStatus): Promise<LiveSession[]> => {
    const url = status ? `${base}/batch/${batchId}?status=${status}` : `${base}/batch/${batchId}`;
    try {
      const response = await apiClient.get<
        { success: boolean; data: LiveSession[] } | LiveSession[]
      >(url);
      // Backend controller returns `{ success: true, data: result }`
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === "object" && "data" in response) {
        return (response.data as LiveSession[]) || [];
      }
      return [];
    } catch (err) {
      console.error(`Failed to get meetings for batch ${batchId}:`, err);
      return [];
    }
  },

  scheduleMeeting: async (payload: {
    title: string;
    description?: string;
    startTime: string;
    duration: number;
    batchId: string;
    instructorId: string;
    type: MeetingType;
    customStudentIds?: string[];
  }): Promise<LiveSession> => {
    const backendPayload = {
      title: payload.title,
      description: payload.description,
      startTime: payload.startTime,
      duration: payload.duration,
      batchId: payload.batchId,
      instructorId: payload.instructorId,
      targetType: payload.type === "CUSTOM_STUDENTS" ? "INDIVIDUAL" : "BATCH",
      studentIds: payload.customStudentIds,
    };
    const response = await apiClient.post<LiveSession | { data: LiveSession }>(
      base,
      backendPayload,
    );
    // Unbox `{ success: true, data: result }` if returned that way
    if (response && typeof response === "object" && "data" in response) {
      return response.data;
    }
    return response as LiveSession;
  },

  joinSession: async (
    id: string,
    payload: {
      userId: string;
      name: string;
      role: "host" | "participant";
    },
  ): Promise<{ token: string; dyteMeetingId: string; sessionTitle: string }> => {
    type JoinRes = { token: string; dyteMeetingId: string; sessionTitle: string };
    const response = await apiClient.post<JoinRes | { data: JoinRes }>(
      `${base}/${id}/join`,
      payload,
    );
    if (response && typeof response === "object" && "data" in response) {
      return response.data;
    }
    return response as JoinRes;
  },

  updateStatus: async (id: string, status: MeetingStatus): Promise<LiveSession> => {
    const response = await apiClient.patch<LiveSession | { data: LiveSession }>(
      `${base}/${id}/status`,
      { status },
    );
    if (response && typeof response === "object" && "data" in response) {
      return response.data;
    }
    return response as LiveSession;
  },
};
