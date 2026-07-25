import { createHash, randomUUID } from "node:crypto";
import { join, resolve } from "node:path";

/** Values that identify one immutable NOVA execution attempt. */
export interface RunIdentityInput {
  projectId: string;
  missionId: string;
  runId?: string;
  createdAt?: string;
}

export interface RunIdentity {
  projectId: string;
  missionId: string;
  runId: string;
  createdAt: string;
  slug: string;
  identityHash: string;
}

export interface RunBindingInputs {
  projectId: string;
  missionId: string;
  runId: string;
  prompt: string;
  executionRequest: unknown;
  manifest: unknown;
  executionRequestBytes?: string;
  manifestBytes?: string;
  branch?: string;
  head?: string;
  codexVersion?: string;
  codexPath?: string;
  codexBinaryHash?: string;
  codexConfigPolicy?: string;
}

export interface RunBinding {
  runId: string;
  projectId: string;
  missionId: string;
  promptHash: string;
  executionRequestHash: string;
  manifestHash: string;
  branch?: string;
  head?: string;
  codexVersion?: string;
  codexPath?: string;
  codexBinaryHash?: string;
  codexConfigPolicy?: string;
}

export interface ReportBinding {
  projectId?: string;
  missionId?: string;
  runId?: string | null;
  promptHash?: string;
  executionRequestHash?: string;
  manifestHash?: string;
  reportFingerprint?: string;
  codexVersion?: string;
  codexPath?: string;
  codexBinaryHash?: string;
  codexConfigPolicy?: string;
}

export interface ReportBindingExpectation {
  projectId: string;
  missionId: string;
  runId: string;
  promptHash: string;
  executionRequestHash: string;
  manifestHash: string;
  codexVersion?: string;
  codexPath?: string;
  codexBinaryHash?: string;
  codexConfigPolicy?: string;
}

/** Canonical JSON prevents object insertion order from changing a hash. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashValue(value: unknown): string {
  return sha256(canonicalJson(value));
}

/** Human-readable slug with a stable identity suffix to avoid safeName collisions. */
export function identitySlug(value: string): string {
  const normalized = value.normalize("NFKC").trim();
  const readable = normalized
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "item";
  return `${readable}-${sha256(normalized).slice(0, 12)}`;
}

export function createRunIdentity(input: RunIdentityInput): RunIdentity {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const runId = input.runId ?? `RUN-${identitySlug(input.projectId)}-${identitySlug(input.missionId)}-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const slug = `${identitySlug(input.projectId)}-${identitySlug(input.missionId)}-${identitySlug(runId)}`;
  return {
    projectId: input.projectId,
    missionId: input.missionId,
    runId,
    createdAt,
    slug,
    identityHash: hashValue({ projectId: input.projectId, missionId: input.missionId, runId }),
  };
}

export function runDirectory(dataRoot: string, runId: string): string {
  if (!runId || runId === "." || runId === ".." || /[\\/]/.test(runId)) {
    throw new Error("runId must be a non-empty path segment");
  }
  return join(resolve(dataRoot), "runs", runId);
}

export function buildRunBinding(input: RunBindingInputs): RunBinding {
  return {
    runId: input.runId,
    projectId: input.projectId,
    missionId: input.missionId,
    promptHash: sha256(input.prompt),
    executionRequestHash: input.executionRequestBytes === undefined
      ? hashValue(input.executionRequest)
      : sha256(input.executionRequestBytes),
    manifestHash: input.manifestBytes === undefined
      ? hashValue(input.manifest)
      : sha256(input.manifestBytes),
    branch: input.branch,
    head: input.head,
    codexVersion: input.codexVersion,
    codexPath: input.codexPath,
    codexBinaryHash: input.codexBinaryHash,
    codexConfigPolicy: input.codexConfigPolicy,
  };
}

export function fingerprintReport(report: unknown): string {
  if (report && typeof report === "object" && !Array.isArray(report) && "ReportFingerprint" in report) {
    return hashValue({ ...(report as Record<string, unknown>), ReportFingerprint: null });
  }
  return hashValue(report);
}

/** Exact binding check; callers must reject a report when any returned field exists but differs. */
export function reportBindingMismatches(
  report: ReportBinding,
  expected: ReportBindingExpectation,
): string[] {
  const mismatches: string[] = [];
  for (const field of [
    "projectId", "missionId", "runId", "promptHash", "executionRequestHash", "manifestHash",
    "codexVersion", "codexPath", "codexBinaryHash", "codexConfigPolicy",
  ] as const) {
    if (expected[field] !== undefined && report[field] !== expected[field]) mismatches.push(field);
  }
  return mismatches;
}

export function isReportBoundToRun(report: ReportBinding, expected: ReportBindingExpectation): boolean {
  return reportBindingMismatches(report, expected).length === 0;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortValue(item)]),
    );
  }
  return value;
}
