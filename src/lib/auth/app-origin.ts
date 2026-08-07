import { headers } from "next/headers";

/**
 * Public app origin for OAuth redirectTo and post-auth redirects.
 * Prefer NEXT_PUBLIC_APP_URL so production always matches Supabase Redirect URLs.
 */
export async function getAppOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return "http://127.0.0.1:3000";
}

/** Resolve browser-facing origin from an incoming request (Vercel-safe). */
export function resolveRequestOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  if (!isLocal && forwardedHost) {
    return `https://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export function resolveSafeNextPath(raw: string | null) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return "/";
}
