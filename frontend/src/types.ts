// アプリ全体で共有するドメイン型

export interface Post {
  id: number;
  content: string;
  posted_on: string;
  mood?: number | null;
  mood_emoji?: string | null;
  created_at?: string;
}

export interface Reminder {
  notify_hour: number;
  active: boolean;
}

// リマインダー登録APIのレスポンス（メッセージを含むことがある）
export interface ReminderResult extends Reminder {
  message?: string;
}

export interface StreakResponse {
  streak: number;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export interface User {
  email: string;
}

// ユーザー情報更新に渡すパラメータ
export interface UpdateUserParams {
  current_password: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

// リマインダー更新に渡すパラメータ
export interface UpdateReminderParams {
  active?: boolean;
  notify_hour?: number;
}
