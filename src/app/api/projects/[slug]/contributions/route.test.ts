import { GET } from "./route";

describe("GET /api/projects/[slug]/contributions Endpoint (#64)", () => {
  it("should return project contributions payload with 200 status", async () => {
    const req = new Request("http://localhost:3000/api/projects/demo-project/contributions");
    const params = { slug: "demo-project" };

    const res = await GET(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.projectSlug).toBe("demo-project");
    expect(Array.isArray(data.contributions)).toBe(true);
  });
});
