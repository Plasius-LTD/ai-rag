# ADR-0002: Retrieval provenance and injection guards as public contracts

- Date: 2026-05-14
- Status: Accepted

## Context

RAG outputs can include low-trust or externally sourced chunks. AI prompts generated from those sources must remain auditable and safe against prompt-injection attempts.

## Decision

`@plasius/ai-rag` now exposes a public context-resolution contract that:

- resolves chunk context only when the unified feature flag is enabled;
- sorts and packs chunk text by trust score and available budget;
- emits provenance records and citations for selected chunks;
- marks low-trust and injection-affected paths as `requires-review`.

## Consequences

- Consumers can reliably evaluate when RAG context is safe for direct LLM insertion.
- Prompt-injection attempts are surfaced as explicit reason codes and review-required status.
- Provenance and citations stay part of every successful context bundle for traceability.
