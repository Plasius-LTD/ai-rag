# @plasius/ai-rag

[![npm version](https://img.shields.io/npm/v/@plasius/ai-rag.svg)](https://www.npmjs.com/package/@plasius/ai-rag)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/ai-rag/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/ai-rag/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/ai-rag)](https://codecov.io/gh/Plasius-LTD/ai-rag)
[![License](https://img.shields.io/github/license/Plasius-LTD/ai-rag)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

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

## Release Workflow

Protected `main` releases use a two-step flow:

1. Run `.github/workflows/cd.yml` with `bump=patch|minor|major` to open or refresh a `release/vX.Y.Z` prep PR.
2. Merge that PR to `main`.
3. Rerun `.github/workflows/cd.yml` on `main` with `bump=none` to tag, draft the GitHub release, and publish to npm.

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

Production package publication runs only from `.github/workflows/cd.yml` on
protected `main`. The job verifies that the prepared commit is still the
current main commit and has an exact successful `ci.yml` push result before it
mutates release state. Public package CI runs on GitHub-hosted capacity so it
cannot execute on company-managed runners. npm publication runs on
GitHub-hosted Node.js 24 with pinned npm 11.6.2, uses the protected `production` environment and
short-lived npm OIDC with provenance, and has no long-lived npm write-token
fallback. Rollback disables CD; it never rewrites published package history.
<!-- END PLASIUS RELEASE INTEGRITY -->
