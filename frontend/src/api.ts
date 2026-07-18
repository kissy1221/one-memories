import type {
  AuthResponse,
  Post,
  Reminder,
  ReminderResult,
  StreakResponse,
  UpdateReminderParams,
  UpdateUserParams,
  User,
} from "./types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleResponse(res: Response): Response {
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.dispatchEvent(new Event("unauthorized"));
  }
  return res;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0] || "登録に失敗しました");
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "ログインに失敗しました");
  return data;
}

export async function fetchToday(): Promise<Post | null> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/posts/today`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchPosts(): Promise<Post[]> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/posts`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchOneYearAgo(): Promise<Post | null> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/posts/one_year_ago`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchStreak(): Promise<StreakResponse> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/posts/streak`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchReminder(): Promise<Reminder | null> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/reminders`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function registerReminder(notifyHour: number): Promise<ReminderResult> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/reminders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ notify_hour: notifyHour }),
  }));
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0] || "登録に失敗しました");
  return data;
}

export async function updateReminder(params: UpdateReminderParams): Promise<Reminder> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/reminders`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(params),
  }));
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0] || "更新に失敗しました");
  return data;
}

export async function exportPosts(type: string): Promise<Blob> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/export?type=${type}`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("エクスポートに失敗しました");
  return res.blob();
}

export async function fetchCurrentUser(): Promise<User> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/users/me`, { headers: authHeaders() }));
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function updateUser(params: UpdateUserParams): Promise<AuthResponse> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/users/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(params),
  }));
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.errors?.[0] || "更新に失敗しました");
  return data;
}

export async function createPost(content: string, mood: number | null = null): Promise<Post> {
  const res = handleResponse(await fetch(`${BASE}/api/v1/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ post: { content, mood } }),
  }));
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "投稿に失敗しました");
  return data;
}
