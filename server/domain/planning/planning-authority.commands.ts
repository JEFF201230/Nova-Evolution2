import type { PlanningRevision } from "./planning.aggregate.js";
import type {
  CausalityId,
  PlanningProvenance,
  PlanningVersion,
  WorkReference,
} from "./planning.value-objects.js";

type PlanningCommand = Readonly<{
  workReference: WorkReference;
  causality: CausalityId;
  provenance: PlanningProvenance;
  expectedVersion: PlanningVersion | null;
}>;

export type EstablishPlanningCommand = PlanningCommand & Readonly<{
  kind: "ESTABLISH_PLANNING";
  proposal: PlanningRevision;
}>;

export type RevisePlanningCommand = PlanningCommand & Readonly<{
  kind: "REVISE_PLANNING";
  proposal: PlanningRevision;
  reason: string;
}>;

export type WithdrawPlanningCommand = PlanningCommand & Readonly<{
  kind: "WITHDRAW_PLANNING";
  expectedVersion: PlanningVersion;
  reason: string;
}>;

export type PlanningAuthorityCommand =
  | EstablishPlanningCommand
  | RevisePlanningCommand
  | WithdrawPlanningCommand;
