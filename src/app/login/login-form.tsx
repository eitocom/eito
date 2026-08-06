"use client";

import { useActionState, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import {
  signIn,
  signInWithOAuth,
  signUp,
  type AuthState,
  type OAuthProvider,
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3Z"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [oauthPending, startOAuth] = useTransition();
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  const oauthError =
    authError === "oauth" || authError === "auth"
      ? "Não foi possível autenticar com o provedor social. Verifique as credenciais OAuth."
      : null;

  function handleOAuth(provider: OAuthProvider) {
    startOAuth(() => {
      void signInWithOAuth(provider);
    });
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <p className="font-heading text-4xl font-semibold tracking-tight text-[oklch(0.98_0.01_95)] sm:text-5xl">
          Eito
        </p>
        <p className="text-sm leading-relaxed text-[oklch(0.85_0.02_95)]">
          {mode === "login"
            ? "Entre para acompanhar projetos, tarefas e contribuições."
            : "Crie sua conta para começar a contribuir no mutirão."}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={pending || oauthPending}
          onClick={() => handleOAuth("github")}
          className="h-10 w-full border-[oklch(1_0_0/0.14)] bg-[oklch(1_0_0/0.06)] text-[oklch(0.98_0.01_95)] hover:bg-[oklch(1_0_0/0.1)] hover:text-[oklch(0.98_0.01_95)]"
        >
          <GitHubIcon className="size-4" />
          Continuar com GitHub
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={pending || oauthPending}
          onClick={() => handleOAuth("google")}
          className="h-10 w-full border-[oklch(1_0_0/0.14)] bg-[oklch(1_0_0/0.06)] text-[oklch(0.98_0.01_95)] hover:bg-[oklch(1_0_0/0.1)] hover:text-[oklch(0.98_0.01_95)]"
        >
          <GoogleIcon className="size-4" />
          Continuar com Google
        </Button>
      </div>

      <div className="flex items-center gap-3 text-[oklch(0.75_0.02_95)]">
        <div className="h-px flex-1 bg-[oklch(1_0_0/0.12)]" />
        <span className="text-xs tracking-wide uppercase">ou</span>
        <div className="h-px flex-1 bg-[oklch(1_0_0/0.12)]" />
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[oklch(0.9_0.015_95)]">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="h-10 border-[oklch(1_0_0/0.12)] bg-[oklch(1_0_0/0.06)] text-[oklch(0.98_0.01_95)] placeholder:text-[oklch(0.75_0.02_95)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[oklch(0.9_0.015_95)]">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            placeholder="••••••••"
            className="h-10 border-[oklch(1_0_0/0.12)] bg-[oklch(1_0_0/0.06)] text-[oklch(0.98_0.01_95)] placeholder:text-[oklch(0.75_0.02_95)]"
          />
        </div>

        {state.error || oauthError ? (
          <p
            role="alert"
            className="rounded-lg bg-[oklch(0.45_0.14_25/0.25)] px-3 py-2 text-sm text-[oklch(0.92_0.05_40)]"
          >
            {state.error ?? oauthError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending || oauthPending}
          className="h-10 w-full bg-[oklch(0.78_0.12_130)] text-[oklch(0.22_0.03_140)] hover:bg-[oklch(0.84_0.11_130)]"
        >
          {pending || oauthPending
            ? "Aguarde..."
            : mode === "login"
              ? "Entrar"
              : "Criar conta"}
        </Button>
      </form>

      <p className="text-sm text-[oklch(0.8_0.02_95)]">
        {mode === "login" ? (
          <>
            Ainda não tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-[oklch(0.88_0.1_130)] underline-offset-4 hover:underline"
            >
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-medium text-[oklch(0.88_0.1_130)] underline-offset-4 hover:underline"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
