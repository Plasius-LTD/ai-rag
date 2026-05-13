# @plasius/ai-rag

Retrieval, context packing, provenance, and prompt-injection guard contracts for Plasius AI RAG.

## Scope

This package is part of the layered `@plasius/ai-*` package family. It defines the external contracts for retrieval provenance, context packing, trust-aware truncation, and prompt-injection guard behavior.

## Install

```bash
npm install @plasius/ai-rag
```

## Contracts

- `AI_RAG_FEATURE_FLAGS` declares the feature flags for RAG, provenance, and injection guard behavior.
- `resolveAiRagContext` builds deterministic packed contexts from scored chunks and emits trust/provenance reason codes.
- `isAiRagChunkSafe` provides a simple trust utility for non-blocking callers.
- `packageDescriptor` exposes package name, primary flag, env prefix, and summary.

## Usage

```ts
import {
  AI_RAG_FEATURE_FLAGS,
  resolveAiRagContext,
} from "@plasius/ai-rag";

const result = resolveAiRagContext({
  query: "What happened in the last hour?",
  chunks: [
    {
      chunkId: "chunk-1",
      sourceScope: "knowledge-base",
      sourceId: "kb-2026",
      text: "A major weather event was recorded near the delta.",
      trust: 0.93,
      citation: "https://knowledge-base/docs/delta",
    },
  ],
  featureFlags: {
    [AI_RAG_FEATURE_FLAGS.rag]: true,
    [AI_RAG_FEATURE_FLAGS.provenance]: true,
    [AI_RAG_FEATURE_FLAGS.injectionGuard]: true,
  },
  maxContextChars: 1200,
});

console.log(result.packedContext);
console.log(result.status);
```

## Development

```bash
npm install
npm run build
npm test
npm run test:coverage
npm run pack:check
```

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
