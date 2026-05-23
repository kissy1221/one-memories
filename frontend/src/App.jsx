import React, { useState, useEffect } from "react";
import { fetchToday, fetchPosts, fetchOneYearAgo, fetchStreak, createPost, registerReminder, exportPosts, login, signup } from "./api";

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

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = mode === "login"
        ? await login(email, password)
        : await signup(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      onAuth(data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light tracking-[0.2em] text-stone-700 text-center mb-10">one memory</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <p className="text-stone-500 text-sm font-light tracking-wider mb-6 text-center">
            {mode === "login" ? "LOGIN" : "SIGN UP"}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full text-sm text-stone-700 border border-stone-200 rounded-full px-4 py-2.5 font-light outline-none focus:border-stone-400 bg-white"
              disabled={submitting}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              minLength={8}
              className="w-full text-sm text-stone-700 border border-stone-200 rounded-full px-4 py-2.5 font-light outline-none focus:border-stone-400 bg-white"
              disabled={submitting}
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-stone-800 text-white text-sm rounded-full font-light tracking-wide disabled:opacity-30 hover:bg-stone-700 transition-colors mt-2"
            >
              {submitting ? "..." : mode === "login" ? "ログイン" : "登録する"}
            </button>
          </form>
          <p className="text-center text-stone-400 text-xs mt-6">
            {mode === "login" ? "アカウントをお持ちでない方は" : "すでにアカウントをお持ちの方は"}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              className="underline ml-1 hover:text-stone-600"
            >
              {mode === "login" ? "新規登録" : "ログイン"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
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

function OneYearAgoCard({ post }) {
  return (
    <section className="mt-10">
      <p className="text-stone-400 text-xs tracking-widest font-light mb-4 uppercase">1 Year Ago</p>
      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-8">
        <p className="text-amber-600 text-xs font-light mb-3 tracking-wide">
          {formatDate(post.posted_on)} のあなた
        </p>
        <p className="text-stone-700 text-base leading-relaxed whitespace-pre-wrap font-light">{post.content}</p>
      </div>
    </section>
  );
}

function ReminderForm() {
  const [hour, setHour] = useState(21);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await registerReminder(hour);
      setStatus({ ok: true, message: `${String(hour).padStart(2, "0")}:00 にリマインダーを登録しました。` });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 pt-8 border-t border-stone-100">
      <p className="text-stone-400 text-xs tracking-widest font-light mb-4 uppercase">Reminder</p>
      <p className="text-stone-400 text-sm font-light mb-4">
        未投稿の日に、指定した時刻にメールでお知らせします。
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="flex-1 text-sm text-stone-700 border border-stone-200 rounded-full px-4 py-2 font-light outline-none focus:border-stone-400 bg-white"
          disabled={submitting}
          aria-label="通知時刻"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-stone-200 text-stone-700 text-sm rounded-full font-light hover:bg-stone-300 transition-colors disabled:opacity-40"
        >
          登録
        </button>
      </form>
      {status && (
        <p className={`mt-2 text-xs font-light ${status.ok ? "text-stone-500" : "text-red-400"}`}>
          {status.message}
        </p>
      )}
    </section>
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

function ExportSection() {
  const [exporting, setExporting] = useState(null);

  async function handleExport(type) {
    setExporting(type);
    try {
      const blob = await exportPosts(type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "csv" ? "one-memory.csv" : "one-memory.md";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } finally {
      setExporting(null);
    }
  }

  return (
    <section className="mt-8 pt-8 border-t border-stone-100">
      <p className="text-stone-400 text-xs tracking-widest font-light mb-4 uppercase">Export</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleExport("markdown")}
          disabled={exporting !== null}
          className="px-4 py-2 text-xs text-stone-500 border border-stone-200 rounded-full font-light hover:bg-stone-50 transition-colors disabled:opacity-40"
        >
          {exporting === "markdown" ? "..." : "Markdown"}
        </button>
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting !== null}
          className="px-4 py-2 text-xs text-stone-500 border border-stone-200 rounded-full font-light hover:bg-stone-50 transition-colors disabled:opacity-40"
        >
          {exporting === "csv" ? "..." : "CSV"}
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("email"));
  const [today, setToday] = useState(undefined);
  const [posts, setPosts] = useState([]);
  const [oneYearAgo, setOneYearAgo] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onUnauthorized = () => handleLogout();
    window.addEventListener("unauthorized", onUnauthorized);
    return () => window.removeEventListener("unauthorized", onUnauthorized);
  }, []);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    Promise.allSettled([fetchToday(), fetchPosts(), fetchOneYearAgo(), fetchStreak()])
      .then(([todayResult, postsResult, oyaResult, streakResult]) => {
        if (todayResult.status === "fulfilled") setToday(todayResult.value);
        if (postsResult.status === "fulfilled") setPosts(postsResult.value);
        if (oyaResult.status === "fulfilled") setOneYearAgo(oyaResult.value);
        if (streakResult.status === "fulfilled") setStreak(streakResult.value.streak);
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUserEmail(null);
    setToday(undefined);
    setPosts([]);
    setOneYearAgo(null);
    setStreak(0);
    setLoading(true);
  }

  async function handleCreate(content, mood) {
    const post = await createPost(content, mood);
    setToday(post);
    setPosts((prev) => [post, ...prev]);
    setStreak((prev) => prev + 1);
    return post;
  }

  if (!userEmail) return <AuthForm onAuth={setUserEmail} />;

  const history = posts.filter((p) => !today || p.id !== today.id);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-light tracking-[0.2em] text-stone-700">one memory</h1>
          <p className="mt-2 text-stone-400 text-xs tracking-widest font-light">
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          {streak > 0 && (
            <p className="mt-3 text-amber-500 text-sm font-light tracking-wide">
              🔥 {streak}日連続
            </p>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 text-stone-300 text-xs font-light hover:text-stone-500 transition-colors"
          >
            ログアウト
          </button>
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

        {!loading && oneYearAgo && <OneYearAgoCard post={oneYearAgo} />}

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

        {!loading && posts.length > 0 && <ExportSection />}
        <ReminderForm />
      </div>
    </div>
  );
}
