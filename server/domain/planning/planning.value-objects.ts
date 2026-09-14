import { PlanningDomainError } from "./planning.errors.js";

export type PlanningElementKind = "PHASE" | "MILESTONE";
export type BusinessTimeOrigin =
  | "BUSINESS_DECISION"
  | "AUTHORITATIVE_BUSINESS_SOURCE";
export type PeriodBoundary = "INCLUSIVE" | "EXCLUSIVE" | "UNBOUNDED";

abstract class OpaquePlanningIdentifier {
  protected constructor(private readonly canonicalValue: string) {
    Object.freeze(this);
  }

  get value(): string {
    return this.canonicalValue;
  }

  equals(other: OpaquePlanningIdentifier): boolean {
    return this.canonicalValue === other.canonicalValue;
  }
}

export class PhaseId extends OpaquePlanningIdentifier {
  static of(value: string): PhaseId {
    assertIdentifier(value, "PhaseId");
    return new PhaseId(value);
  }
}

export class MilestoneId extends OpaquePlanningIdentifier {
  static of(value: string): MilestoneId {
    assertIdentifier(value, "MilestoneId");
    return new MilestoneId(value);
  }
}

export class ConstraintId extends OpaquePlanningIdentifier {
  static of(value: string): ConstraintId {
    assertIdentifier(value, "ConstraintId");
    return new ConstraintId(value);
  }
}

export class CausalityId extends OpaquePlanningIdentifier {
  static of(value: string): CausalityId {
    assertIdentifier(value, "CausalityId", "PLANNING_CAUSALITY_CONFLICT");
    return new CausalityId(value);
  }
}

export class WorkReference {
  private constructor(
    private readonly canonicalProjectIdentity: string,
    private readonly canonicalWorkIdentity: string,
  ) {
    Object.freeze(this);
  }

  static of(projectIdentity: string, workIdentity: string): WorkReference {
    assertIdentifier(projectIdentity, "Project Identity", "WORK_REFERENCE_NOT_FOUND");
    assertIdentifier(workIdentity, "Work Identity", "WORK_REFERENCE_NOT_FOUND");
    return new WorkReference(projectIdentity, workIdentity);
  }

  get projectIdentity(): string {
    return this.canonicalProjectIdentity;
  }

  get workIdentity(): string {
    return this.canonicalWorkIdentity;
  }

  get key(): string {
    return `${this.canonicalProjectIdentity}/${this.canonicalWorkIdentity}`;
  }

  equals(other: WorkReference): boolean {
    return this.canonicalProjectIdentity === other.canonicalProjectIdentity
      && this.canonicalWorkIdentity === other.canonicalWorkIdentity;
  }
}

export class PlanningVersion {
  private constructor(readonly value: number) {
    Object.freeze(this);
  }

  static of(value: number): PlanningVersion {
    assertPlanningVersionValue(value);
    return new PlanningVersion(value);
  }

  immediatelyFollows(previous: PlanningVersion): boolean {
    return this.value === previous.value + 1;
  }

  equals(other: PlanningVersion): boolean {
    return this.value === other.value;
  }
}

export class PlanningElementReference {
  private constructor(
    readonly kind: PlanningElementKind,
    readonly id: string,
  ) {
    Object.freeze(this);
  }

  static phase(id: PhaseId): PlanningElementReference {
    assertPhaseId(id);
    return new PlanningElementReference("PHASE", id.value);
  }

  static milestone(id: MilestoneId): PlanningElementReference {
    assertMilestoneId(id);
    return new PlanningElementReference("MILESTONE", id.value);
  }

  get key(): string {
    return `${this.kind}:${this.id}`;
  }

  equals(other: PlanningElementReference): boolean {
    return this.kind === other.kind && this.id === other.id;
  }
}

export class PlanningProvenance {
  private constructor(
    readonly authority: string,
    readonly source: string,
    readonly businessCause: string,
    private readonly effectiveAtEpochMs: number,
  ) {
    Object.freeze(this);
  }

  static of(
    authority: string,
    source: string,
    businessCause: string,
    effectiveAt: Date,
  ): PlanningProvenance {
    const effectiveAtEpochMs = validatePlanningProvenanceValues(
      authority,
      source,
      businessCause,
      effectiveAt,
    );
    return new PlanningProvenance(
      authority,
      source,
      businessCause,
      effectiveAtEpochMs,
    );
  }

  get effectiveAt(): Date {
    return new Date(this.effectiveAtEpochMs);
  }

  equals(other: PlanningProvenance): boolean {
    return this.authority === other.authority
      && this.source === other.source
      && this.businessCause === other.businessCause
      && this.effectiveAtEpochMs === other.effectiveAtEpochMs;
  }
}

export class BusinessInstant {
  private constructor(
    private readonly epochMs: number,
    readonly meaning: string,
    readonly provenance: PlanningProvenance,
    readonly origin: BusinessTimeOrigin,
  ) {
    Object.freeze(this);
  }

