import { describe, expect, it } from "vitest";

import {
  AI_RAG_ENV_PREFIX,
  AI_RAG_FEATURE_FLAG_ID,
  AI_RAG_PACKAGE,
  packageDescriptor,
} from "../src/index.js";

describe("@plasius/ai-rag", () => {
  it("exports the package descriptor contract", () => {
    expect(packageDescriptor.packageName).toBe(AI_RAG_PACKAGE);
    expect(packageDescriptor.featureFlagId).toBe(AI_RAG_FEATURE_FLAG_ID);
    expect(packageDescriptor.envPrefix).toBe(AI_RAG_ENV_PREFIX);
    expect(packageDescriptor.summary.length).toBeGreaterThan(0);
  });
});
