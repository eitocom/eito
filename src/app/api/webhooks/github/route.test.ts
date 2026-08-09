import { POST } from "./route";

describe("GitHub Webhook Signature Verification (#75)", () => {
  it("should return 401 when signature header is missing", async () => {
    process.env.GITHUB_WEBHOOK_SECRET = "testsecret";
    const req = new Request("http://localhost/api/webhooks/github", {
      method: "POST",
      body: JSON.stringify({ action: "opened" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
