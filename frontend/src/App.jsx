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

function NotebookPage({ children }) {
  return (
    <div className="min-h-screen bg-desk py-6 sm:py-10 px-3 sm:px-6">
      <PaperSheet>{children}</PaperSheet>
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
            氏名：<span className="font-hand text-ink text-xs">あなた</span>{"　　1冊目"}
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

  const inputClass =
    "w-full bg-transparent text-sm text-ink placeholder:text-pencil border-0 border-b border-rule focus:border-ink outline-none px-1 py-2 rounded-none";

  return (
    <div className="min-h-screen bg-desk flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-paper border border-scrap-edge rounded-sm shadow-[0_6px_18px_rgba(0,0,0,0.25)] p-8">
        <h1 className="font-display font-bold text-xl text-ink text-center tracking-[0.2em] mb-1">one memory</h1>
        <p className="text-pencil-dark text-[11px] text-center tracking-[0.3em] mb-8">
          {mode === "login" ? "ログイン" : "新規登録"}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className={inputClass}
            disabled={submitting}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
            minLength={8}
            className={inputClass}
            disabled={submitting}
          />
          {error && <p className="text-ink-red text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-ink text-paper text-sm rounded hover:bg-cover-dark transition-colors disabled:opacity-30 mt-1"
          >
            {submitting ? "..." : mode === "login" ? "ログイン" : "登録する"}
          </button>
        </form>
        <p className="text-center text-pencil-dark text-xs mt-6">
          {mode === "login" ? "アカウントをお持ちでない方は" : "すでにアカウントをお持ちの方は"}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="underline ml-1 hover:text-ink"
          >
            {mode === "login" ? "新規登録" : "ログイン"}
          </button>
        </p>
        {onBack && (
          <p className="text-center mt-4">
            <button
              onClick={onBack}
              className="text-pencil-dark/80 text-xs hover:text-ink transition-colors"
            >
              ← トップに戻る
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function MoodPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          aria-label={`きぶん${m.value}`}
          aria-pressed={value === m.value}
          onClick={() => onChange(value === m.value ? null : m.value)}
          className={`text-lg w-7 h-7 flex items-center justify-center rounded-full transition-all
            ${value === m.value ? "bg-white/70 scale-110" : "opacity-40 hover:opacity-70"}`}
        >
          {m.emoji}
        </button>
      ))}
    </div>
  );
}

function TodayCard({ post }) {
  return (
    <section className="bg-ruled pl-[72px] sm:pl-[94px] pr-5">
      <p className="text-[11px] text-pencil-dark leading-[28px]">
        {formatDate(post.posted_on)}
        {post.mood_emoji && <>{" きぶん "}<span className="text-sm">{post.mood_emoji}</span></>}
      </p>
      <p className="font-hand text-[15px] text-ink leading-[28px] whitespace-pre-wrap pb-[28px]">{post.content}</p>
    </section>
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
    <form onSubmit={handleSubmit} className="bg-ruled pl-[72px] sm:pl-[94px] pr-5">
      <div className="flex items-center gap-2 h-[28px]">
        <span className="text-[11px] text-pencil-dark">
          {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
        </span>
        <span className="text-[11px] text-pencil-dark ml-2">きぶん</span>
        <MoodPicker value={mood} onChange={setMood} />
      </div>
      <textarea
        className="block w-full min-h-[112px] bg-transparent font-hand text-[15px] text-ink leading-[28px] placeholder:text-pencil placeholder:font-sans border-none outline-none"
        placeholder="今日のひとこと..."
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
        disabled={submitting}
        autoFocus
      />
      <div className="flex items-center justify-end gap-4 h-[56px]">
        {error && <p className="text-ink-red text-xs">{error}</p>}
        <span className={`text-xs ${remaining < 50 ? "text-ink-red" : "text-pencil"}`}>{remaining}</span>
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="bg-ink text-paper text-sm rounded px-6 py-2 hover:bg-cover-dark transition-colors disabled:opacity-30"
        >
          {submitting ? "書いています..." : "書きとめる"}
        </button>
      </div>
    </form>
  );
}

function OneYearAgoCard({ post }) {
  return (
    <section className="ml-[72px] sm:ml-[94px] mr-5 mt-5 mb-3">
      <div className="relative bg-scrap border border-scrap-edge shadow-[1px_2px_4px_rgba(0,0,0,0.08)] -rotate-[0.7deg] px-4 py-3">
        <div aria-hidden="true" className="absolute -top-2 left-4 w-12 h-3.5 bg-margin-red/25 -rotate-2" />
        <p className="text-[10px] tracking-[0.15em] text-pencil-dark mb-1">
          1年前のきょう ─ {formatDate(post.posted_on)}
        </p>
        <p className="font-hand text-[13px] text-pencil-dark leading-relaxed whitespace-pre-wrap">{post.content}</p>
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

  const selectClass =
    "flex-1 bg-transparent text-sm text-ink border-0 border-b border-rule focus:border-ink outline-none py-1.5 rounded-none";

  return (
    <section>
      <p className="text-[11px] tracking-[0.25em] text-pencil-dark mb-3">リマインダー</p>

      {reminder === undefined ? null : reminder === null ? (
        <>
          <p className="text-pencil-dark text-sm mb-3">
            未投稿の日に、指定した時刻にメールでお知らせします。
          </p>
          <form onSubmit={handleRegister} className="flex gap-3 items-end">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className={selectClass}
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
              className="px-5 py-2 bg-ink text-paper text-sm rounded hover:bg-cover-dark transition-colors disabled:opacity-40"
            >
              登録
            </button>
          </form>
        </>
      ) : editing ? (
        <form onSubmit={handleRegister} className="flex gap-3 items-end">
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className={selectClass}
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
            className="px-5 py-2 bg-ink text-paper text-sm rounded hover:bg-cover-dark transition-colors disabled:opacity-40"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setHour(reminder.notify_hour); }}
            className="px-3 py-2 text-pencil-dark text-sm hover:text-ink"
          >
            キャンセル
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-ink text-sm">
              {String(reminder.notify_hour).padStart(2, "0")}:00 に通知
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-pencil-dark text-xs hover:text-ink mt-1"
            >
              時刻を変更
            </button>
          </div>
          <button
            onClick={handleToggle}
            disabled={submitting}
            aria-label={reminder.active ? "リマインダーをOFFにする" : "リマインダーをONにする"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40
              ${reminder.active ? "bg-ink" : "bg-rule"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-paper shadow transition-transform
                ${reminder.active ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      )}

      {status && (
        <p className={`mt-2 text-xs ${status.ok ? "text-pencil-dark" : "text-ink-red"}`}>
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
  const d = new Date(post.posted_on + "T00:00:00");
  return (
    <div className="flex">
      <div className="w-14 sm:w-[78px] shrink-0 text-right pr-2.5 text-[11px] text-pencil-dark leading-[28px]">
        {d.getDate()} {d.toLocaleDateString("ja-JP", { weekday: "short" })}
      </div>
      <p className="flex-1 pl-4 pr-5 font-hand text-[13px] text-ink/85 leading-[28px] whitespace-pre-wrap">
        {post.mood_emoji && <span className="mr-1.5">{post.mood_emoji}</span>}
        {post.content}
      </p>
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
    <section className="mb-6">
      <p className="text-[11px] tracking-[0.25em] text-pencil-dark mb-3">エクスポート</p>
      <div className="flex gap-2">
        <button
          onClick={() => handleExport("markdown")}
          disabled={exporting !== null}
          className="px-4 py-1.5 text-xs text-pencil-dark border border-scrap-edge rounded hover:bg-scrap transition-colors disabled:opacity-40"
        >
          {exporting === "markdown" ? "..." : "Markdown"}
        </button>
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting !== null}
          className="px-4 py-1.5 text-xs text-pencil-dark border border-scrap-edge rounded hover:bg-scrap transition-colors disabled:opacity-40"
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

  const inputClass =
    "w-full bg-transparent text-sm text-ink placeholder:text-pencil border-0 border-b border-rule focus:border-ink outline-none px-1 py-2 rounded-none";

  return (
    <NotebookPage>
      <div className="pl-[72px] sm:pl-[94px] pr-5 pt-6 pb-10">
        <button
          onClick={onClose}
          className="text-pencil-dark text-xs hover:text-ink transition-colors"
        >
          ← 戻る
        </button>
        <h1 className="font-display font-bold text-lg text-ink tracking-[0.15em] mt-6">アカウント設定</h1>
        <p className="mt-1 text-pencil-dark text-xs">{userEmail}</p>

        <div className="mt-8 border-t border-b border-scrap-edge divide-y divide-scrap-edge">
          {/* メールアドレス変更 */}
          <div className="py-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-ink text-sm">メールアドレス</p>
              {section !== "email" && (
                <button
                  onClick={() => handleSectionChange("email")}
                  className="text-xs text-pencil-dark hover:text-ink"
                >
                  変更
                </button>
              )}
            </div>
            <p className="text-pencil-dark text-xs">{userEmail}</p>

            {section === "email" && (
              <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-4">
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
                  <p className={`text-xs ${status.ok ? "text-pencil-dark" : "text-ink-red"}`}>
                    {status.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-ink text-paper text-sm rounded hover:bg-cover-dark transition-colors disabled:opacity-30"
                  >
                    {submitting ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionChange(null)}
                    className="px-4 py-2 text-pencil-dark text-sm hover:text-ink"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* パスワード変更 */}
          <div className="py-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-ink text-sm">パスワード</p>
              {section !== "password" && (
                <button
                  onClick={() => handleSectionChange("password")}
                  className="text-xs text-pencil-dark hover:text-ink"
                >
                  変更
                </button>
              )}
            </div>
            <p className="text-pencil-dark text-xs">••••••••</p>

            {section === "password" && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-4">
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
                  <p className={`text-xs ${status.ok ? "text-pencil-dark" : "text-ink-red"}`}>
                    {status.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-ink text-paper text-sm rounded hover:bg-cover-dark transition-colors disabled:opacity-30"
                  >
                    {submitting ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionChange(null)}
                    className="px-4 py-2 text-pencil-dark text-sm hover:text-ink"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {section === null && status?.ok && (
          <p className="mt-4 text-center text-pencil-dark text-xs">{status.message}</p>
        )}
      </div>
    </NotebookPage>
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
    <NotebookPage>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pl-[72px] sm:pl-[94px] pr-5 pt-6 pb-3">
        <h1 className="whitespace-nowrap font-display font-bold text-base sm:text-lg text-ink tracking-[0.2em]">one memory</h1>
        <div className="flex items-baseline gap-3 text-[11px] text-pencil-dark">
          {streak > 0 && <span className="whitespace-nowrap">🔥 {streak}日連続</span>}
          <button onClick={() => setShowSettings(true)} className="whitespace-nowrap hover:text-ink transition-colors">設定</button>
          <button onClick={handleLogout} className="whitespace-nowrap hover:text-ink transition-colors">ログアウト</button>
        </div>
      </header>

      {loading ? (
        <div className="pl-[72px] sm:pl-[94px] pr-5 pb-8 animate-pulse" aria-hidden="true">
          <div className="h-3 w-24 bg-rule/50 rounded mb-4" />
          <div className="h-3 w-3/4 bg-rule/50 rounded mb-3" />
          <div className="h-3 w-1/2 bg-rule/50 rounded" />
        </div>
      ) : today ? (
        <TodayCard post={today} />
      ) : (
        <PostForm onSubmit={handleCreate} />
      )}

      {!loading && oneYearAgo && <OneYearAgoCard post={oneYearAgo} />}

      {history.length > 0 && (
        <section className="bg-ruled mt-2 pb-[28px]">
          {groupByYearMonth(history).map(([month, monthPosts]) => (
            <div key={month}>
              <p className="text-center text-[11px] text-pencil-dark tracking-[0.25em] leading-[28px]">
                <span aria-hidden="true">{"─　"}</span>
                <span>{month}</span>
                <span aria-hidden="true">{"　─"}</span>
              </p>
              {monthPosts.map((post) => (
                <HistoryItem key={post.id} post={post} />
              ))}
            </div>
          ))}
        </section>
      )}

      {!loading && posts.length === 0 && !today && (
        <p className="bg-ruled text-center font-hand text-pencil-dark text-sm leading-[28px] pb-[56px]">
          まだ何も書かれていません。最初のひとことをどうぞ。
        </p>
      )}

      <footer className="border-t border-scrap-edge mt-4 pl-[72px] sm:pl-[94px] pr-5 py-6">
        {!loading && posts.length > 0 && <ExportSection />}
        <ReminderForm />
      </footer>
    </NotebookPage>
  );
}
