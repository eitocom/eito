"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import "@stoplight/elements/styles.min.css";

type StoplightAPIProps = {
  apiDescriptionUrl: string;
  router?: "hash" | "history" | "memory" | "static";
  layout?: "sidebar" | "stacked";
};

const API = dynamic(
  async () => {
    // @stoplight/elements exports omit typings in package.json; cast the runtime export.
    const mod = (await import(
      // @ts-expect-error -- package.json "exports" does not expose types
      "@stoplight/elements"
    )) as { API: ComponentType<StoplightAPIProps> };

    return mod.API;
  },
  {
    ssr: false,
    loading: () => (
      <p className="text-muted-foreground p-8 text-sm">
        Carregando documentação da API…
      </p>
    ),
  },
);

export default function ApiDocsPage() {
  return (
    <main className="bg-background min-h-screen">
      <div className="border-border border-b px-6 py-4">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Eito API
        </h1>
        <p className="text-muted-foreground text-sm">
          Documentação interativa gerada a partir dos schemas Zod.
        </p>
      </div>
      <div className="h-[calc(100vh-5.5rem)]">
        <API apiDescriptionUrl="/api/openapi" router="hash" layout="sidebar" />
      </div>
    </main>
  );
}
