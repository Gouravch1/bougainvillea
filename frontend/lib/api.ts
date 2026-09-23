import { getToken } from "./auth";

function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      errorMsg = err.error || err.message || errorMsg;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content or empty body
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text() as unknown as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      request("/api/auth/register", { method: "POST", body: data }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string }>("/api/auth/login", { method: "POST", body: data }),
  },

  // ─── User ──────────────────────────────────────────────────────────────────
  user: {
    me: () => request<{ id: number; username: string; email: string }>("/api/users/me"),
  },

  // ─── Rooms ─────────────────────────────────────────────────────────────────
  rooms: {
    create: (data: { roomName: string; isPublic: boolean; roomPassword?: string }) =>
      request<{ roomCode: string; roomName: string; isPublic: boolean }>("/rooms/create", {
        method: "POST",
        body: data,
      }),
    join: (data: { roomCode: string; password?: string }) =>
      request<string>("/rooms/join", { method: "POST", body: data }),
    leave: (roomCode: string) =>
      request<string>(`/rooms/${roomCode}/leave`, { method: "DELETE" }),
    delete: (roomCode: string) =>
      request<string>(`/rooms/${roomCode}`, { method: "DELETE" }),
    kick: (roomCode: string, userId: number) =>
      request<string>(`/rooms/${roomCode}/kick/${userId}`, { method: "DELETE" }),
    members: (roomCode: string) =>
      request<{ id: number; user: { id: number; username: string; email: string }; joinedAt: string }[]>(
        `/rooms/${roomCode}/members`
      ),
    public: () =>
      request<{ roomCode: string; roomName: string; isPublic: boolean }[]>("/rooms/public"),
  },

  // ─── Video ─────────────────────────────────────────────────────────────────
  video: {
    upload: (roomCode: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ roomCode: string; videoKey: string; videoUrl: string }>(
        `/rooms/${roomCode}/video`,
        { method: "POST", body: formData, isFormData: true }
      );
    },
    get: (roomCode: string) =>
      request<{ roomCode: string; videoKey: string | null; videoUrl: string | null }>(
        `/rooms/${roomCode}/video`
      ),
    delete: (roomCode: string) =>
      request<string>(`/rooms/${roomCode}/video`, { method: "DELETE" }),
  },
};
