import { describe, expect, it } from "vitest";
import { retrieveClinicalEvidence } from "./clinical-knowledge";

describe("retrieveClinicalEvidence", () => {
  it("returns local evidence when vector provider is unavailable", async () => {
    delete process.env.VECTOR_DB_URL;
    delete process.env.VECTOR_DB_PROVIDER;

    const result = await retrieveClinicalEvidence("chest pain and shortness of breath", 2);

    expect(result.retriever).toBe("local-lexical");
    expect(result.citations.length).toBeGreaterThan(0);
  });
});
