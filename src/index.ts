export interface AiPackageDescriptor {
  readonly packageName: string;
  readonly featureFlagId: string;
  readonly envPrefix: string;
  readonly summary: string;
}

export const AI_RAG_PACKAGE = "@plasius/ai-rag";
export const AI_RAG_FEATURE_FLAG_ID = "ai.rag.enabled";
export const AI_RAG_ENV_PREFIX = "AI_RAG";

export const packageDescriptor: AiPackageDescriptor = Object.freeze({
  packageName: AI_RAG_PACKAGE,
  featureFlagId: AI_RAG_FEATURE_FLAG_ID,
  envPrefix: AI_RAG_ENV_PREFIX,
  summary: "Retrieval, context packing, provenance, and prompt-injection guard contracts for Plasius AI RAG.",
});
