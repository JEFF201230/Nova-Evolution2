import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateCertificationAuthority,
  authorizeCertificationAuthority,
  createCertificationAttestation,
  issueMissionCertificate,
  verifyCertificationAttestation,
  verifyMissionCertificate,
  type CertificationAuthority,
  type CertificationBinding,
  type CertificationDecision,
} from "./mission-certification.js";

const hash = (character: string) => character.repeat(64);
const authority: CertificationAuthority = {
  authorityId: "human-1",
  authenticatedSubjectId: "human-1",
  authorityType: "HUMAN",
  keyId: "key-2026-01",
  bearerToken: "authority-token-at-least-16",
  signingKey: "authority-signing-key-at-least-16",
  enabled: true,
  roles: ["CERTIFY"],
};
const binding: CertificationBinding = {
  projectId: "P-1",
  missionId: "M-1",
  reportId: "REPORT-1",
  runId: "R-1",
  promptHash: hash("a"),
  executionRequestHash: hash("b"),
  manifestHash: hash("c"),
  reportFingerprint: hash("d"),
  codexVersion: "0.144.1",
  codexPath: "C:/tools/codex.cmd",
  codexBinaryHash: hash("e"),
};
const decision: CertificationDecision = {
  authorityId: authority.authorityId,
  authorityType: authority.authorityType,
  keyId: authority.keyId,
  decision: "CERTIFIED",
  missionId: binding.missionId,
  runId: binding.runId,
  reportFingerprint: binding.reportFingerprint,
  decidedAt: "2026-07-25T00:00:00.000Z",
  correlationId: "C-1",
};

test("authenticated certificate binds and signs the complete execution chain", () => {
  const principal = authenticateCertificationAuthority(
    `Bearer ${authority.bearerToken}`,
    [authority],
  );
  authorizeCertificationAuthority(principal, {
    allowedAuthorityTypes: ["HUMAN"],
    requiredRole: "CERTIFY",
  });
  const certificate = issueMissionCertificate(decision, binding, principal.signingKey);
  assert.equal(certificate.binding.promptHash, binding.promptHash);
  assert.equal(certificate.binding.manifestHash, binding.manifestHash);
  assert.equal(certificate.binding.runId, binding.runId);
  assert.equal(verifyMissionCertificate(certificate, authority.signingKey, binding), true);
});

test("authorization is closed by default for disabled, mismatched and insufficient principals", () => {
  const policy = { allowedAuthorityTypes: ["HUMAN"], requiredRole: "CERTIFY" };
  for (const candidate of [
    { ...authority, enabled: false },
    { ...authority, authenticatedSubjectId: "another-human" },
    { ...authority, roles: ["READ_ONLY"] },
    { ...authority, authorityType: "AUTOMATION" },
  ]) {
    const principal = authenticateCertificationAuthority(`Bearer ${candidate.bearerToken}`, [candidate]);
    assert.throws(() => authorizeCertificationAuthority(principal, policy));
  }
});

test("authority attestation is cryptographically bound to identity, mission, run and report", () => {
  const facts = {
    projectId: binding.projectId,
    authorityId: authority.authorityId,
    missionId: binding.missionId,
    runId: binding.runId,
    reportFingerprint: binding.reportFingerprint,
  };
  const attestation = createCertificationAttestation(authority.signingKey, facts);
  assert.equal(verifyCertificationAttestation(attestation, authority.signingKey, facts), true);
  assert.equal(
    verifyCertificationAttestation(attestation, authority.signingKey, {
      ...facts,
      runId: "R-OTHER",
    }),
    false,
  );
  assert.equal(verifyCertificationAttestation("f".repeat(64), authority.signingKey, facts), false);
});

test("unauthenticated, stale and altered certificates are rejected", () => {
  assert.throws(
    () => authenticateCertificationAuthority(undefined, [authority]),
    /UNAUTHENTICATED/,
  );
  assert.throws(
    () => issueMissionCertificate(
      { ...decision, reportFingerprint: hash("e") },
      binding,
      authority.signingKey,
    ),
    /FINGERPRINT_MISMATCH/,
  );
  const certificate = issueMissionCertificate(decision, binding, authority.signingKey);
  assert.equal(
    verifyMissionCertificate(
      { ...certificate, binding: { ...certificate.binding, promptHash: hash("f") } },
      authority.signingKey,
    ),
    false,
  );
  assert.equal(verifyMissionCertificate(certificate, "wrong-signing-key-at-least-16"), false);
});
