import {
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  NovaCoreCommandRunner,
} from "./nova-core.execution.js";

export interface CerebrauMissionCertificationPolicyInput {
  readonly ExecutionMode: unknown;
  readonly OfficialStatus: unknown;
  readonly AuthorityDecision: unknown;
  readonly FinalMissionState: unknown;
  readonly ExitCode: unknown;
  readonly OfficialReport: unknown;
  readonly Evidence: unknown;
  readonly Tests: unknown;
  readonly Regressions: unknown;
  readonly ContractCriteriaSatisfied: unknown;
}

export type CerebrauMissionCertificationDecision =
  | "CERTIFIED"
  | "PENDING_REVIEW"
  | "REJECTED"
  | "EXECUTION_FAILED"
  | "CANCELLED";

export interface CerebrauMissionCertificationPolicyDecision {
  readonly Decision: CerebrauMissionCertificationDecision;
  readonly ReasonCode: string;
  readonly RetryAllowed: boolean;
  readonly RegistryTransition:
    | "CERTIFIED"
    | "REJECTED"
    | "KEEP_CURRENT"
    | "KEEP_PENDING_EVIDENCE";
  readonly InvokeCompleteDomainLot: boolean;
  readonly PreserveEvidence: true;
}

export interface CerebrauMissionCertificationPolicyPort {
  resolve(
    input: CerebrauMissionCertificationPolicyInput,
  ): Promise<CerebrauMissionCertificationPolicyDecision>;
}

export interface CerebrauMissionCertificationPolicyAdapterOptions {
  readonly repositoryRoot: string;
  readonly commandRunner: NovaCoreCommandRunner;
  readonly powershellCommand?: string;
  readonly scriptPath?: string;
  readonly temporaryRoot?: string;
}

export class CerebrauMissionCertificationPolicyAdapterError extends Error {
  constructor(
    readonly code: "CMCPA-001" | "CMCPA-002" | "CMCPA-003",
    message: string,
    readonly details?: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "CerebrauMissionCertificationPolicyAdapterError";
  }
}

