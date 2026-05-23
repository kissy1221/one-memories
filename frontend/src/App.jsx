import React, { useState, useEffect } from "react";
import { fetchToday, fetchPosts, createPost } from "./api";

const MAX_CHARS = 500;
const MOODS = [
  { value: 1, emoji: "😔" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😊" },
];

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

function MoodPicker({ value, onChange }) {
  return (
    <div className="flex gap-2 mb-4">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(value === m.value ? null : m.value)}
          className={`text-2xl rounded-full w-10 h-10 flex items-center justify-center transition-all
            ${value === m.value ? "bg-stone-100 scale-110" : "opacity-40 hover:opacity-70"}`}
        >
          {m.emoji}
        </button>
      ))}
    </div>
  );
}

function TodayCard({ post }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
      <p className="text-stone-500 text-sm mb-4 font-light tracking-wider">TODAY</p>
      {post.mood_emoji && (
        <span className="text-2xl mb-3 block">{post.mood_emoji}</span>
      )}
      <p className="text-stone-800 text-lg leading-relaxed whitespace-pre-wrap font-light">{post.content}</p>
      <p className="mt-6 text-stone-400 text-xs">{formatDate(post.posted_on)}</p>
    </div>
  );
}

function PostForm({ onSubmit }) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const remaining = MAX_CHARS - content.length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      return await onSubmit(content.trim(), mood);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
      <p className="text-stone-500 text-sm mb-4 font-light tracking-wider">TODAY</p>
      <MoodPicker value={mood} onChange={setMood} />
      <textarea
        className="w-full min-h-[140px] text-stone-800 text-base leading-relaxed font-light placeholder-stone-300 border-none outline-none bg-transparent"
        placeholder="今日のひとこと..."
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
        disabled={submitting}
        autoFocus
      />
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
        <span className={`text-xs ${remaining < 50 ? "text-amber-500" : "text-stone-300"}`}>
          {remaining}
        </span>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="px-6 py-2 bg-stone-800 text-white text-sm rounded-full font-light tracking-wide disabled:opacity-30 hover:bg-stone-700 transition-colors"
        >
          {submitting ? "投稿中..." : "つぶやく"}
        </button>
      </div>
    </form>
  );
}

function HistoryItem({ post }) {
  return (
    <div className="flex gap-6 py-5 border-b border-stone-100 last:border-0">
      <div className="text-right min-w-[64px]">
        <span className="text-xs text-stone-400 font-light leading-relaxed">
          {formatDate(post.posted_on).replace(/\d{4}年/, "").replace("日", "").split("（")[0].trim()}
        </span>
        <span className="block text-xs text-stone-300">
          {new Date(post.posted_on + "T00:00:00").toLocaleDateString("ja-JP", { weekday: "short" })}
        </span>
      </div>
      {post.mood_emoji && (
        <span className="text-lg mt-0.5">{post.mood_emoji}</span>
      )}
      <p className="text-stone-600 text-sm leading-relaxed font-light flex-1 whitespace-pre-wrap">{post.content}</p>
    </div>
  );
}

export default function App() {
  const [today, setToday] = useState(undefined);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchToday(), fetchPosts()])
      .then(([t, all]) => {
        setToday(t);
        setPosts(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(content, mood) {
    const post = await createPost(content, mood);
    setToday(post);
    setPosts((prev) => [post, ...prev]);
    return post;
  }

  const history = posts.filter((p) => !today || p.id !== today.id);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-light tracking-[0.2em] text-stone-700">one memory</h1>
          <p className="mt-2 text-stone-400 text-xs tracking-widest font-light">
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 animate-pulse">
            <div className="h-3 w-16 bg-stone-100 rounded mb-4" />
            <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
            <div className="h-4 bg-stone-100 rounded w-1/2" />
          </div>
        ) : today ? (
          <TodayCard post={today} />
        ) : (
          <PostForm onSubmit={handleCreate} />
        )}

        {history.length > 0 && (
          <section className="mt-10">
            <p className="text-stone-400 text-xs tracking-widest font-light mb-4 uppercase">Past</p>
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 px-8">
              {history.map((post) => (
                <HistoryItem key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {!loading && posts.length === 0 && !today && (
          <p className="text-center text-stone-300 text-sm mt-16 font-light">まだ記録がありません</p>
        )}
      </div>
    </div>
  );
}
