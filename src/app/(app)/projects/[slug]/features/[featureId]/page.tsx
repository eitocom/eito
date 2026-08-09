import React from "react";

export interface FeatureDetailPageProps {
  params: {
    slug: string;
    featureId: string;
  };
}

export default function FeatureDetailPage({ params }: FeatureDetailPageProps) {
  const { slug, featureId } = params;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <a
            href={`/projects/${slug}`}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2 inline-block"
          >
            &larr; Voltar para o projeto
          </a>
          <h1 className="text-2xl font-bold text-slate-100">Detalhe da Feature</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Feature ID: {featureId}</p>
        </div>
      </div>
      <div className="bg-slate-900/60 p-6 rounded-lg border border-slate-800">
        <p className="text-sm text-slate-400">
          Carregando tarefas vinculadas a esta entrega...
        </p>
      </div>
    </div>
  );
}
