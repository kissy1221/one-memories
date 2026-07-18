# デザイン刷新（大学ノート案）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** one memory の全画面を「机の上に開いた1冊の大学ノート」デザインに刷新する（スペック: `docs/superpowers/specs/2026-07-18-notebook-design-design.md`）。

**Architecture:** ロジック・API・状態管理は一切変えず、`frontend/src/App.jsx` 内の各コンポーネントの JSX 構造と className、および一部の文言のみを置き換える。トークン（色・フォント・罫線ユーティリティ）を Tailwind 設定と index.css に定義し、全コンポーネントはそれを参照する。

**Tech Stack:** React 19 / Vite / Tailwind CSS 3.4 / vitest + testing-library / Google Fonts（Zen Old Mincho, Klee One, Zen Kaku Gothic New）

## Global Constraints

- 作業ブランチ: `feature/notebook-design`（作成済み・ここで作業する）
- コミットメッセージは日本語（CLAUDE.md）。テストが通った状態でのみコミットする
- push はユーザー確認まで行わない
- ロジック変更禁止: state・handler・API 呼び出し・コンポーネント分割は現状維持
- 文言変更は次の4つだけ。それ以外のラベル・placeholder・aria-label は既存のまま:
  - 「無料ではじめる」→「ノートをひらく」
  - 「つぶやく」→「書きとめる」
  - 「まだ記録がありません」→「まだ何も書かれていません。最初のひとことをどうぞ。」
  - 1年前ラベル「{日付} のあなた」→「1年前のきょう ─ {日付}」
- 手書きフォント（`font-hand`）を使ってよいのは「ユーザーの言葉」（投稿本文・textarea・貼り紙の本文・LPの表紙ラベル/サンプル文）だけ。メール・パスワード等の入力は通常フォント
- 罫線上に載るテキストは `leading-[28px]`（罫線ピッチ 28px と一致させる）
- 小さい文字（12px以下）の補助テキストは `text-pencil-dark`（#736E64）を使う。`text-pencil`（#8A857C）は装飾・大きめ文字のみ
- テスト実行はすべて `frontend/` ディレクトリで `npm test`（= `vitest run`）

---

### Task 1: デザイントークン基盤

**Files:**
- Modify: `frontend/index.html`（フォント読み込み差し替え）
- Modify: `frontend/tailwind.config.js`（色・フォントトークン）
- Modify: `frontend/src/index.css`（罫線ユーティリティ・focus スタイル）

**Interfaces:**
- Produces: Tailwind クラス `bg-desk` `bg-paper` `bg-rule` `bg-margin-red` `bg-scrap` `bg-cover-dark` `bg-ink` / `text-ink` `text-pencil` `text-pencil-dark` `text-ink-red` `text-paper` / `border-rule` `border-scrap-edge` / `font-display` `font-hand` `font-sans` / ユーティリティ `.bg-ruled`。以降の全タスクがこれらを使う
- 注意: 表紙の黒は Tailwind 既存の `bg-cover`（background-size）と衝突するためトークン名は `cover-dark`

- [ ] **Step 1: index.html のフォントを差し替える**

`frontend/index.html` の Noto Sans JP の link 行（9行目）を以下に置き換える:

```html
    <link href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@700;900&family=Klee+One:wght@400;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: tailwind.config.js をトークン定義に置き換える**

`frontend/tailwind.config.js` 全体を以下にする:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        desk: "#4A4E45",
        paper: "#F7F3E8",
        rule: "#BFCBD4",
        "margin-red": "#D66A5E",
        ink: "#3B3A36",
        "ink-red": "#A6453B",
        pencil: "#8A857C",
        "pencil-dark": "#736E64",
        scrap: "#FFFDF6",
        "scrap-edge": "#E0D9C4",
        "cover-dark": "#22252B",
      },
      fontFamily: {
        sans: ["'Zen Kaku Gothic New'", "sans-serif"],
        display: ["'Zen Old Mincho'", "serif"],
        hand: ["'Klee One'", "cursive"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: index.css に罫線ユーティリティと focus スタイルを追加**

`frontend/src/index.css` 全体を以下にする:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Zen Kaku Gothic New', sans-serif;
}

textarea {
  resize: none;
}

@layer base {
  :focus-visible {
    outline: 2px solid #3B3A36;
    outline-offset: 2px;
  }
}

@layer utilities {
  .bg-ruled {
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 27px,
      #BFCBD4 27px,
      #BFCBD4 28px
    );
    background-attachment: local;
  }
}
```

