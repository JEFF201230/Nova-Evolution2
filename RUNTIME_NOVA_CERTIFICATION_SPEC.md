# Certification specification

`mission-certification.ts` defines a structured decision containing authorityId, authorityType, decision, missionId, runId, reportFingerprint, decidedAt, optional attestation and correlationId. `issueMissionCertificate` rejects missing authority/binding, non-CERTIFIED decisions and fingerprint mismatches, then emits a distinct certificate fingerprint. API integration, double-certification persistence and report drift checks remain open and are not silently certified.
