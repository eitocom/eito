export type LastLoginMethod = "email" | "github" | "google";

export type LastLogin = {
  method: LastLoginMethod;
  email?: string;
  name?: string;
  avatarUrl?: string;
  savedAt: number;
};

const STORAGE_KEY = "eito:lastLogin";

const listeners = new Set<() => void>();

/** Cached snapshot for useSyncExternalStore — must be referentially stable. */
let cachedRaw: string | null | undefined;
let cachedSnapshot: LastLogin | null = null;

function emitLastLoginChange() {
  listeners.forEach((listener) => listener());
}

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

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseLastLogin(raw: string | null): LastLogin | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isLastLogin(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function syncCacheFromStorage() {
  const raw = readRaw();
  if (raw === cachedRaw) return;

  cachedRaw = raw;
  cachedSnapshot = parseLastLogin(raw);
}

export function getLastLogin(): LastLogin | null {
  if (typeof window === "undefined") return null;

  syncCacheFromStorage();
  return cachedSnapshot;
}

export function setLastLogin(login: Omit<LastLogin, "savedAt">): void {
  if (typeof window === "undefined") return;

  const payload: LastLogin = {
    ...login,
    savedAt: Date.now(),
  };

  const raw = JSON.stringify(payload);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = payload;
  emitLastLoginChange();
}

export function clearLastLogin(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSnapshot = null;
  emitLastLoginChange();
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;

  cachedRaw = undefined;
  syncCacheFromStorage();
  emitLastLoginChange();
}

export function subscribeLastLogin(onStoreChange: () => void) {
  const shouldAttach = listeners.size === 0;
  listeners.add(onStoreChange);

  if (shouldAttach && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}
