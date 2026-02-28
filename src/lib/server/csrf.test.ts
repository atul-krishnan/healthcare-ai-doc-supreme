import { describe, expect, it } from "vitest";
import { validateRequestOrigin } from "./csrf";

describe("validateRequestOrigin", () => {
  it("allows same-origin requests", async () => {
    const request = new Request("http://localhost:3000/api/demo", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const response = validateRequestOrigin(request);
    expect(response).toBeNull();
  });

  it("rejects cross-origin requests", async () => {
    const request = new Request("http://localhost:3000/api/demo", {
      method: "POST",
      headers: {
        origin: "https://evil.example.com",
      },
    });

    const response = validateRequestOrigin(request);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
  });
});
