import React, { useState, useEffect } from "react";
import { fetchToday, fetchPosts, fetchOneYearAgo, fetchStreak, createPost, fetchReminder, registerReminder, updateReminder, exportPosts, login, signup, updateUser } from "./api";

const FEATURES = [
  {
    title: "1日1回だけ書く",
    desc: "投稿は1日に1回まで。「完璧に書かなきゃ」のプレッシャーがなく、ひとことでも十分です。",
  },
  {
    title: "気分をemojiで記録",
    desc: "5段階の気分を絵文字で残せます。文章には書けない、その日の感情の記録になります。",
  },
  {
    title: "🔥 連続記録で習慣化",
    desc: "何日連続で書けたか自動でカウント。メールリマインダーで書き忘れも防げます。",
  },
  {
    title: "データは自分のもの",
    desc: "全投稿をMarkdownまたはCSVでいつでもエクスポートできます。ロックインなし。",
  },
];

function PaperSheet({ children }) {
  return (
    <div className="relative max-w-[560px] mx-auto bg-paper rounded-l-sm rounded-r-lg shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-3.5 rounded-l-sm bg-gradient-to-r from-black/15 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-14 sm:left-[78px] w-px bg-margin-red opacity-75" />
      <div className="relative">{children}</div>
    </div>
  );
}

function NotebookCover({ onStart }) {
  return (
    <div className="max-w-[360px] mx-auto">
      <div className="bg-cover-dark rounded-l rounded-r-[10px] px-7 py-9 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
        <div className="bg-paper border border-scrap-edge px-4 py-6 text-center">
          <p className="text-pencil-dark text-[10px] tracking-[0.3em] mb-2">毎日ひとことの日記帳</p>
          <h1 className="font-display font-black text-2xl text-ink tracking-[0.12em]">one memory</h1>
          <div aria-hidden="true" className="h-px bg-margin-red mx-6 my-4" />
          <p className="font-hand text-ink text-sm leading-7">
            今日のひとことが、<br />1年後の宝物になる。
          </p>
          <p className="mt-5 text-pencil-dark text-[10px]">
            氏名：<span className="font-hand text-ink text-xs">あなた</span>　　1冊目
          </p>
        </div>
        <button
          onClick={onStart}
          className="mt-7 mx-auto block bg-paper text-ink text-sm rounded px-8 py-2.5 hover:bg-scrap transition-colors"
        >
          ノートをひらく
        </button>
      </div>
    </div>
  );
}

function HeroPage({ onStart }) {
  return (
    <div className="min-h-screen bg-desk">
      <nav className="max-w-[560px] mx-auto flex justify-end px-4 pt-6">
        <button onClick={onStart} className="text-paper/80 text-sm hover:text-paper transition-colors">
          ログイン
        </button>
      </nav>

      <section className="px-4 pt-8 pb-16 sm:pt-12 sm:pb-20">
        <NotebookCover onStart={onStart} />
        <p className="mt-8 text-center text-paper/60 text-xs tracking-[0.2em]">
          1日1回だけ書ける、ひとこと日記帳
        </p>
      </section>

      <section className="px-3 sm:px-6 pb-16">
        <PaperSheet>
          <p className="pl-[72px] sm:pl-[94px] pr-5 pt-7 text-pencil-dark text-[11px] tracking-[0.25em] leading-[28px]">
            このノートにできること
          </p>
          <div className="bg-ruled pl-[72px] sm:pl-[94px] pr-5 pb-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="pt-[28px]">
                <p className="text-ink text-sm font-medium leading-[28px]">{f.title}</p>
                <p className="font-hand text-ink/80 text-sm leading-[28px]">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="pl-[72px] sm:pl-[94px] pr-5 pt-6">
            <h3 className="font-display font-bold text-lg text-ink leading-relaxed">
              1年前の今日、あなたは何を感じていましたか？
            </h3>
            <p className="mt-2 text-pencil-dark text-sm leading-relaxed">
              投稿した日からちょうど1年後、その記録がページに貼り出されます。
              去年の自分の言葉に、笑ったり、懐かしんだり、成長を感じたり。
            </p>
            <div className="relative bg-scrap border border-scrap-edge shadow-[1px_2px_4px_rgba(0,0,0,0.08)] -rotate-[0.7deg] px-4 py-3 mt-5 mb-2">
              <div aria-hidden="true" className="absolute -top-2 left-4 w-12 h-3.5 bg-margin-red/25 -rotate-2" />
              <p className="text-[10px] tracking-[0.15em] text-pencil-dark mb-1">1年前のきょう ─ 2025年7月18日</p>
              <p className="font-hand text-[13px] text-pencil-dark leading-relaxed">
                桜が満開だった。お花見できてよかった。来年も見たいな。🌸
              </p>
            </div>
          </div>

          <div className="border-t border-scrap-edge mt-8 py-10 text-center px-6">
            <p className="font-display font-bold text-lg text-ink mb-2">今日から、書きはじめよう。</p>
            <p className="text-pencil-dark text-xs mb-6">アカウント登録は1分、無料で使えます。</p>
            <button
              onClick={onStart}
              className="bg-ink text-paper text-sm rounded px-9 py-3 hover:bg-cover-dark transition-colors"
            >
              ノートをひらく
            </button>
          </div>
        </PaperSheet>
      </section>

      <footer className="pb-8 text-center">
        <p className="text-paper/50 text-xs tracking-[0.3em] font-display">one memory</p>
      </footer>
    </div>
  );
}

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

