# Report binding specification

Each run gets `.nova-data/runs/<runId>/` containing `prompt.md`, `execution-request.json`, `manifest.json` and `run-binding.json`. The binding records projectId, missionId, runId, promptHash, executionRequestHash, manifestHash and reserved Git/Codex metadata. Report lookup is constrained to the current run directory instead of global modification time. Mission reports expose runId, hashes and reportFingerprint. The remaining gap is adding the same binding envelope to the PowerShell official report itself.
