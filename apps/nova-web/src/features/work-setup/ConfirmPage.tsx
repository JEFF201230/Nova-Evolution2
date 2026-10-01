import { useRef, useState } from 'react';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/surfaces/Card';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { useNavigation } from '../../hooks/useNavigation';
import { useWorkSetup } from './WorkSetupContext';
import { workSetupAutonomyLevels } from './workSetupFixtures';
import { createAndExecuteWork, createWorkMissionId } from './missionRuntime.service';

export function ConfirmPage() {
  const { navigate } = useNavigation();
  const {
    allowedScopeText,
    canvasItems,
    clarifyAnswers,
    forbiddenScopeText,
    missionId,
    objective,
    selectedAutonomyLevel,
    setAllowedScopeText,
    setAutonomyLevel,
    setForbiddenScopeText,
    setMissionId,
  } = useWorkSetup();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  async function createWork() {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const stableMissionId = missionId ?? createWorkMissionId();
      if (!missionId) {
        setMissionId(stableMissionId);
      }
      const result = await createAndExecuteWork({
        missionId: stableMissionId,
        objective,
        clarifyAnswers,
        canvasItems,
        selectedAutonomyLevel,
        allowedScopeText,
        forbiddenScopeText,
      });
      navigate('work.overview', { pathParams: { workId: result.missionId } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Work creation failed.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <PageContainer narrow>
      <Card heading="Confirm" description="Select the execution autonomy before creating the work.">
        <p>Objective: {objective}</p>
        <p>Clarify answers: {clarifyAnswers.filter(Boolean).length}</p>
        <fieldset disabled={pending}>
          <legend>Autonomy level</legend>
          {workSetupAutonomyLevels.map((autonomy) => (
            <label key={autonomy.level}>
              <input
                checked={selectedAutonomyLevel === autonomy.level}
                name="autonomy-level"
                type="radio"
                value={autonomy.level}
                onChange={() => setAutonomyLevel(autonomy.level)}
              />
              {autonomy.label} — {autonomy.description}
            </label>
          ))}
        </fieldset>
        <fieldset disabled={pending}>
          <legend>Technical scope</legend>
          <label>
            Allowed repository paths (one per line)
            <textarea
              aria-describedby="allowed-scope-help"
              value={allowedScopeText}
              onChange={(event) => setAllowedScopeText(event.target.value)}
            />
          </label>
          <p id="allowed-scope-help">Required. Use explicit repository-relative paths; global scope is refused.</p>
          <label>
            Forbidden repository paths (one per line)
            <textarea
              value={forbiddenScopeText}
              onChange={(event) => setForbiddenScopeText(event.target.value)}
            />
          </label>
        </fieldset>
        {error ? <p role="alert">{error}</p> : null}
        <div>
          <Button disabled={pending} variant="secondary" onClick={() => navigate('plan')}>Back</Button>
          <Button loading={pending} onClick={() => void createWork()}>Create work</Button>
        </div>
      </Card>
    </PageContainer>
  );
}