  static of(
    value: Date,
    meaning: string,
    provenance: PlanningProvenance,
    origin: BusinessTimeOrigin,
  ): BusinessInstant {
    const epochMs = validateBusinessInstantValues(value, meaning, provenance, origin);
    return new BusinessInstant(
      epochMs,
      meaning,
      provenance,
      origin,
    );
  }

  get value(): Date {
    return new Date(this.epochMs);
  }

  compareTo(other: BusinessInstant): number {
    return this.epochMs - other.epochMs;
  }

  equals(other: BusinessInstant): boolean {
    return this.epochMs === other.epochMs
      && this.meaning === other.meaning
      && this.provenance.equals(other.provenance)
      && this.origin === other.origin;
  }
}

export type BusinessPeriodDefinition = Readonly<{
  start: BusinessInstant | null;
  end: BusinessInstant | null;
  startBoundary: PeriodBoundary;
  endBoundary: PeriodBoundary;
  meaning: string;
  provenance: PlanningProvenance;
}>;

export class BusinessPeriod {
  private constructor(
    readonly start: BusinessInstant | null,
    readonly end: BusinessInstant | null,
    readonly startBoundary: PeriodBoundary,
    readonly endBoundary: PeriodBoundary,
    readonly meaning: string,
    readonly provenance: PlanningProvenance,
  ) {
    Object.freeze(this);
  }

  static of(definition: BusinessPeriodDefinition): BusinessPeriod {
    const { start, end, startBoundary, endBoundary, meaning, provenance } = definition;
    validateBusinessPeriodValues(definition);
    return new BusinessPeriod(start, end, startBoundary, endBoundary, meaning, provenance);
  }
}

function assertBoundary(
  instant: BusinessInstant | null,
  boundary: PeriodBoundary,
  field: string,
): void {
  assertPeriodBoundary(boundary);
  if (instant !== null) {
    assertBusinessInstant(instant);
  }
  const isUnbounded = instant === null;
  if (isUnbounded !== (boundary === "UNBOUNDED")) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      `BusinessPeriod ${field} boundary must explicitly match its bound.`,
    );
  }
}

function assertPeriodBoundary(boundary: unknown): asserts boundary is PeriodBoundary {
  if (boundary !== "INCLUSIVE" && boundary !== "EXCLUSIVE" && boundary !== "UNBOUNDED") {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "BusinessPeriod boundaries must be explicitly qualified.",
    );
  }
}

function assertBusinessTimeOrigin(origin: unknown): asserts origin is BusinessTimeOrigin {
  if (origin !== "BUSINESS_DECISION" && origin !== "AUTHORITATIVE_BUSINESS_SOURCE") {
    throw new PlanningDomainError(
      "TECHNICAL_PLANNING_SOURCE_FORBIDDEN",
      "A technical timestamp, queue, timer, scheduler, fixture or projection cannot be business time.",
    );
  }
}

function assertIdentifier(
  value: unknown,
  field: string,
  code:
    | "WORK_REFERENCE_NOT_FOUND"
    | "PLANNING_ELEMENT_NOT_FOUND"
    | "PLANNING_CAUSALITY_CONFLICT" = "PLANNING_ELEMENT_NOT_FOUND",
): void {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw new PlanningDomainError(code, `${field} must be a non-empty canonical identifier.`);
  }
}

export function assertPlanningProvenance(value: unknown): asserts value is PlanningProvenance {
  if (!(value instanceof PlanningProvenance)) {
    throw new PlanningDomainError(
      "PLANNING_PROVENANCE_REQUIRED",
      "Planning provenance must be explicit and relisible.",
    );
  }
  validatePlanningProvenanceValues(
    value.authority,
    value.source,
    value.businessCause,
    value.effectiveAt,
  );
}

export function assertPhaseId(value: unknown): asserts value is PhaseId {
  if (!(value instanceof PhaseId)) {
    throw new PlanningDomainError("PLANNING_ELEMENT_NOT_FOUND", "PhaseId must be explicit.");
  }
  assertIdentifier(value.value, "PhaseId");
}

export function assertMilestoneId(value: unknown): asserts value is MilestoneId {
  if (!(value instanceof MilestoneId)) {
    throw new PlanningDomainError("PLANNING_ELEMENT_NOT_FOUND", "MilestoneId must be explicit.");
  }
  assertIdentifier(value.value, "MilestoneId");
}

export function assertConstraintId(value: unknown): asserts value is ConstraintId {
  if (!(value instanceof ConstraintId)) {
    throw new PlanningDomainError("PLANNING_ELEMENT_NOT_FOUND", "ConstraintId must be explicit.");
  }
  assertIdentifier(value.value, "ConstraintId");
}

export function assertCausalityId(value: unknown): asserts value is CausalityId {
  if (!(value instanceof CausalityId)) {
    throw new PlanningDomainError(
      "PLANNING_CAUSALITY_CONFLICT",
      "Planning causality must be an explicit canonical identifier.",
    );
  }
  assertIdentifier(value.value, "CausalityId", "PLANNING_CAUSALITY_CONFLICT");
}

