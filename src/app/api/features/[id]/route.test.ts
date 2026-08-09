import { GET, PATCH } from "./route";

describe("GET and PATCH /api/features/[id] Endpoints (#70)", () => {
  it("should export GET and PATCH route handlers", () => {
    expect(typeof GET).toBe("function");
    expect(typeof PATCH).toBe("function");
  });
});
