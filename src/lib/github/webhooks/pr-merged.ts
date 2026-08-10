export interface PrMergedPayload {
  action: string;
  pull_request: {
    merged: boolean;
    title: string;
    body?: string | null;
    html_url: string;
  };
}

export function handlePrMergedEvent(payload: PrMergedPayload): {
  isMerged: boolean;
  issueNumbers: number[];
  targetStatus: "COMPLETED" | null;
} {
  if (payload.action !== "closed" || !payload.pull_request?.merged) {
    return { isMerged: false, issueNumbers: [], targetStatus: null };
  }

  const text = `${payload.pull_request.title} ${payload.pull_request.body || ""}`;
  const matches = text.match(/(?:fixes|closes|resolves)\s+#(\d+)/gi) || [];
  const issueNumbers = Array.from(
    new Set(matches.map((m) => parseInt(m.replace(/[^\d]/g, ""), 10)))
  );

  return {
    isMerged: true,
    issueNumbers,
    targetStatus: "COMPLETED",
  };
}
