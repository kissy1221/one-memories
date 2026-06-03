import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import * as api from "../api";

vi.mock("../api");

global.URL.createObjectURL = vi.fn(() => "blob:mock");
global.URL.revokeObjectURL = vi.fn();

const TODAY_POST = {
  id: 1,
  content: "今日もいい天気だった",
  mood: 5,
  mood_emoji: "😊",
  posted_on: new Date().toISOString().slice(0, 10),
  created_at: new Date().toISOString(),
};

const PAST_POST = {
  id: 2,
  content: "昨日の記録",
  posted_on: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  created_at: new Date(Date.now() - 86400000).toISOString(),
};

const ONE_YEAR_AGO_POST = {
  id: 3,
  content: "去年の今日の記録",
  posted_on: new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10),
  created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // ログイン済み状態にする
  localStorage.setItem("token", "mock-token");
  localStorage.setItem("email", "test@example.com");
  api.fetchOneYearAgo.mockResolvedValue(null);
  api.fetchStreak.mockResolvedValue({ streak: 0 });
  api.fetchReminder.mockResolvedValue(null);
  api.registerReminder.mockResolvedValue({ notify_hour: 21, active: true, message: "リマインダーを登録しました" });
  api.updateReminder.mockResolvedValue({ notify_hour: 21, active: false });
  api.exportPosts.mockResolvedValue(new Blob(["test"], { type: "text/markdown" }));
});

afterEach(() => {
  localStorage.clear();
});

