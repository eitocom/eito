import { GET, POST } from "./route";

describe("GET and POST /api/projects/[slug]/features Endpoints (#66)", () => {
  it("should export GET and POST route handlers", () => {
    expect(typeof GET).toBe("function");
    expect(typeof POST).toBe("function");
  });
});
