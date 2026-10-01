import type { WorkSetupCanvasItem } from './workSetupTypes';

export const MISSION_RUNTIME_PROJECTS_PATH = '/api/mission-runtime/projects';
export const MISSION_RUNTIME_MISSIONS_PATH = '/api/mission-runtime/missions';

const MAX_SCOPE_ENTRIES = 256;
const MAX_SCOPE_ENTRY_LENGTH = 512;
const MAX_PROMPT_LENGTH = 50_000;

export interface WorkSetupMissionInput {
  readonly missionId: string;
  readonly objective: string;
  readonly clarifyAnswers: readonly string[];
  readonly canvasItems: readonly WorkSetupCanvasItem[];
  readonly selectedAutonomyLevel: number;
  readonly allowedScopeText: string;
  readonly forbiddenScopeText: string;
}

export interface WorkSetupMissionResult {
  readonly projectId: string;
  readonly missionId: string;
}

export class MissionRuntimeRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'MissionRuntimeRequestError';
  }
}

export function createWorkMissionId(): string {
  if (typeof crypto.randomUUID !== 'function') {
    throw new MissionRuntimeRequestError('A collision-resistant Mission identity is unavailable.');
  }
  return `NOVA-WORK-${crypto.randomUUID()}`;
}

export function parseExplicitTechnicalScope(value: string, label: string): readonly string[] {
  const entries = value
    .split(/\r?\n/)
    .map((entry) => entry.trim().replaceAll('\\', '/').replace(/\/+/g, '/'))
    .filter(Boolean);

  if (entries.length === 0) {
    throw new MissionRuntimeRequestError(`${label} must contain at least one explicit repository path.`);
  }
  if (entries.length > MAX_SCOPE_ENTRIES) {
    throw new MissionRuntimeRequestError(`${label} contains too many paths.`);
  }

  for (const entry of entries) {
    const segments = entry.split('/');
    const isAbsolute = entry.startsWith('/') || /^[A-Za-z]:\//.test(entry);
    const isGlobal = entry === '.' || !/[A-Za-z0-9_-]/.test(entry.replace(/[?*.[\]{}]/g, ''));
    if (
      entry.length > MAX_SCOPE_ENTRY_LENGTH
      || isAbsolute
      || segments.includes('..')
      || isGlobal
    ) {
      throw new MissionRuntimeRequestError(`${label} contains an unsafe or global repository path.`);
    }
  }

  return [...new Set(entries)];
}

function parseOptionalTechnicalScope(value: string): readonly string[] {
  return value.trim() ? parseExplicitTechnicalScope(value, 'Forbidden scope') : [];
}

export async function createAndExecuteWork(
  input: WorkSetupMissionInput,
  fetcher: typeof fetch = fetch,
): Promise<WorkSetupMissionResult> {
  const allowed = parseExplicitTechnicalScope(input.allowedScopeText, 'Allowed scope');
  const forbidden = parseOptionalTechnicalScope(input.forbiddenScopeText);
  const prompt = buildExecutionPrompt(input);
  const projectId = await resolveSingleProjectTarget(fetcher);

  const creation = await postMissionRuntimeJson(
    MISSION_RUNTIME_MISSIONS_PATH,
    {
      projectId,
      missionId: input.missionId,
      missionType: 'WORK',
      objective: input.objective,
      authority: 'WAVE',
      scope: { allowed, forbidden },
      deliverables: [],
      stopCriteria: [],
      authorizedReferences: [],
    },
    'Mission creation',
    fetcher,
  );
  assertMissionIdentity(creation, projectId, input.missionId, 'Mission creation');

  const execution = await postMissionRuntimeJson(
    `${MISSION_RUNTIME_MISSIONS_PATH}/${encodeURIComponent(projectId)}/${encodeURIComponent(input.missionId)}/execute`,
    { prompt },
    'Mission execution',
    fetcher,
  );
  assertMissionIdentity(execution, projectId, input.missionId, 'Mission execution');

  return { projectId, missionId: input.missionId };
}

async function resolveSingleProjectTarget(fetcher: typeof fetch): Promise<string> {
  const response = await fetcher(MISSION_RUNTIME_PROJECTS_PATH, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new MissionRuntimeRequestError(`Project target discovery failed (HTTP ${response.status}).`, response.status);
  }
  const value: unknown = await response.json();
  if (!isRecord(value) || !Array.isArray(value.projects)) {
    throw new MissionRuntimeRequestError('Project target discovery returned an invalid response.');
  }
  const projectIds = value.projects.map((project) => {
    if (!isRecord(project) || !isNonEmptyString(project.projectId) || Object.keys(project).length !== 1) {
      throw new MissionRuntimeRequestError('Project target discovery returned an invalid response.');
    }
    return project.projectId;
  });
  if (projectIds.length !== 1) {
    throw new MissionRuntimeRequestError('Project target discovery is ambiguous or empty.');
  }
  return projectIds[0];
}

async function postMissionRuntimeJson(
  path: string,
  body: unknown,
  operation: string,
  fetcher: typeof fetch,
): Promise<unknown> {
  const sessionResponse = await fetcher('/session', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!sessionResponse.ok) {
    throw new MissionRuntimeRequestError(`${operation} could not establish a session (HTTP ${sessionResponse.status}).`, sessionResponse.status);
  }
  const csrfToken = sessionResponse.headers.get('X-CSRF-Token');
  if (!csrfToken) {
    throw new MissionRuntimeRequestError(`${operation} could not obtain a CSRF token.`);
  }

  const response = await fetcher(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new MissionRuntimeRequestError(`${operation} failed (HTTP ${response.status}).`, response.status);
  }
  return await response.json() as unknown;
}

function buildExecutionPrompt(input: WorkSetupMissionInput): string {
  const prompt = JSON.stringify({
    workSetup: {
      objective: input.objective,
      clarifyAnswers: input.clarifyAnswers,
      canvasItems: input.canvasItems,
      selectedAutonomyLevel: input.selectedAutonomyLevel,
    },
  });
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new MissionRuntimeRequestError('Work Setup context is too large to execute safely.');
  }
  return prompt;
}

function assertMissionIdentity(value: unknown, projectId: string, missionId: string, operation: string): void {
  if (
    !isRecord(value)
    || !isRecord(value.mission)
    || value.mission.projectId !== projectId
    || value.mission.missionId !== missionId
  ) {
    throw new MissionRuntimeRequestError(`${operation} returned a mismatched Mission identity.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value === value.trim();
}