function AuthForm({ onAuth, onBack }) {
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
          {onBack && (
            <p className="text-center mt-4">
              <button
                onClick={onBack}
                className="text-stone-300 text-xs font-light hover:text-stone-500 transition-colors"
              >
                ← トップに戻る
              </button>
            </p>
          )}
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
  const [reminder, setReminder] = useState(undefined); // undefined=loading, null=未設定
  const [hour, setHour] = useState(21);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReminder()
      .then((data) => {
        setReminder(data);
        if (data) setHour(data.notify_hour);
      })
      .catch(() => setReminder(null));
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const data = await registerReminder(hour);
      setReminder({ notify_hour: data.notify_hour, active: data.active });
      setEditing(false);
      setStatus({ ok: true, message: `${String(data.notify_hour).padStart(2, "0")}:00 にリマインダーを登録しました。` });
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle() {
    if (!reminder) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const data = await updateReminder({ active: !reminder.active });
      setReminder((prev) => ({ ...prev, active: data.active }));
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 pt-8 border-t border-stone-100">
      <p className="text-stone-400 text-xs tracking-widest font-light mb-4 uppercase">Reminder</p>

      {reminder === undefined ? null : reminder === null ? (
        <>
          <p className="text-stone-400 text-sm font-light mb-4">
            未投稿の日に、指定した時刻にメールでお知らせします。
          </p>
          <form onSubmit={handleRegister} className="flex gap-2">
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
        </>
      ) : editing ? (
        <form onSubmit={handleRegister} className="flex gap-2">
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
            className="px-5 py-2 bg-stone-800 text-white text-sm rounded-full font-light hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setHour(reminder.notify_hour); }}
            className="px-4 py-2 text-stone-400 text-sm font-light hover:text-stone-600"
          >
            キャンセル
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-600 text-sm font-light">
              {String(reminder.notify_hour).padStart(2, "0")}:00 に通知
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-stone-400 text-xs font-light hover:text-stone-600 mt-1"
            >
              時刻を変更
            </button>
          </div>
          <button
            onClick={handleToggle}
            disabled={submitting}
            aria-label={reminder.active ? "リマインダーをOFFにする" : "リマインダーをONにする"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40
              ${reminder.active ? "bg-stone-700" : "bg-stone-200"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${reminder.active ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      )}

      {status && (
        <p className={`mt-2 text-xs font-light ${status.ok ? "text-stone-500" : "text-red-400"}`}>
          {status.message}
        </p>
      )}
    </section>
  );
}

function groupByYearMonth(posts) {
  const groups = [];
  const seen = {};
  for (const post of posts) {
    const d = new Date(post.posted_on + "T00:00:00");
    const key = d.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
    if (!seen[key]) {
      seen[key] = [];
      groups.push([key, seen[key]]);
    }
    seen[key].push(post);
  }
  return groups;
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

function UserSettings({ userEmail, onEmailChange, onClose }) {
  const [section, setSection] = useState(null); // null | "email" | "password"
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState(userEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  function resetForm() {
    setCurrentPassword("");
    setNewEmail(userEmail);
    setNewPassword("");
    setConfirmPassword("");
    setStatus(null);
  }

  function handleSectionChange(s) {
    setSection(s);
    resetForm();
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const data = await updateUser({ current_password: currentPassword, email: newEmail });
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      onEmailChange(data.email);
      setStatus({ ok: true, message: "メールアドレスを更新しました。" });
      setSection(null);
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ ok: false, message: "新しいパスワードが一致しません。" });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const data = await updateUser({ current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword });
      localStorage.setItem("token", data.token);
      setStatus({ ok: true, message: "パスワードを更新しました。" });
      setSection(null);
      resetForm();
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full text-sm text-stone-700 border border-stone-200 rounded-full px-4 py-2.5 font-light outline-none focus:border-stone-400 bg-white";

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        <header className="mb-10">
          <button
            onClick={onClose}
            className="text-stone-400 text-xs font-light hover:text-stone-600 transition-colors mb-6 block"
          >
            ← 戻る
          </button>
          <h1 className="text-xl font-light tracking-[0.2em] text-stone-700">アカウント設定</h1>
          <p className="mt-1 text-stone-400 text-xs font-light">{userEmail}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 divide-y divide-stone-100">
          {/* メールアドレス変更 */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-stone-700 text-sm font-light">メールアドレス</p>
              {section !== "email" && (
                <button
                  onClick={() => handleSectionChange("email")}
                  className="text-xs text-stone-400 hover:text-stone-600 font-light"
                >
                  変更
                </button>
              )}
            </div>
            <p className="text-stone-400 text-xs font-light">{userEmail}</p>

            {section === "email" && (
              <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="現在のパスワード"
                  required
                  className={inputClass}
                  disabled={submitting}
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="新しいメールアドレス"
                  required
                  className={inputClass}
                  disabled={submitting}
                />
                {status && (
                  <p className={`text-xs font-light ${status.ok ? "text-stone-500" : "text-red-400"}`}>
                    {status.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-stone-800 text-white text-sm rounded-full font-light hover:bg-stone-700 transition-colors disabled:opacity-30"
                  >
                    {submitting ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionChange(null)}
                    className="px-4 py-2 text-stone-400 text-sm font-light hover:text-stone-600"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* パスワード変更 */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-stone-700 text-sm font-light">パスワード</p>
              {section !== "password" && (
                <button
                  onClick={() => handleSectionChange("password")}
                  className="text-xs text-stone-400 hover:text-stone-600 font-light"
                >
                  変更
                </button>
              )}
            </div>
            <p className="text-stone-400 text-xs font-light">••••••••</p>

            {section === "password" && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="現在のパスワード"
                  required
                  className={inputClass}
                  disabled={submitting}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワード（8文字以上）"
                  required
                  minLength={8}
                  className={inputClass}
                  disabled={submitting}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="新しいパスワード（確認）"
                  required
                  minLength={8}
                  className={inputClass}
                  disabled={submitting}
                />
                {status && (
                  <p className={`text-xs font-light ${status.ok ? "text-stone-500" : "text-red-400"}`}>
                    {status.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-stone-800 text-white text-sm rounded-full font-light hover:bg-stone-700 transition-colors disabled:opacity-30"
                  >
                    {submitting ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionChange(null)}
                    className="px-4 py-2 text-stone-400 text-sm font-light hover:text-stone-600"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {section === null && status?.ok && (
          <p className="mt-4 text-center text-stone-500 text-xs font-light">{status.message}</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("email"));
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
    setShowAuth(false);
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

  if (!userEmail && !showAuth) return <HeroPage onStart={() => setShowAuth(true)} />;
  if (!userEmail) return <AuthForm onAuth={setUserEmail} onBack={() => setShowAuth(false)} />;

  if (showSettings) {
    return (
      <UserSettings
        userEmail={userEmail}
        onEmailChange={(email) => setUserEmail(email)}
        onClose={() => setShowSettings(false)}
      />
    );
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
          {streak > 0 && (
            <p className="mt-3 text-amber-500 text-sm font-light tracking-wide">
              🔥 {streak}日連続
            </p>
          )}
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="text-stone-300 text-xs font-light hover:text-stone-500 transition-colors"
            >
              設定
            </button>
            <button
              onClick={handleLogout}
              className="text-stone-300 text-xs font-light hover:text-stone-500 transition-colors"
            >
              ログアウト
            </button>
          </div>
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
            <p className="text-stone-400 text-xs tracking-widest font-light mb-6 uppercase">Past</p>
            {groupByYearMonth(history).map(([month, monthPosts]) => (
              <div key={month} className="mb-6">
                <p className="text-stone-300 text-xs font-light mb-2 tracking-wide">{month}</p>
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 px-8">
                  {monthPosts.map((post) => (
                    <HistoryItem key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ))}
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
