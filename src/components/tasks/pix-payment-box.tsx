import React, { useState } from "react";

export interface PixPaymentBoxProps {
  isOwner: boolean;
  taskStatus: "BACKLOG" | "IN_PROGRESS" | "UNDER_REVIEW" | "COMPLETED" | "CANCELLED";
  assigneeName?: string | null;
  assigneePixKey?: string | null;
}

export function PixPaymentBox({
  isOwner,
  taskStatus,
  assigneeName,
  assigneePixKey,
}: PixPaymentBoxProps) {
  const [copied, setCopied] = useState(false);

  if (!isOwner || taskStatus !== "COMPLETED") {
    return null;
  }

  const handleCopy = () => {
    if (assigneePixKey) {
      navigator.clipboard.writeText(assigneePixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60 my-4">
      <h4 className="text-sm font-semibold text-emerald-300 mb-1">
        Pagar Bounty PIX {assigneeName ? `para ${assigneeName}` : ""}
      </h4>
      {assigneePixKey ? (
        <div className="flex items-center justify-between mt-2 bg-slate-900/80 p-2.5 rounded border border-emerald-900/50">
          <span className="font-mono text-xs text-emerald-200 select-all">{assigneePixKey}</span>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
          >
            {copied ? "Copiado!" : "Copiar Chave"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-amber-400 mt-1">
          O contributor ainda não cadastrou uma chave PIX no perfil.
        </p>
      )}
    </div>
  );
}
