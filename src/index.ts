export interface AiPackageDescriptor {
  readonly packageName: string;
  readonly featureFlagId: string;
  readonly envPrefix: string;
  readonly summary: string;
}

export const AI_RAG_PACKAGE = "@plasius/ai-rag";
export const AI_RAG_FEATURE_FLAG_ID = "ai.mcp-rag.enabled";
export const AI_RAG_ENV_PREFIX = "AI_RAG";

export const AI_RAG_FEATURE_FLAGS = {
  rag: AI_RAG_FEATURE_FLAG_ID,
  provenance: "ai.rag.provenance.enabled",
  injectionGuard: "ai.rag.injection-guard.enabled",
} as const;

export type AiRagFeatureFlagKey =
  (typeof AI_RAG_FEATURE_FLAGS)[keyof typeof AI_RAG_FEATURE_FLAGS];

export type AiRagFeatureFlagSnapshot = Readonly<
  Record<string, boolean | undefined>
>;

export const AI_RAG_PROVENANCE_SCOPES = [
  "transcript",
  "knowledge-base",
  "world-event",
  "external",
] as const;

export type AiRagProvenanceScope =
  (typeof AI_RAG_PROVENANCE_SCOPES)[number];

export const AI_RAG_RESULT_STATUS = [
  "approved",
  "requires-review",
  "blocked",
] as const;

export type AiRagResultStatus = (typeof AI_RAG_RESULT_STATUS)[number];

export interface AiRagSourceChunk {
  readonly chunkId: string;
  readonly sourceScope: AiRagProvenanceScope;
  readonly sourceId: string;
  readonly text: string;
  readonly trust: number;
  readonly citation?: string;
}

export interface AiRagProvenanceRecord {
  readonly sourceScope: AiRagProvenanceScope;
  readonly sourceId: string;
  readonly trust: number;
  readonly chunkId: string;
  readonly citation?: string;
}

export interface ResolveAiRagInput {
  readonly query: string;
  readonly chunks: readonly AiRagSourceChunk[];
  readonly policyId?: string;
  readonly policyVersion?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly actorId?: string;
  readonly featureFlags?: AiRagFeatureFlagSnapshot;
  readonly maxContextChars?: number;
  readonly reasonCodes?: readonly string[];
}

export interface ResolveAiRagResult {
  readonly packedContext: string;
  readonly citations: readonly string[];
  readonly provenance: readonly AiRagProvenanceRecord[];
  readonly status: AiRagResultStatus;
  readonly injectionDetected: boolean;
  readonly reasonCodes: readonly string[];
  readonly enabledFeatureFlags: readonly AiRagFeatureFlagKey[];
  readonly source: "policy" | "policy-disabled" | "policy-empty";
  readonly audit: {
    readonly policyId: string;
    readonly policyVersion: string;
    readonly correlationId: string;
    readonly requestId?: string;
    readonly actorId?: string;
    readonly evaluatedAtUtc: string;
    readonly status: AiRagResultStatus;
  };
}

function nowIsoString(): string {
  return new Date().toISOString();
}

function normalizeChunks(chunks: readonly AiRagSourceChunk[]): AiRagSourceChunk[] {
  return [...chunks]
    .filter((chunk) => chunk.chunkId.trim().length > 0)
    .map((chunk) => ({
      ...chunk,
      trust: Math.max(0, Math.min(1, Number.isFinite(chunk.trust) ? chunk.trust : 0)),
    }))
    .sort((left, right) => right.trust - left.trust);
}

