export interface PrOpenedPayload {
  action: "opened" | "edited" | "reopened" | string;
  pull_request: {
    title: string;
    body?: string | null;
    html_url: string;
    user: {
      id: number;
      login: string;
    };
  };
}

export function handlePrOpenedEvent(payload: PrOpenedPayload): {
  isRelevant: boolean;
  issueNumbers: number[];
  targetStatus: "UNDER_REVIEW" | null;
} {
  const allowedActions = ["opened", "edited", "reopened"];
  if (!allowedActions.includes(payload.action)) {
    return { isRelevant: false, issueNumbers: [], targetStatus: null };
  }

  const text = `${payload.pull_request.title} ${payload.pull_request.body || ""}`;
  const matches = text.match(/(?:fixes|closes|resolves)\s+#(\d+)/gi) || [];
  const issueNumbers = Array.from(
    new Set(matches.map((m) => parseInt(m.replace(/[^\d]/g, ""), 10)))
  );

  return {
    isRelevant: issueNumbers.length > 0,
    issueNumbers,
    targetStatus: "UNDER_REVIEW",
  };
}
