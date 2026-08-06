import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[oklch(0.22_0.035_145)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,oklch(0.35_0.06_140/0.55),transparent_55%),radial-gradient(ellipse_at_85%_75%,oklch(0.4_0.08_90/0.35),transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 [background-image:linear-gradient(oklch(1_0_0/0.08)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.08)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.12]"
      />

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