function hasPromptInjection(text: string): boolean {
  const suspiciousPatterns = [
    /ignore\s+all\s+previous\s+instructions/i,
    /ignore\s+all\s+policies/i,
    /act\s+as\s+.*user/i,
    /inject\s+this\s+command/i,
    /simulate\s+system/i,
    /reveal\s+secrets/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}

function isAiRagEnabled(
  featureFlag: AiRagFeatureFlagKey,
  snapshot: AiRagFeatureFlagSnapshot = {}
): boolean {
  return snapshot[featureFlag] === true;
}

export function resolveAiRagContext(
  input: ResolveAiRagInput
): ResolveAiRagResult {
  const featureEnabled = isAiRagEnabled(AI_RAG_FEATURE_FLAGS.rag, input.featureFlags);
  const provenanceEnabled = isAiRagEnabled(
    AI_RAG_FEATURE_FLAGS.provenance,
    input.featureFlags
  );
  const injectionGuardEnabled = isAiRagEnabled(
    AI_RAG_FEATURE_FLAGS.injectionGuard,
    input.featureFlags
  );
  const featureFlags: AiRagFeatureFlagKey[] = featureEnabled
    ? [AI_RAG_FEATURE_FLAGS.rag]
    : [];

  const reasonCodes = [...(input.reasonCodes ?? [])];
  const maxContextChars = Math.max(1, input.maxContextChars ?? 1200);

  if (!featureEnabled) {
    reasonCodes.push("rag-feature-disabled");

    return {
      packedContext: "",
      citations: [],
      provenance: [],
      status: "blocked",
      injectionDetected: false,
      reasonCodes,
      enabledFeatureFlags: featureFlags,
      source: "policy-disabled",
      audit: {
        policyId: input.policyId ?? "rag-policy-v1",
        policyVersion: input.policyVersion ?? "2026-05-01",
        correlationId: input.correlationId ?? crypto.randomUUID(),
        requestId: input.requestId,
        actorId: input.actorId,
        evaluatedAtUtc: nowIsoString(),
        status: "blocked",
      },
    };
  }

  const normalizedChunks = normalizeChunks(input.chunks);
  const normalizedQuery = input.query.trim();
  const unsafeChunkIds = new Set(
    injectionGuardEnabled
      ? normalizedChunks
          .filter((chunk) => hasPromptInjection(chunk.text))
          .map((chunk) => chunk.chunkId)
      : []
  );
  const injectionDetected =
    injectionGuardEnabled &&
    (hasPromptInjection(normalizedQuery) || unsafeChunkIds.size > 0);

  const selectedChunks: AiRagSourceChunk[] = [];
  const provenance: AiRagProvenanceRecord[] = [];
  let totalChars = "Context:".length;

  for (const chunk of normalizedChunks) {
    if (unsafeChunkIds.has(chunk.chunkId)) {
      continue;
    }

    const snippet = `${chunk.sourceScope}:${chunk.chunkId} ${chunk.text}`;

    if (totalChars + snippet.length > maxContextChars) {
      continue;
    }

    selectedChunks.push(chunk);
    totalChars += snippet.length;
    provenance.push({
      sourceScope: chunk.sourceScope,
      sourceId: chunk.sourceId,
      trust: chunk.trust,
      chunkId: chunk.chunkId,
      citation: chunk.citation,
    });
  }

  if (selectedChunks.length === 0) {
    reasonCodes.push("rag-no-results");
  }

  if (injectionDetected) {
    reasonCodes.push("rag-prompt-injection-guarded");
    reasonCodes.push(
      ...Array.from(unsafeChunkIds, (chunkId) => `rag-prompt-injection-chunk:${chunkId}`)
    );
  }

  const provenanceWarnings = selectedChunks
    .filter((chunk) => chunk.trust < 0.45)
    .map((chunk) => `low-trust-context:${chunk.chunkId}`);
  reasonCodes.push(...provenanceWarnings);

  const packedContext = selectedChunks
    .map((chunk) => `[${chunk.sourceScope}] ${chunk.chunkId}: ${chunk.text}`)
    .join("\n");

  const uniqueCitations = Array.from(
    new Set(
      selectedChunks
        .map((chunk) => chunk.citation)
        .filter((citation): citation is string => Boolean(citation))
    )
  );

  const needsReview =
    injectionDetected ||
    selectedChunks.some((chunk) => chunk.trust < 0.45) ||
    (provenanceEnabled && selectedChunks.some((chunk) => chunk.sourceScope === "external"));

  const status: AiRagResultStatus = needsReview
    ? "requires-review"
    : selectedChunks.length > 0
      ? "approved"
      : "blocked";

  return {
    packedContext,
    citations: uniqueCitations,
    provenance: provenanceEnabled
      ? provenance
      : selectedChunks.length === 0
        ? []
        : provenance.map((entry) => ({
            ...entry,
            trust: 1,
          })),
    status,
    injectionDetected,
    reasonCodes,
    enabledFeatureFlags: featureFlags,
    source: normalizedQuery.length === 0 ? "policy-empty" : "policy",
    audit: {
      policyId: input.policyId ?? "rag-policy-v1",
      policyVersion: input.policyVersion ?? "2026-05-01",
      correlationId: input.correlationId ?? crypto.randomUUID(),
      requestId: input.requestId,
      actorId: input.actorId,
      evaluatedAtUtc: nowIsoString(),
      status,
    },
  };
}

export function isAiRagChunkSafe(chunk: AiRagSourceChunk): boolean {
  return chunk.trust >= 0.45 && chunk.text.trim().length > 0;
}

export const packageDescriptor: AiPackageDescriptor = Object.freeze({
  packageName: AI_RAG_PACKAGE,
  featureFlagId: AI_RAG_FEATURE_FLAG_ID,
  envPrefix: AI_RAG_ENV_PREFIX,
  summary:
    "Retrieval, context packing, provenance, and prompt-injection guard contracts for Plasius AI RAG.",
});
