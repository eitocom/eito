import React from "react";

export interface FeatureItem {
  id: string;
  title: string;
  description?: string | null;
  status: "BACKLOG" | "IN_PROGRESS" | "COMPLETED";
  tasksTotal?: number;
  tasksCompleted?: number;
  bountyTotalBrl?: number;
}

export interface FeatureKanbanProps {
  features: FeatureItem[];
  onSelectFeature?: (featureId: string) => void;
  onStatusChange?: (featureId: string, newStatus: "BACKLOG" | "IN_PROGRESS" | "COMPLETED") => void;
}

export const COLUMNS: Array<{ id: "BACKLOG" | "IN_PROGRESS" | "COMPLETED"; title: string }> = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "IN_PROGRESS", title: "Em progresso" },
  { id: "COMPLETED", title: "Concluídas" },
];

export function FeatureKanban({ features, onSelectFeature }: FeatureKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {COLUMNS.map((col) => {
        const colFeatures = features.filter((f) => f.status === col.id);
        return (
          <div key={col.id} className="flex flex-col bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center justify-between">
              <span>{col.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {colFeatures.length}
              </span>
            </h3>
            <div className="flex flex-col gap-3 flex-1">
              {colFeatures.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => onSelectFeature?.(feature.id)}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-sm text-slate-100 mb-1">{feature.title}</h4>
                  {feature.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{feature.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700/40">
                    <span>
                      Tasks: {feature.tasksCompleted || 0}/{feature.tasksTotal || 0}
                    </span>
                    <span className="font-medium text-emerald-400">
                      R$ {(feature.bountyTotalBrl || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
