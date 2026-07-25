import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  RuntimeCertificationBinding,
  RuntimeCertificationDecision,
  RuntimeMissionCertificate,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import { canonicalJson, sha256 } from "./run-binding.js";

export type CertificationDecision = RuntimeCertificationDecision;
export type MissionCertificate = RuntimeMissionCertificate;
export type CertificationBinding = RuntimeCertificationBinding;

export interface CertificationAuthority {
  authorityId: string;
  authenticatedSubjectId: string;
  authorityType: string;
  keyId: string;
  bearerToken: string;
  signingKey: string;
  enabled: boolean;
  roles: readonly string[];
}

export interface AuthenticatedCertificationAuthority {
  authorityId: string;
  authenticatedSubjectId: string;
  authorityType: string;
  keyId: string;
  signingKey: string;
  enabled: boolean;
  roles: readonly string[];
}

export interface CertificationAuthorizationPolicy {
  allowedAuthorityTypes: readonly string[];
  requiredRole: string;
}

export interface AuthorizedCertificationAuthority extends AuthenticatedCertificationAuthority {
  authorizedToCertify: true;
}

export function authenticateCertificationAuthority(
  authorizationHeader: string | undefined,
  authorities: readonly CertificationAuthority[],
): AuthenticatedCertificationAuthority {
  const match = /^Bearer (.+)$/i.exec(authorizationHeader ?? "");
  if (!match) throw new Error("NOVA_CERTIFICATION_UNAUTHENTICATED");
  const suppliedToken = match[1] ?? "";
  const authority = authorities.find((candidate) => safeSecretEqual(candidate.bearerToken, suppliedToken));
  if (!authority) throw new Error("NOVA_CERTIFICATION_UNAUTHENTICATED");
  validateAuthority(authority);
  return {
    authorityId: authority.authorityId,
    authenticatedSubjectId: authority.authenticatedSubjectId,
    authorityType: authority.authorityType,
    keyId: authority.keyId,
    signingKey: authority.signingKey,
    enabled: authority.enabled,
    roles: [...authority.roles],
  };
}

export function authorizeCertificationAuthority(
  principal: AuthenticatedCertificationAuthority,
  policy: CertificationAuthorizationPolicy,
): AuthorizedCertificationAuthority {
  if (!principal.enabled) throw new Error("NOVA_CERTIFICATION_AUTHORITY_DISABLED");
  if (principal.authenticatedSubjectId !== principal.authorityId) {
    throw new Error("NOVA_CERTIFICATION_AUTHORITY_IDENTITY_MISMATCH");
  }
  if (!policy.allowedAuthorityTypes.includes(principal.authorityType)) {
    throw new Error("NOVA_CERTIFICATION_AUTHORITY_TYPE_FORBIDDEN");
  }
  if (!principal.roles.includes(policy.requiredRole)) {
    throw new Error("NOVA_CERTIFICATION_AUTHORITY_ROLE_FORBIDDEN");
  }
  return { ...principal, authorizedToCertify: true };
}

export function createCertificationAttestation(
  signingKey: string,
  facts: {
    projectId: string;
    authorityId: string;
    missionId: string;
    runId: string;
    reportFingerprint: string;
  },
): string {
  if (!signingKey) throw new Error("NOVA_CERTIFICATION_SIGNING_KEY_MISSING");
  return createHmac("sha256", signingKey).update(canonicalJson(facts)).digest("hex");
}

export function verifyCertificationAttestation(
  attestation: string,
  signingKey: string,
  facts: {
    projectId: string;
    authorityId: string;
    missionId: string;
    runId: string;
    reportFingerprint: string;
  },
): boolean {
  if (!/^[0-9a-f]{64}$/i.test(attestation)) return false;
  return safeHexEqual(attestation, createCertificationAttestation(signingKey, facts));
}

export function issueMissionCertificate(
  decision: RuntimeCertificationDecision,
  binding: RuntimeCertificationBinding,
  signingKey: string,
): RuntimeMissionCertificate {
  validateDecision(decision);
  validateBinding(binding);
  if (decision.missionId !== binding.missionId || decision.runId !== binding.runId) {
    throw new Error("NOVA_CERTIFICATION_RUN_BINDING_MISMATCH");
  }
  if (decision.reportFingerprint !== binding.reportFingerprint) {
    throw new Error("NOVA_CERTIFICATION_FINGERPRINT_MISMATCH");
  }
  if (!signingKey) throw new Error("NOVA_CERTIFICATION_SIGNING_KEY_MISSING");

  const unsigned = {
    schemaVersion: "1.0.0" as const,
    certificateId: `CERT-${binding.missionId}-${binding.runId}-${binding.reportFingerprint.slice(0, 12)}`,
    algorithm: "HMAC-SHA256" as const,
    binding,
    decision,
  };
  const certificateFingerprint = sha256(canonicalJson(unsigned));
  const signature = createHmac("sha256", signingKey).update(certificateFingerprint).digest("hex");
  return { ...unsigned, certificateFingerprint, signature };
}

