'use client';

import React, { useState } from 'react';

export interface UserProfileProps {
  user?: {
    name?: string;
    username?: string;
    avatarUrl?: string;
    pixKey?: string;
    isGithubConnected?: boolean;
  };
  onSavePixKey?: (pixKey: string) => Promise<boolean>;
}

export default function ProfilePage({ user, onSavePixKey }: UserProfileProps) {
  const [pixKey, setPixKey] = useState(user?.pixKey || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePixKey) {
      const success = await onSavePixKey(pixKey);
      setStatusMessage(success ? 'Chave PIX salva com sucesso!' : 'Erro ao salvar chave PIX.');
    } else {
      setStatusMessage('Chave PIX salva com sucesso!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mt-10">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={user?.avatarUrl || '/default-avatar.png'}
          alt="Avatar"
          className="w-16 h-16 rounded-full border"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user?.name || 'Desenvolvedor'}</h1>
          <p className="text-sm text-gray-500">@{user?.username || 'usuario'}</p>
        </div>
      </div>

      {!user?.isGithubConnected && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          Atenção: Seu GitHub ainda não está conectado.{' '}
          <a href="/auth/github" className="font-semibold underline">
            Conectar GitHub
          </a>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Chave PIX para recebimento de bounties
          </label>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
        >
          Salvar Chave PIX
        </button>

        {statusMessage && (
          <p className="text-sm font-medium text-emerald-600 mt-2">{statusMessage}</p>
        )}
      </form>
    </div>
  );
}
