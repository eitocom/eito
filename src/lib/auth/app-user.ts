import type { User as AuthUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import type { User as AppUser } from "@/generated/prisma/client";

export type AppCapability =
  | "browse"
  | "claim_tasks"
  | "submit_contributions"
  | "create_projects";

const BASE_CAPABILITIES: AppCapability[] = ["browse"];

const GITHUB_CAPABILITIES: AppCapability[] = [
  "claim_tasks",
  "submit_contributions",
  "create_projects",
];

export function getGitHubIdentity(authUser: AuthUser) {
  return authUser.identities?.find((identity) => identity.provider === "github");
}

export function hasGitHubConnected(appUser: Pick<AppUser, "githubId">) {
  return Boolean(appUser.githubId);
}

export function getCapabilities(
  appUser: Pick<AppUser, "githubId">,
): AppCapability[] {
  if (!hasGitHubConnected(appUser)) {
    return [...BASE_CAPABILITIES];
  }

  return [...BASE_CAPABILITIES, ...GITHUB_CAPABILITIES];
}

export function can(
  appUser: Pick<AppUser, "githubId">,
  capability: AppCapability,
) {
  return getCapabilities(appUser).includes(capability);
}

function slugifyUsername(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return slug || "user";
}

async function uniqueUsername(base: string, authId: string) {
  const candidate = slugifyUsername(base);
  const existing = await prisma.user.findUnique({
    where: { username: candidate },
  });

  if (!existing || existing.authId === authId) {
    return candidate;
  }

  return `${candidate}-${authId.slice(0, 6)}`;
}

function extractProfile(authUser: AuthUser) {
  const metadata = authUser.user_metadata ?? {};
  const github = getGitHubIdentity(authUser);
  const githubData = (github?.identity_data ?? {}) as Record<string, unknown>;

  const githubId =
    (typeof githubData.provider_id === "string" && githubData.provider_id) ||
    (typeof githubData.sub === "string" && githubData.sub) ||
    null;

  const usernameFromGitHub =
    (typeof githubData.user_name === "string" && githubData.user_name) ||
    (typeof githubData.preferred_username === "string" &&
      githubData.preferred_username) ||
    (typeof metadata.user_name === "string" && metadata.user_name) ||
    null;

  const name =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof githubData.name === "string" && githubData.name) ||
    null;

  const avatarUrl =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
    (typeof githubData.avatar_url === "string" && githubData.avatar_url) ||
    null;

  const emailLocal = authUser.email?.split("@")[0] ?? "user";

  return {
    githubId,
    preferredUsername: usernameFromGitHub ?? emailLocal,
    name,
    avatarUrl,
    email: authUser.email ?? `${authUser.id}@users.eito.local`,
  };
}

export async function ensureAppUser(authUser: AuthUser) {
  const profile = extractProfile(authUser);
  const username = await uniqueUsername(profile.preferredUsername, authUser.id);

  const existing = await prisma.user.findUnique({
    where: { authId: authUser.id },
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        authId: authUser.id,
        email: profile.email,
        username,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        githubId: profile.githubId,
      },
    });
  }

  return prisma.user.update({
    where: { authId: authUser.id },
    data: {
      email: profile.email,
      name: profile.name ?? existing.name,
      avatarUrl: profile.avatarUrl ?? existing.avatarUrl,
      // Keep an already-linked GitHub id unless Auth now provides one.
      githubId: profile.githubId ?? existing.githubId,
      ...(profile.githubId
        ? {
            username: await uniqueUsername(
              profile.preferredUsername,
              authUser.id,
            ),
          }
        : {}),
    },
  });
}

export async function linkGitHubToAppUser(
  authId: string,
  github: {
    githubId: string;
    username: string;
    name?: string;
    avatarUrl?: string;
  },
) {
  const username = await uniqueUsername(github.username, authId);

  return prisma.user.update({
    where: { authId },
    data: {
      githubId: github.githubId,
      username,
      name: github.name,
      avatarUrl: github.avatarUrl,
    },
  });
}

export const CAPABILITY_COPY: Record<
  AppCapability,
  { title: string; description: string; requiresGitHub: boolean }
> = {
  browse: {
    title: "Explorar mutirão",
    description: "Ver projetos e tarefas abertas.",
    requiresGitHub: false,
  },
  claim_tasks: {
    title: "Assumir tarefas",
    description: "Pegar issues com bounty e vincular ao seu GitHub.",
    requiresGitHub: true,
  },
  submit_contributions: {
    title: "Enviar contribuições",
    description: "Registrar PRs para revisão e pagamento via PIX.",
    requiresGitHub: true,
  },
  create_projects: {
    title: "Criar projetos",
    description: "Publicar repositórios e abrir tarefas no mutirão.",
    requiresGitHub: true,
  },
};