- [ ] **Step 4: テストが引き続き通ることを確認**

Run: `cd frontend && npm test`
Expected: 既存テスト全件 PASS（この時点で見た目はまだ旧デザインのまま）

- [ ] **Step 5: コミット**

```bash
git add frontend/index.html frontend/tailwind.config.js frontend/src/index.css
git commit -m "デザイントークン基盤を追加（大学ノート案の色・フォント・罫線）"
```

---

### Task 2: LP（HeroPage）を表紙＋開いたページ構成に刷新

**Files:**
- Modify: `frontend/src/App.jsx`（`AppMockup` 削除、`PaperSheet`・`NotebookCover` 追加、`HeroPage` 置き換え）
- Test: `frontend/src/test/App.test.jsx`（「無料ではじめる」→「ノートをひらく」）

**Interfaces:**
- Consumes: Task 1 のトークン
- Produces: `PaperSheet({ children })` — 紙面1枚（綴じ影＋赤マージン線つき、幅 max-w-[560px]）。Task 4 の `NotebookPage` が再利用する

- [ ] **Step 1: テストの文言を先に更新して失敗させる**

`frontend/src/test/App.test.jsx` 内の `"無料ではじめる"` を**すべて**（9箇所）`"ノートをひらく"` に置換する。例:

```js
expect(screen.getAllByRole("button", { name: "ノートをひらく" })[0]).toBeInTheDocument();
```

新LPでも「ノートをひらく」ボタンは表紙とページ下部の2箇所にあるため `getAllByRole` のまま変えない。

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd frontend && npm test`
Expected: FAIL（`ノートをひらく` が見つからない）

- [ ] **Step 3: App.jsx の AppMockup を削除し、PaperSheet / NotebookCover / 新 HeroPage を実装**

`AppMockup` 関数（23〜60行）を削除し、`FEATURES` 定義の直後に以下を追加。既存 `HeroPage` は丸ごと置き換える:

```jsx
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `cd frontend && npm test`
Expected: 全件 PASS

- [ ] **Step 5: コミット**

```bash
git add frontend/src/App.jsx frontend/src/test/App.test.jsx
git commit -m "LPをノートの表紙と開いたページの構成に刷新"
```

---

### Task 3: 認証画面（AuthForm）の刷新

**Files:**
- Modify: `frontend/src/App.jsx`（`AuthForm` の JSX のみ）

**Interfaces:**
- Consumes: Task 1 のトークン
- Produces: なし（画面スタイルのみ。placeholder・ボタン名・「← トップに戻る」は既存のまま）

- [ ] **Step 1: AuthForm の return 部を置き換える**

state・handleSubmit は変更せず、`AuthForm` の return を以下に置き換える:

```jsx
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
```

注意: フォーム見出しは `<p>`（ボタンではない）にすること。`getByRole("button", { name: "ログイン" })` が送信ボタンと一意に一致する必要がある。

- [ ] **Step 2: テストが通ることを確認**

Run: `cd frontend && npm test`
Expected: 全件 PASS（文言変更なしのため既存テストがそのまま通る）

- [ ] **Step 3: コミット**

```bash
git add frontend/src/App.jsx
git commit -m "認証画面をノートのラベル風デザインに刷新"
```

---

### Task 4: メイン画面の骨格と今日の欄

**Files:**
- Modify: `frontend/src/App.jsx`（`NotebookPage` 追加、`App` の return・`TodayCard`・`PostForm`・`MoodPicker` 置き換え）
- Test: `frontend/src/test/App.test.jsx`（「つぶやく」→「書きとめる」）

**Interfaces:**
- Consumes: `PaperSheet`（Task 2）、トークン（Task 1）
- Produces: `NotebookPage({ children })` — 机の上の紙面1枚のページラッパー。Task 6 の `UserSettings` が再利用する

- [ ] **Step 1: テストの文言を先に更新して失敗させる**

