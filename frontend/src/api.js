const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchToday() {
  const res = await fetch(`${BASE}/api/v1/posts/today`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchPosts() {
  const res = await fetch(`${BASE}/api/v1/posts`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchOneYearAgo() {
  const res = await fetch(`${BASE}/api/v1/posts/one_year_ago`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function fetchStreak() {
  const res = await fetch(`${BASE}/api/v1/posts/streak`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export async function registerReminder(email) {
  const res = await fetch(`${BASE}/api/v1/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0] || "登録に失敗しました");
  return data;
}

export async function exportPosts(type) {
  const res = await fetch(`${BASE}/api/v1/export?type=${type}`);
  if (!res.ok) throw new Error("エクスポートに失敗しました");
  return res.blob();
}

export async function createPost(content, mood = null) {
  const res = await fetch(`${BASE}/api/v1/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post: { content, mood } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "投稿に失敗しました");
  return data;
}
