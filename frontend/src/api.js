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

export async function exportPosts(type) {
  const res = await fetch(`${BASE}/api/v1/export?type=${type}`);
  if (!res.ok) throw new Error("エクスポートに失敗しました");
  return res.blob();
}

export async function createPost(content) {
  const res = await fetch(`${BASE}/api/v1/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ post: { content } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "投稿に失敗しました");
  return data;
}
