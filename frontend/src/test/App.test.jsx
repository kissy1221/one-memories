import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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
  posted_on: new Date().toISOString().slice(0, 10),
  created_at: new Date().toISOString(),
};

const PAST_POST = {
  id: 2,
  content: "昨日の記録",
  posted_on: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  created_at: new Date(Date.now() - 86400000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  api.exportPosts.mockResolvedValue(new Blob(["test"], { type: "text/markdown" }));
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
        expect(api.createPost).toHaveBeenCalledWith("今日もいい天気だった");
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
