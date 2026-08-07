export type LastLoginMethod = "email" | "github" | "google";

export type LastLogin = {
  method: LastLoginMethod;
  email?: string;
  name?: string;
  avatarUrl?: string;
  savedAt: number;
};

const STORAGE_KEY = "eito:lastLogin";

function isLastLoginMethod(value: unknown): value is LastLoginMethod {
  return value === "email" || value === "github" || value === "google";
}

function isLastLogin(value: unknown): value is LastLogin {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    isLastLoginMethod(record.method) &&
    typeof record.savedAt === "number" &&
    (record.email === undefined || typeof record.email === "string") &&
    (record.name === undefined || typeof record.name === "string") &&
    (record.avatarUrl === undefined || typeof record.avatarUrl === "string")
  );
}

export function getLastLogin(): LastLogin | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return isLastLogin(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setLastLogin(login: Omit<LastLogin, "savedAt">): void {
  if (typeof window === "undefined") return;

  const payload: LastLogin = {
    ...login,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearLastLogin(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