export function verifyMissionCertificate(
  certificate: RuntimeMissionCertificate,
  signingKey: string,
  expectedBinding?: RuntimeCertificationBinding,
): boolean {
  try {
    validateDecision(certificate.decision);
    validateBinding(certificate.binding);
    if (certificate.schemaVersion !== "1.0.0" || certificate.algorithm !== "HMAC-SHA256") return false;
    if (certificate.decision.missionId !== certificate.binding.missionId) return false;
    if (certificate.decision.runId !== certificate.binding.runId) return false;
    if (certificate.decision.reportFingerprint !== certificate.binding.reportFingerprint) return false;
    if (expectedBinding && canonicalJson(expectedBinding) !== canonicalJson(certificate.binding)) return false;

    const unsigned = {
      schemaVersion: certificate.schemaVersion,
      certificateId: certificate.certificateId,
      algorithm: certificate.algorithm,
      binding: certificate.binding,
      decision: certificate.decision,
    };
    const fingerprint = sha256(canonicalJson(unsigned));
    if (!safeHexEqual(fingerprint, certificate.certificateFingerprint)) return false;
    const expectedSignature = createHmac("sha256", signingKey).update(fingerprint).digest("hex");
    return safeHexEqual(expectedSignature, certificate.signature);
  } catch {
    return false;
  }
}

function validateAuthority(authority: CertificationAuthority): void {
  if (
    !authority.authorityId ||
    !authority.authenticatedSubjectId ||
    !authority.authorityType ||
    !authority.keyId ||
    !Array.isArray(authority.roles)
  ) {
    throw new Error("NOVA_CERTIFICATION_AUTHORITY_MISSING");
  }
  if (authority.bearerToken.length < 16 || authority.signingKey.length < 16) {
    throw new Error("NOVA_CERTIFICATION_AUTHORITY_SECRET_TOO_SHORT");
  }
}

function validateDecision(decision: RuntimeCertificationDecision): void {
  if (
    !decision.authorityId ||
    !decision.authorityType ||
    !decision.keyId ||
    !decision.missionId ||
    !decision.runId ||
    !decision.correlationId
  ) {
    throw new Error("NOVA_CERTIFICATION_AUTHORITY_OR_BINDING_MISSING");
  }
  if (decision.decision !== "CERTIFIED") throw new Error("NOVA_CERTIFICATION_DECISION_NOT_CERTIFIED");
  if (!Number.isFinite(Date.parse(decision.decidedAt))) throw new Error("NOVA_CERTIFICATION_DATE_INVALID");
  requireSha256(decision.reportFingerprint, "NOVA_CERTIFICATION_FINGERPRINT_INVALID");
}

function validateBinding(binding: RuntimeCertificationBinding): void {
  if (
    !binding.projectId ||
    !binding.missionId ||
    !binding.reportId ||
    !binding.runId ||
    !binding.codexVersion ||
    !binding.codexPath
  ) {
    throw new Error("NOVA_CERTIFICATION_RUN_BINDING_MISSING");
  }
  requireSha256(binding.promptHash, "NOVA_CERTIFICATION_PROMPT_HASH_INVALID");
  requireSha256(binding.executionRequestHash, "NOVA_CERTIFICATION_EXECUTION_REQUEST_HASH_INVALID");
  requireSha256(binding.manifestHash, "NOVA_CERTIFICATION_MANIFEST_HASH_INVALID");
  requireSha256(binding.reportFingerprint, "NOVA_CERTIFICATION_FINGERPRINT_INVALID");
  requireSha256(binding.codexBinaryHash, "NOVA_CERTIFICATION_CODEX_HASH_INVALID");
}

function requireSha256(value: string, code: string): void {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error(code);
}

function safeSecretEqual(left: string, right: string): boolean {
  const leftHash = Buffer.from(sha256(left), "hex");
  const rightHash = Buffer.from(sha256(right), "hex");
  return timingSafeEqual(leftHash, rightHash);
}

function safeHexEqual(left: string, right: string): boolean {
  if (!/^[0-9a-f]+$/i.test(left) || !/^[0-9a-f]+$/i.test(right) || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}