export function assertWorkReference(value: unknown): asserts value is WorkReference {
  if (!(value instanceof WorkReference)) {
    throw new PlanningDomainError(
      "WORK_REFERENCE_NOT_FOUND",
      "WorkReference must carry canonical Project and Work identities.",
    );
  }
  assertIdentifier(value.projectIdentity, "Project Identity", "WORK_REFERENCE_NOT_FOUND");
  assertIdentifier(value.workIdentity, "Work Identity", "WORK_REFERENCE_NOT_FOUND");
}

export function assertPlanningVersion(value: unknown): asserts value is PlanningVersion {
  if (!(value instanceof PlanningVersion)) {
    throw new PlanningDomainError(
      "PLANNING_VERSION_CONFLICT",
      "PlanningVersion must be a positive safe integer.",
    );
  }
  assertPlanningVersionValue(value.value);
}

export function assertPlanningElementReference(
  value: unknown,
): asserts value is PlanningElementReference {
  if (!(value instanceof PlanningElementReference)) {
    throw new PlanningDomainError(
      "PLANNING_ELEMENT_NOT_FOUND",
      "Planning element reference must be explicitly typed and identified.",
    );
  }
  if (value.kind === "PHASE") {
    assertIdentifier(value.id, "PhaseId");
    return;
  }
  if (value.kind === "MILESTONE") {
    assertIdentifier(value.id, "MilestoneId");
    return;
  }
  throw new PlanningDomainError(
    "PLANNING_ELEMENT_NOT_FOUND",
    "Planning element reference kind must be PHASE or MILESTONE.",
  );
}

export function assertBusinessInstant(value: unknown): asserts value is BusinessInstant {
  if (!(value instanceof BusinessInstant)) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "Business time must be an explicitly qualified BusinessInstant.",
    );
  }
  validateBusinessInstantValues(value.value, value.meaning, value.provenance, value.origin);
}

export function assertBusinessPeriod(value: unknown): asserts value is BusinessPeriod {
  if (!(value instanceof BusinessPeriod)) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "Business period must be explicitly qualified.",
    );
  }
  validateBusinessPeriodValues(value);
}

function assertPlanningVersionValue(value: unknown): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new PlanningDomainError(
      "PLANNING_VERSION_CONFLICT",
      "PlanningVersion must be a positive safe integer.",
    );
  }
}

function validatePlanningProvenanceValues(
  authority: unknown,
  source: unknown,
  businessCause: unknown,
  effectiveAt: unknown,
): number {
  assertText(authority, "Planning provenance authority", "PLANNING_PROVENANCE_REQUIRED");
  assertText(source, "Planning provenance source", "PLANNING_PROVENANCE_REQUIRED");
  assertText(
    businessCause,
    "Planning provenance business cause",
    "PLANNING_PROVENANCE_REQUIRED",
  );
  return assertDate(effectiveAt, "Planning provenance effective date");
}

function validateBusinessInstantValues(
  value: unknown,
  meaning: unknown,
  provenance: unknown,
  origin: unknown,
): number {
  assertText(meaning, "BusinessInstant meaning", "INVALID_BUSINESS_TIME");
  assertPlanningProvenance(provenance);
  assertBusinessTimeOrigin(origin);
  return assertDate(value, "BusinessInstant value");
}

function validateBusinessPeriodValues(definition: BusinessPeriodDefinition): void {
  const { start, end, startBoundary, endBoundary, meaning, provenance } = definition;
  assertText(meaning, "BusinessPeriod meaning", "INVALID_BUSINESS_TIME");
  assertPlanningProvenance(provenance);
  assertBoundary(start, startBoundary, "start");
  assertBoundary(end, endBoundary, "end");
  if (start !== null && end !== null && start.compareTo(end) >= 0) {
    throw new PlanningDomainError(
      "INVALID_BUSINESS_TIME",
      "BusinessPeriod must end strictly after it starts.",
    );
  }
}

export function assertText(
  value: unknown,
  field: string,
  code:
    | "PLANNING_PROVENANCE_REQUIRED"
    | "INVALID_BUSINESS_TIME"
    | "PRIORITY_SCOPE_REQUIRED"
    | "CONSTRAINT_QUALIFICATION_REQUIRED",
): void {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw new PlanningDomainError(code, `${field} must be explicit and canonical.`);
  }
}

function assertDate(value: unknown, field: string): number {
  if (!(value instanceof Date)) {
    throw new PlanningDomainError("INVALID_BUSINESS_TIME", `${field} must be valid.`);
  }
  const epochMs = value.getTime();
  if (!Number.isFinite(epochMs)) {
    throw new PlanningDomainError("INVALID_BUSINESS_TIME", `${field} must be valid.`);
  }
  return epochMs;
}
