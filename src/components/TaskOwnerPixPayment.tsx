import React, { useState } from 'react';

export interface TaskOwnerPixPaymentProps {
  isOwner: boolean;
  taskStatus: 'OPEN' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  assigneePixKey?: string;
  assigneeName?: string;
}

export const TaskOwnerPixPayment: React.FC<TaskOwnerPixPaymentProps> = ({
  isOwner,
  taskStatus,
  assigneePixKey,
  assigneeName = 'Contributor',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOwner || taskStatus !== 'COMPLETED') {
    return null;
  }

  const handleCopy = () => {
    if (assigneePixKey) {
      navigator.clipboard?.writeText(assigneePixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-6 p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800">
      <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
        💳 Pagar bounty a {assigneeName}
      </h4>

      {assigneePixKey ? (
        <div className="flex items-center space-x-2 mt-2">
          <code className="text-xs bg-white dark:bg-gray-900 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-800 font-mono text-gray-800 dark:text-gray-200">
            {assigneePixKey}
          </code>
          <button
            onClick={handleCopy}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded transition"
          >
            {copied ? 'Copiado! ✓' : 'Copiar Chave PIX'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
          ⚠️ O contribuidor ainda não cadastrou uma chave PIX no perfil.
        </p>
      )}
    </div>
  );
};