export class CerebrauMissionCertificationPolicyAdapter
implements CerebrauMissionCertificationPolicyPort {
  private readonly repositoryRoot: string;
  private readonly commandRunner: NovaCoreCommandRunner;
  private readonly powershellCommand: string;
  private readonly scriptPath: string;
  private readonly temporaryRoot: string;

  constructor(options: CerebrauMissionCertificationPolicyAdapterOptions) {
    this.repositoryRoot = options.repositoryRoot;
    this.commandRunner = options.commandRunner;
    this.powershellCommand =
      options.powershellCommand ??
      process.env.NOVA_CORE_POWERSHELL_COMMAND ??
      (process.platform === "win32" ? "powershell.exe" : "pwsh");
    this.scriptPath =
      options.scriptPath ??
      join(
        this.repositoryRoot,
        "tools",
        "nova-core-runtime",
        "Invoke-CerebrauMissionCertificationDecision.ps1",
      );
    this.temporaryRoot = options.temporaryRoot ?? tmpdir();
  }

  async resolve(
    input: CerebrauMissionCertificationPolicyInput,
  ): Promise<CerebrauMissionCertificationPolicyDecision> {
    const serializedInput = serializeInput(input);
    const temporaryDirectory = await mkdtemp(
      join(this.temporaryRoot, "nova-cerebrau-certification-"),
    );
    const inputPath = join(temporaryDirectory, "policy-input.json");

    try {
      await writeFile(inputPath, `${serializedInput}\n`, "utf8");
      const result = await this.commandRunner(
        this.powershellCommand,
        [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          this.scriptPath,
          "-InputPath",
          inputPath,
        ],
        this.repositoryRoot,
        {
          maxStdoutBytes: 100_000,
          maxStderrBytes: 100_000,
        },
      );

      if (result.exitCode !== 0 || result.outputTruncated) {
        throw new CerebrauMissionCertificationPolicyAdapterError(
          "CMCPA-002",
          "The CEREBRAU certification policy process failed.",
          compactDetails(result.stderr, result.stdout),
        );
      }

      return parseDecision(result.stdout);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

function serializeInput(
  input: CerebrauMissionCertificationPolicyInput,
): string {
  if (!isRecord(input)) {
    throw new CerebrauMissionCertificationPolicyAdapterError(
      "CMCPA-001",
      "A structured certification policy input is required.",
    );
  }

  for (const property of POLICY_INPUT_PROPERTIES) {
    if (!Object.prototype.hasOwnProperty.call(input, property)) {
      throw new CerebrauMissionCertificationPolicyAdapterError(
        "CMCPA-001",
        `Certification policy input is missing ${property}.`,
      );
    }
  }

  try {
    const serialized = JSON.stringify(input);
    if (serialized === undefined) {
      throw new Error("Serialization returned undefined.");
    }
    JSON.parse(serialized);
    return serialized;
  } catch (error) {
    if (error instanceof CerebrauMissionCertificationPolicyAdapterError) {
      throw error;
    }
    throw new CerebrauMissionCertificationPolicyAdapterError(
      "CMCPA-001",
      "Certification policy input must be JSON serializable.",
    );
  }
}

function parseDecision(
  stdout: string,
): CerebrauMissionCertificationPolicyDecision {
  let value: unknown;
  try {
    value = JSON.parse(stdout.trim().replace(/^\uFEFF/, ""));
  } catch {
    throw new CerebrauMissionCertificationPolicyAdapterError(
      "CMCPA-003",
      "The CEREBRAU certification policy returned invalid JSON.",
      stdout.slice(0, 4_000),
    );
  }

  if (!isExactDecision(value)) {
    throw new CerebrauMissionCertificationPolicyAdapterError(
      "CMCPA-003",
      "The CEREBRAU certification policy returned an invalid decision.",
    );
  }

  return Object.freeze({ ...value });
}

function isExactDecision(
  value: unknown,
): value is CerebrauMissionCertificationPolicyDecision {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  if (
    keys.length !== POLICY_DECISION_PROPERTIES.length ||
    !POLICY_DECISION_PROPERTIES.every(
      (property, index) => property === keys[index],
    )
  ) {
    return false;
  }

  const decision = value.Decision;
  const invokesCompletion =
    decision === "CERTIFIED" || decision === "REJECTED";
  return (
    POLICY_DECISIONS.has(decision) &&
    typeof value.ReasonCode === "string" &&
    value.ReasonCode.length > 0 &&
    typeof value.RetryAllowed === "boolean" &&
    REGISTRY_TRANSITIONS.has(value.RegistryTransition) &&
    typeof value.InvokeCompleteDomainLot === "boolean" &&
    value.InvokeCompleteDomainLot === invokesCompletion &&
    value.PreserveEvidence === true
  );
}

function compactDetails(stderr: string, stdout: string): string {
  return [stderr.trim(), stdout.trim()]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4_000);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const POLICY_INPUT_PROPERTIES = Object.freeze([
  "ExecutionMode",
  "OfficialStatus",
  "AuthorityDecision",
  "FinalMissionState",
  "ExitCode",
  "OfficialReport",
  "Evidence",
  "Tests",
  "Regressions",
  "ContractCriteriaSatisfied",
] as const);

const POLICY_DECISION_PROPERTIES = Object.freeze([
  "Decision",
  "InvokeCompleteDomainLot",
  "PreserveEvidence",
  "ReasonCode",
  "RegistryTransition",
  "RetryAllowed",
] as const);

const POLICY_DECISIONS = new Set<unknown>([
  "CERTIFIED",
  "PENDING_REVIEW",
  "REJECTED",
  "EXECUTION_FAILED",
  "CANCELLED",
]);

const REGISTRY_TRANSITIONS = new Set<unknown>([
  "CERTIFIED",
  "REJECTED",
  "KEEP_CURRENT",
  "KEEP_PENDING_EVIDENCE",
]);