`frontend/src/test/App.test.jsx` 内の `{ name: "つぶやく" }` を**すべて**（2箇所）`{ name: "書きとめる" }` に置換する。

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd frontend && npm test`
Expected: FAIL（`書きとめる` が見つからない）2件

- [ ] **Step 3: NotebookPage を追加し、MoodPicker / TodayCard / PostForm を置き換える**

`PaperSheet` の直後に追加:

```jsx
function NotebookPage({ children }) {
  return (
    <div className="min-h-screen bg-desk py-6 sm:py-10 px-3 sm:px-6">
      <PaperSheet>{children}</PaperSheet>
    </div>
  );
}
```

`MoodPicker` を置き換え（onChange ロジックは同一）:

```jsx
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
```

`TodayCard` を置き換え:

```jsx
function TodayCard({ post }) {
  return (
    <section className="bg-ruled pl-[72px] sm:pl-[94px] pr-5">
      <p className="text-[11px] text-pencil-dark leading-[28px]">
        {formatDate(post.posted_on)}
        {post.mood_emoji && <>　きぶん <span className="text-sm">{post.mood_emoji}</span></>}
      </p>
      <p className="font-hand text-[15px] text-ink leading-[28px] whitespace-pre-wrap pb-[28px]">{post.content}</p>
    </section>
  );
}
```

`PostForm` の return を置き換え（state・handleSubmit は同一）:

```jsx
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
```

- [ ] **Step 4: App の return（メイン画面）を置き換える**

`App` コンポーネント末尾の return を以下に置き換える（`history` の算出、`if` 分岐は同一。過去一覧・空状態・奥付は Task 5/6 で置き換えるため、この時点では既存 JSX を `<NotebookPage>` の中に移すだけでよい）:

```jsx
  return (
    <NotebookPage>
      <header className="flex items-baseline justify-between pl-[72px] sm:pl-[94px] pr-5 pt-6 pb-3">
        <h1 className="font-display font-bold text-base sm:text-lg text-ink tracking-[0.2em]">one memory</h1>
        <div className="flex items-baseline gap-3 text-[11px] text-pencil-dark">
          {streak > 0 && <span>🔥 {streak}日連続</span>}
          <button onClick={() => setShowSettings(true)} className="hover:text-ink transition-colors">設定</button>
          <button onClick={handleLogout} className="hover:text-ink transition-colors">ログアウト</button>
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
        <section className="mt-10 px-5">
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

      <div className="px-5 pb-8">
        {!loading && posts.length > 0 && <ExportSection />}
        <ReminderForm />
      </div>
    </NotebookPage>
  );
```

- [ ] **Step 5: テストが通ることを確認**

Run: `cd frontend && npm test`
Expected: 全件 PASS

- [ ] **Step 6: コミット**

```bash
git add frontend/src/App.jsx frontend/src/test/App.test.jsx
git commit -m "メイン画面をノートのページ構成に刷新し今日の欄を罫線上に配置"
```

---

### Task 5: 1年前の貼り紙・過去の投稿・空状態

**Files:**
- Modify: `frontend/src/App.jsx`（`OneYearAgoCard`・`HistoryItem`・App 内の過去一覧/空状態 JSX）
- Test: `frontend/src/test/App.test.jsx`（1年前ラベルと空状態の文言）

**Interfaces:**
- Consumes: トークン（Task 1）、`groupByYearMonth`（既存・変更なし）
- Produces: なし

- [ ] **Step 1: テストの文言を先に更新して失敗させる**

`frontend/src/test/App.test.jsx` で以下を置換する:

1. `/のあなた/` を**すべて**（3箇所）`/1年前のきょう/` に置換
2. `"まだ記録がありません"` を `"まだ何も書かれていません。最初のひとことをどうぞ。"` に置換（1箇所）

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd frontend && npm test`
Expected: FAIL（「1年前のきょう」「まだ何も書かれていません」が見つからない）

- [ ] **Step 3: OneYearAgoCard と HistoryItem を置き換える**

```jsx
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
```

```jsx
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
```

- [ ] **Step 4: App 内の過去一覧・空状態を置き換える**

Task 4 Step 4 で仮置きした部分を以下に置き換える:

```jsx
      {history.length > 0 && (
        <section className="bg-ruled mt-2 pb-[28px]">
          {groupByYearMonth(history).map(([month, monthPosts]) => (
            <div key={month}>
              <p className="text-center text-[11px] text-pencil-dark tracking-[0.25em] leading-[28px]">
                <span aria-hidden="true">─　</span>
                <span>{month}</span>
                <span aria-hidden="true">　─</span>
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
```

