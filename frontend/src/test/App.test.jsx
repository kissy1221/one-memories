import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import * as api from "../api";

vi.mock("../api");

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
  api.fetchOneYearAgo.mockResolvedValue(null);
  api.fetchStreak.mockResolvedValue({ streak: 0 });
  api.registerReminder.mockResolvedValue({ email: "test@example.com" });
});

describe("App", () => {
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

  describe("リマインダー登録", () => {
    it("メールアドレスを入力して登録できる", async () => {
      api.fetchToday.mockResolvedValue(null);
      api.fetchPosts.mockResolvedValue([]);

      render(<App />);

      const input = await screen.findByPlaceholderText("your@email.com");
      await userEvent.type(input, "test@example.com");
      await userEvent.click(screen.getByRole("button", { name: "登録" }));

      await waitFor(() => {
        expect(api.registerReminder).toHaveBeenCalledWith("test@example.com");
        expect(screen.getByText("登録しました。毎晩9時頃にお知らせします。")).toBeInTheDocument();
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
  });
});
