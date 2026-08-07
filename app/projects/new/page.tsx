'use client';

import React, { useState } from 'react';

export interface NewProjectProps {
  isGithubConnected?: boolean;
  onSubmitProject?: (data: { title: string; description: string; repoUrl: string }) => Promise<boolean>;
}

export default function NewProjectPage({ isGithubConnected = true, onSubmitProject }: NewProjectProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGithubConnected) {
      setStatusMessage('Você precisa ter o GitHub conectado para criar um projeto.');
      return;
    }

    if (!title || !description || !repoUrl) {
      setStatusMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmitProject) {
        await onSubmitProject({ title, description, repoUrl });
      }
      setStatusMessage('Projeto cadastrado com sucesso!');
    } catch {
      setStatusMessage('Erro ao cadastrar projeto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Cadastrar Novo Projeto</h1>

      {!isGithubConnected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          Atenção: É necessário conectar sua conta do GitHub para cadastrar um projeto.{' '}
          <a href="/auth/github" className="font-semibold underline">
            Conectar GitHub
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Título do Projeto *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Eito Bounty Platform"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Descrição *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o propósito e objetivos do projeto"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-28"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            URL do Repositório GitHub *
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/usuario/repositorio"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !isGithubConnected}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50"
        >
          {isLoading ? 'Cadastrando...' : 'Cadastrar Projeto'}
        </button>

        {statusMessage && (
          <p className="text-sm font-medium text-emerald-600 mt-2">{statusMessage}</p>
        )}
      </form>
    </div>
  );
}
