import { createHash } from "node:crypto";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { existsSync, statSync } from "node:fs";

export const SCOPE_SCHEMA_VERSION = 1 as const;
export const MAX_SCOPE_ENTRIES = 256;
export const MAX_SCOPE_ENTRY_LENGTH = 512;

export interface ScopeValidationPayload {
  version: typeof SCOPE_SCHEMA_VERSION;
  allowed: string[];
  forbidden: string[];
}

export interface ScopeValidationResult {
  payload: ScopeValidationPayload;
  overlaps: Array<{ allowed: string; forbidden: string }>;
}

/** Normalises Windows/POSIX separators and rejects paths escaping the repository. */
export function normalizeScopeEntry(value: string, repositoryRoot?: string): string {
  let entry = canonicalizeScopePath(value, { allowAbsolute: false, allowParentSegments: false });
  if (!entry) throw new Error("Scope entry must not be empty.");
  if (repositoryRoot && !entry.includes("*") && !entry.includes("?") && existsSync(resolve(repositoryRoot, entry))) {
    if (statSync(resolve(repositoryRoot, entry)).isDirectory()) entry = `${entry.replace(/\/$/, "")}/**`;
  }
  return entry;
}

export function normalizeScopeEntries(entries: readonly string[], repositoryRoot?: string): string[] {
  if (!Array.isArray(entries) || entries.length > MAX_SCOPE_ENTRIES) throw new Error("Invalid scope entry count.");
  return [...new Set(entries.map((entry) => normalizeScopeEntry(entry, repositoryRoot)))];
}

/** Returns true only when candidate is inside root, respecting path boundaries. */
export function isCanonicalPathWithin(root: string, candidate: string): boolean {
  const rootPath = resolve(root);
  const candidatePath = resolve(candidate);
  const rel = relative(rootPath, candidatePath);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

export function assertScopeContainment(repositoryRoot: string, scope: string): string {
  const normalized = normalizeScopeEntry(scope);
  const base = normalized.split(/[?*]/, 1)[0].replace(/\/$/, "") || ".";
  if (!isCanonicalPathWithin(repositoryRoot, resolve(repositoryRoot, base))) {
    throw new Error(`Scope is outside repository: ${scope}`);
  }
  return normalized;
}

function scopeBase(scope: string): string {
  return scope.replaceAll("\\", "/").replace(/\/\*\*?$/, "").replace(/[?*].*$/, "").replace(/\/$/, "");
}

/** Segment-aware overlap detection; avoids false positives (foo vs foobar). */
export function scopesOverlap(left: string, right: string): boolean {
  const a = scopeBase(canonicalizeScopePath(left, { allowAbsolute: true, allowParentSegments: true })).split("/").filter(Boolean);
  const b = scopeBase(canonicalizeScopePath(right, { allowAbsolute: true, allowParentSegments: true })).split("/").filter(Boolean);
  const prefix = (short: string[], long: string[]) => short.every((part, i) => part === long[i]);
  return prefix(a, b) || prefix(b, a);
}

function canonicalizeScopePath(
  value: string,
  options: { allowAbsolute: boolean; allowParentSegments: boolean },
): string {
  if (typeof value !== "string") throw new Error("Scope entry must be a string.");
  let entry = value.trim().replaceAll("\\", "/").replace(/\/+/g, "/");
  if (!entry) throw new Error("Scope entry must not be empty.");
  const absolute = isAbsolute(entry) || /^[A-Za-z]:\//.test(entry);
  if (absolute && !options.allowAbsolute) throw new Error(`Absolute scope is not allowed: ${value}`);
  entry = entry.replace(/^\.\//, "");
  const prefix = /^[A-Za-z]:\//.exec(entry)?.[0] ?? (entry.startsWith("/") ? "/" : "");
  const stack: string[] = [];
  for (const part of entry.slice(prefix.length).split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!options.allowParentSegments) throw new Error(`Scope escapes repository: ${value}`);
      if (stack.length === 0) throw new Error(`Scope escapes root: ${value}`);
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  const rebuilt = `${prefix}${stack.join("/")}`.replace(/\/+$/, "");
  return process.platform === "win32" ? rebuilt.toLowerCase() : rebuilt;
}

export function validateScopePayload(input: unknown, repositoryRoot?: string): ScopeValidationResult {
  if (!input || typeof input !== "object") throw new Error("Scope payload must be an object.");
  const value = input as Partial<ScopeValidationPayload>;
  if (value.version !== SCOPE_SCHEMA_VERSION) throw new Error(`Unsupported scope schema version: ${String(value.version)}`);
  if (!Array.isArray(value.allowed) || !Array.isArray(value.forbidden)) throw new Error("Scope allowed/forbidden arrays are required.");
  for (const entry of [...value.allowed, ...value.forbidden]) {
    if (typeof entry !== "string" || entry.length > MAX_SCOPE_ENTRY_LENGTH) throw new Error("Invalid scope entry.");
  }
  const allowed = normalizeScopeEntries(value.allowed, repositoryRoot);
  const forbidden = normalizeScopeEntries(value.forbidden, repositoryRoot);
  const overlaps = allowed.flatMap((a) => forbidden.filter((f) => scopesOverlap(a, f)).map((f) => ({ allowed: a, forbidden: f })));
  if (overlaps.length) throw new Error(`Allowed and forbidden scopes overlap: ${overlaps.map((item) => `${item.allowed} / ${item.forbidden}`).join(", ")}`);
  return { payload: { version: SCOPE_SCHEMA_VERSION, allowed, forbidden }, overlaps };
}

export function stableIdentitySlug(label: string, identity: string): string {
  const readable = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "item";
  const hash = createHash("sha256").update(identity, "utf8").digest("hex").slice(0, 12);
  return `${readable}-${hash}`;
}