describe("App", () => {
  describe("ヒーローページ", () => {
    it("未ログイン時はヒーローページが表示される", () => {
      localStorage.clear();
      render(<App />);
      expect(screen.getAllByRole("button", { name: "無料ではじめる" })[0]).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
    });

    it("ヒーローページに4つの機能紹介カードが表示される", () => {
      localStorage.clear();
      render(<App />);
      expect(screen.getByText("1日1回だけ書く")).toBeInTheDocument();
      expect(screen.getByText("気分をemojiで記録")).toBeInTheDocument();
      expect(screen.getByText("🔥 連続記録で習慣化")).toBeInTheDocument();
      expect(screen.getByText("データは自分のもの")).toBeInTheDocument();
    });

    it("1年前の記憶セクションが表示される", () => {
      localStorage.clear();
      render(<App />);
      expect(screen.getByText(/1年前の今日、あなたは/)).toBeInTheDocument();
    });

    it("はじめるボタンを押すとログインフォームが表示される", async () => {
      localStorage.clear();
      render(<App />);
      await userEvent.click(screen.getAllByRole("button", { name: "無料ではじめる" })[0]);
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    });

    it("ナビのログインボタンを押してもログインフォームが表示される", async () => {
      localStorage.clear();
      render(<App />);
      await userEvent.click(screen.getByRole("button", { name: "ログイン" }));
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    });

    it("認証フォームからトップに戻るとヒーローページが表示される", async () => {
      localStorage.clear();
      render(<App />);
      await userEvent.click(screen.getAllByRole("button", { name: "無料ではじめる" })[0]);
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "← トップに戻る" }));
      expect(screen.getAllByRole("button", { name: "無料ではじめる" })[0]).toBeInTheDocument();
    });
  });

  describe("認証", () => {
    it("未ログイン時はヒーローページからログインフォームに進める", async () => {
      localStorage.clear();
      render(<App />);
      await userEvent.click(screen.getAllByRole("button", { name: "無料ではじめる" })[0]);
      expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
    });

    it("新規登録に切り替えられる", async () => {
      localStorage.clear();
      render(<App />);
      await userEvent.click(screen.getAllByRole("button", { name: "無料ではじめる" })[0]);
      await userEvent.click(screen.getByRole("button", { name: "新規登録" }));
      expect(screen.getByRole("button", { name: "登録する" })).toBeInTheDocument();
    });

    it("ログイン成功でメイン画面に遷移する", async () => {
      localStorage.clear();
      api.login.mockResolvedValue({ token: "tok", email: "test@example.com" });
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);

      render(<App />);
      await userEvent.click(screen.getAllByRole("button", { name: "無料ではじめる" })[0]);
      await userEvent.type(screen.getByPlaceholderText("メールアドレス"), "test@example.com");
      await userEvent.type(screen.getByPlaceholderText("パスワード"), "password123");
      await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("今日のひとこと...")).toBeInTheDocument();
      });
    });

    it("ログイン失敗でエラーメッセージが表示される", async () => {
      localStorage.clear();
      api.login.mockRejectedValue(new Error("メールアドレスまたはパスワードが正しくありません"));

      render(<App />);
      await userEvent.click(screen.getAllByRole("button", { name: "無料ではじめる" })[0]);
      await userEvent.type(screen.getByPlaceholderText("メールアドレス"), "wrong@example.com");
      await userEvent.type(screen.getByPlaceholderText("パスワード"), "wrongpass");
      await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

      await waitFor(() => {
        expect(screen.getByText("メールアドレスまたはパスワードが正しくありません")).toBeInTheDocument();
      });
    });

    it("ログアウトするとヒーローページに戻る", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);

      render(<App />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText("今日のひとこと...")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: "ログアウト" }));
      expect(screen.getAllByRole("button", { name: "無料ではじめる" })[0]).toBeInTheDocument();
    });
  });

  describe("今日の投稿がある場合", () => {
    it("投稿内容が表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("今日もいい天気だった")).toBeInTheDocument();
      });
    });

    it("入力フォームは表示されない", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST]);

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText("今日のひとこと...")).not.toBeInTheDocument();
      });
    });
  });

  describe("今日の投稿がない場合", () => {
    it("投稿フォームが表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("今日のひとこと...")).toBeInTheDocument();
      });
    });

    it("投稿を送信すると今日のカードが表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.createPost.mockResolvedValue(TODAY_POST);

      render(<App />);

      const textarea = await screen.findByPlaceholderText("今日のひとこと...");
      await userEvent.type(textarea, "今日もいい天気だった");

      const button = screen.getByRole("button", { name: "つぶやく" });
      await userEvent.click(button);

      await waitFor(() => {
        expect(api.createPost).toHaveBeenCalledWith("今日もいい天気だった", null);
      });

      await waitFor(() => {
        expect(screen.getByText("今日もいい天気だった")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("今日のひとこと...")).not.toBeInTheDocument();
      });
    });

    it("API エラー時にエラーメッセージが表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.createPost.mockRejectedValue(new Error("今日はすでに投稿済みです"));

      render(<App />);

      const textarea = await screen.findByPlaceholderText("今日のひとこと...");
      await userEvent.type(textarea, "テスト");

      const button = screen.getByRole("button", { name: "つぶやく" });
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("今日はすでに投稿済みです")).toBeInTheDocument();
      });
    });
  });

  describe("streak表示", () => {
    it("streak が1以上のとき連続日数が表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST]);
      api.fetchStreak.mockResolvedValue({ streak: 5 });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("🔥 5日連続")).toBeInTheDocument();
      });
    });

    it("streak が0のとき連続日数は表示されない", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.fetchStreak.mockResolvedValue({ streak: 0 });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/日連続/)).not.toBeInTheDocument();
      });
    });

    it("fetchStreak が失敗しても今日の投稿と履歴は表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST, PAST_POST]);
      api.fetchStreak.mockRejectedValue(new Error("network error"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("今日もいい天気だった")).toBeInTheDocument();
        expect(screen.getByText("昨日の記録")).toBeInTheDocument();
        expect(screen.queryByText(/日連続/)).not.toBeInTheDocument();
      });
    });
  });

  describe("mood表示", () => {
    it("今日の投稿にmood_emojiが表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("😊")).toBeInTheDocument();
      });
    });
  });

  describe("1年前の今日", () => {
    it("1年前の投稿がある場合にセクションが表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST]);
      api.fetchOneYearAgo.mockResolvedValue(ONE_YEAR_AGO_POST);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("去年の今日の記録")).toBeInTheDocument();
        expect(screen.getByText(/のあなた/)).toBeInTheDocument();
      });
    });

    it("1年前の投稿がない場合はセクションが表示されない", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.fetchOneYearAgo.mockResolvedValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/のあなた/)).not.toBeInTheDocument();
      });
    });

    it("fetchOneYearAgoが失敗しても今日の投稿と履歴は表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST, PAST_POST]);
      api.fetchOneYearAgo.mockRejectedValue(new Error("network error"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("今日もいい天気だった")).toBeInTheDocument();
        expect(screen.getByText("昨日の記録")).toBeInTheDocument();
        expect(screen.queryByText(/のあなた/)).not.toBeInTheDocument();
      });
    });
  });

  describe("リマインダー", () => {
    it("未設定時は登録フォームが表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.fetchReminder.mockResolvedValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
      });
    });

    it("登録するとnotify_hourが渡され成功メッセージが表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.fetchReminder.mockResolvedValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: "登録" }));

      await waitFor(() => {
        expect(api.registerReminder).toHaveBeenCalledWith(21);
        expect(screen.getByText(/にリマインダーを登録しました/)).toBeInTheDocument();
      });
    });

    it("設定済みの場合は通知時刻とトグルが表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.fetchReminder.mockResolvedValue({ notify_hour: 20, active: true });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("20:00 に通知")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "リマインダーをOFFにする" })).toBeInTheDocument();
      });
    });

    it("トグルをクリックするとON/OFFが切り替わる", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);
      api.fetchReminder.mockResolvedValue({ notify_hour: 21, active: true });

      render(<App />);

      const toggle = await screen.findByRole("button", { name: "リマインダーをOFFにする" });
      await userEvent.click(toggle);

      await waitFor(() => {
        expect(api.updateReminder).toHaveBeenCalledWith({ active: false });
      });
    });
  });

  describe("過去の投稿一覧", () => {
    it("今日以外の投稿がPastセクションに表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST, PAST_POST]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("昨日の記録")).toBeInTheDocument();
      });
    });

    it("投稿が一件もない場合はまだ記録がありませんと表示される", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("まだ記録がありません")).toBeInTheDocument();
      });
    });

    it("過去投稿が年月ごとにグループ化されて表示される", async () => {
      const postA = {
        id: 10,
        content: "先月の投稿",
        posted_on: "2026-05-15",
        created_at: "2026-05-15T00:00:00Z",
      };
      const postB = {
        id: 11,
        content: "先々月の投稿",
        posted_on: "2026-04-10",
        created_at: "2026-04-10T00:00:00Z",
      };

      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([postA, postB]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("先月の投稿")).toBeInTheDocument();
        expect(screen.getByText("先々月の投稿")).toBeInTheDocument();
        expect(screen.getByText("2026年5月")).toBeInTheDocument();
        expect(screen.getByText("2026年4月")).toBeInTheDocument();
      });
    });

    it("同じ月の投稿は同じグループにまとまる", async () => {
      const postA = {
        id: 20,
        content: "今月最初の投稿",
        posted_on: "2026-05-01",
        created_at: "2026-05-01T00:00:00Z",
      };
      const postB = {
        id: 21,
        content: "今月2番目の投稿",
        posted_on: "2026-05-10",
        created_at: "2026-05-10T00:00:00Z",
      };

      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([postA, postB]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText("2026年5月")).toHaveLength(1);
        expect(screen.getByText("今月最初の投稿")).toBeInTheDocument();
        expect(screen.getByText("今月2番目の投稿")).toBeInTheDocument();
      });
    });
  });

  describe("エクスポート", () => {
    it("投稿がある場合にExportセクションが表示される", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST, PAST_POST]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Markdown" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "CSV" })).toBeInTheDocument();
      });
    });

    it("MarkdownボタンクリックでexportPostsが呼ばれる", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST, PAST_POST]);

      render(<App />);

      const mdButton = await screen.findByRole("button", { name: "Markdown" });
      await userEvent.click(mdButton);

      await waitFor(() => {
        expect(api.exportPosts).toHaveBeenCalledWith("markdown");
      });
    });

    it("CSVボタンクリックでexportPostsが呼ばれる", async () => {
      api.fetchToday.mockResolvedValue(TODAY_POST);
      api.fetchPosts.mockResolvedValue([TODAY_POST, PAST_POST]);

      render(<App />);

      const csvButton = await screen.findByRole("button", { name: "CSV" });
      await userEvent.click(csvButton);

      await waitFor(() => {
        expect(api.exportPosts).toHaveBeenCalledWith("csv");
      });
    });
  });
});