注意: 月見出しの `{month}` は必ず単独の `<span>` で包むこと。テストが `getByText("2026年5月")`（完全一致）で検索するため、装飾の `─` と同じ要素に入れると落ちる。

- [ ] **Step 5: テストが通ることを確認**

Run: `cd frontend && npm test`
Expected: 全件 PASS

- [ ] **Step 6: コミット**

```bash
git add frontend/src/App.jsx frontend/src/test/App.test.jsx
git commit -m "1年前の投稿を貼り紙演出にし過去一覧を罫線ページに統合"
```

---

### Task 6: 奥付（リマインダー・エクスポート）とアカウント設定画面

**Files:**
- Modify: `frontend/src/App.jsx`（`ReminderForm`・`ExportSection`・`UserSettings` のスタイル、App の奥付ラッパー）

**Interfaces:**
- Consumes: `NotebookPage`（Task 4）、トークン（Task 1）
- Produces: なし（ボタン名・aria-label・placeholder は既存のまま）

- [ ] **Step 1: App の奥付ラッパーを置き換える**

Task 4 Step 4 の `<div className="px-5 pb-8">...</div>` を以下に置き換える:

```jsx
      <footer className="border-t border-scrap-edge mt-4 pl-[72px] sm:pl-[94px] pr-5 py-6">
        {!loading && posts.length > 0 && <ExportSection />}
        <ReminderForm />
      </footer>
```

- [ ] **Step 2: ExportSection のスタイルを置き換える**

ロジックは同一のまま return を置き換える:

```jsx
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
```

- [ ] **Step 3: ReminderForm のスタイルを置き換える**

state・handler・分岐構造は同一のまま、JSX のクラスと見出しを置き換える。共通で使う select のクラス:

```jsx
  const selectClass =
    "flex-1 bg-transparent text-sm text-ink border-0 border-b border-rule focus:border-ink outline-none py-1.5 rounded-none";
```

return 全体:

```jsx
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
```

- [ ] **Step 4: UserSettings を NotebookPage 構成に置き換える**

state・handler は同一のまま、`inputClass` と return を置き換える:

```jsx
  const inputClass =
    "w-full bg-transparent text-sm text-ink placeholder:text-pencil border-0 border-b border-rule focus:border-ink outline-none px-1 py-2 rounded-none";
```

```jsx
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
```

- [ ] **Step 5: テストが通ることを確認**

Run: `cd frontend && npm test`
Expected: 全件 PASS

- [ ] **Step 6: コミット**

```bash
git add frontend/src/App.jsx
git commit -m "奥付とアカウント設定画面をノートのトーンに統一"
```

---

### Task 7: 最終検証（テスト・lint・ビルド・実画面確認）

**Files:**
- 変更なし（検証のみ。問題があれば該当タスクに戻って修正）

- [ ] **Step 1: フロントの全チェックを実行**

Run:
```bash
cd frontend && npm test && npm run lint && npm run build
```
Expected: テスト全件 PASS、lint エラー 0、build 成功

バックエンドは影響を受けないはずだが、区切りとして一応実行する:
```bash
docker compose run --rm backend bundle exec rspec
```
Expected: 全件 PASS

- [ ] **Step 2: 実画面で確認**

```bash
docker compose up -d
```

http://localhost:5174 を開き、以下をスクリーンショットで確認する:

- LP: 表紙 → 開いたページ → 奥付CTA の流れ。モバイル幅（375px）でも崩れない
- ログイン → メイン画面: 罫線と文字のベースラインが揃っている、赤マージン線の左に日付が並ぶ
- 投稿フォーム: 手書きフォントで罫線上に入力できる、「書きとめる」で投稿できる
- 1年前の貼り紙・月見出し・空状態・設定画面・キーボード操作時のフォーカスリング

ズレ（罫線と文字のベースライン等）があれば `leading-[28px]` / padding を調整して該当タスクの内容として修正し、テスト後にコミットする。

- [ ] **Step 3: 検証結果を記録してコミット（修正があった場合のみ）**

```bash
git add -A frontend
git commit -m "実画面確認に基づく罫線と余白の微調整"
```
