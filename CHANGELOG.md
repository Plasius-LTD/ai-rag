# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.3] - 2026-05-20

- **Added**
  - Added retrieval context packing with provenance and trust scoring.
  - Added prompt-injection detection guard and status-driven result codes.
  - Added deterministic provenance and citation extraction for trusted chunks.

- **Changed**
  - Updated RAG feature flag alignment to the shared orchestration gating.

- **Fixed**
  - Release automation now prepares version/changelog updates on a release PR before publishing from protected `main`.
  - (placeholder)

- **Security**
  - Added explicit low-trust and injection paths that escalate to review.
  - Prompt-injection guarding now scans retrieved chunks and excludes unsafe context before packing.

## [0.1.2] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed dependencies to the latest stable published versions.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.1] - 2026-05-13

- Added initial public package scaffold with governance, legal, docs, build, test, and pack-check baselines.


[0.1.2]: https://github.com/Plasius-LTD/ai-rag/releases/tag/v0.1.2
[0.1.1]: https://github.com/Plasius-LTD/ai-rag/releases/tag/v0.1.1
[0.1.3]: https://github.com/Plasius-LTD/ai-rag/releases/tag/v0.1.3
