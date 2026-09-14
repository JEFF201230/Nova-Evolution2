export {
  PLANNING_FOUNDATION_ERROR_CODES,
  PlanningDomainError,
  type PlanningFoundationErrorCode,
} from "./planning.errors.js";

export {
  BusinessInstant,
  BusinessPeriod,
  CausalityId,
  ConstraintId,
  MilestoneId,
  PhaseId,
  PlanningElementReference,
  PlanningProvenance,
  PlanningVersion,
  WorkReference,
  type BusinessPeriodDefinition,
  type BusinessTimeOrigin,
  type PeriodBoundary,
  type PlanningElementKind,
} from "./planning.value-objects.js";

export {
  Constraint,
  Dependency,
  Milestone,
  Phase,
  Priority,
  Schedule,
  type ScheduleEntry,
} from "./planning.entities.js";

export {
  Planning,
  PlanningRevision,
  type PlanningRevisionDefinition,
} from "./planning.aggregate.js";

export type {
  EstablishPlanningCommand,
  PlanningAuthorityCommand,
  RevisePlanningCommand,
  WithdrawPlanningCommand,
} from "./planning-authority.commands.js";

export type {
  PlanningDomainEvent,
  PlanningEstablished,
  PlanningRevised,
  PlanningWithdrawn,
  PhaseAdded,
  PhaseChanged,
  PhaseRemoved,
  MilestoneScheduled,
  MilestoneChanged,
  MilestoneRemoved,
  DependencyDeclared,
  DependencyRemoved,
  ConstraintDeclared,
  ConstraintReleased,
  ScheduleChanged,
  PriorityChanged,
} from "./planning-authority.events.js";

export {
  PlanningAuthority,
  type PlanningAdmissionPolicy,
  type PlanningAuthorityResult,
} from "./planning-authority.js";

export type {
  ExpectedPlanningRevision,
  PendingPlanningChange,
  PersistedPlanning,
  PlanningCommandEnvelope,
  PlanningCommitResult,
  PlanningHistoryEvent,
  PlanningHistorySlice,
  PlanningRepository,
} from "./planning-persistence-ports.js";

export {
  canonicalJson as canonicalPlanningJson,
  deserializeRevision as deserializePlanningRevision,
  serializeRevision as serializePlanningRevision,
} from "./planning-persistence-codec.js";

export {
  PLANNING_PERSISTENCE_MIGRATIONS,
  PLANNING_PERSISTENCE_SCHEMA_VERSION,
  PlanningPersistenceSchema,
  PlanningSchemaMigrationError,
  readPlanningSchemaVersion,
  verifyPlanningSQLiteIntegrity,
  type PlanningMigrationOptions,
  type PlanningMigrationStage,
  type PlanningSchemaMigration,
} from "./planning-persistence-migrations.js";

export {
  PlanningHistoryCorruptedError,
  PlanningIdempotencyConflictError,
  PlanningPersistenceConflictError,
  PlanningPersistenceError,
  PlanningSQLiteRepository,
  createPlanningRequestFingerprint,
  type PlanningPersistenceErrorCode,
  type PlanningSQLiteOptions,
} from "./planning-persistence-sqlite-adapter.js";

export {
  PlanningRecoveryError,
  backupPlanningDatabase,
  rebuildPlanningDatabaseFromHistory,
  restorePlanningDatabase,
} from "./planning-persistence-recovery.js";

export {
  PlanningCommands,
  PlanningQueries,
  type GetCurrentPlanningResult,
  type GetPlanningHistoryResult,
  type GetPlanningScheduleResult,
  type GetPlanningTimelineResult,
  type GetPlanningVersionResult,
  type InternalPlanningCommandRequest,
  type PlanningAbsent,
  type PlanningHistoryEntry,
  type PlanningTimelineEntry,
  type PlanningUnavailable,
  type PlanningVersionAbsent,
} from "./planning-internal-access.js";
