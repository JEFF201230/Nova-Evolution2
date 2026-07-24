import { Button } from '../../components/shared/Button';
import { Card } from '../../components/surfaces/Card';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { useNavigation } from '../../hooks/useNavigation';
import { useWorkSetup } from './WorkSetupContext';
import { workSetupAutonomyLevels } from './workSetupFixtures';

export function ConfirmPage() {
  const { navigate } = useNavigation();
  const { clarifyAnswers, objective, selectedAutonomyLevel, setAutonomyLevel } = useWorkSetup();

  return (
    <PageContainer narrow>
      <Card heading="Confirm" description="Select the execution autonomy before creating the work.">
        <p>Objective: {objective}</p>
        <p>Clarify answers: {clarifyAnswers.filter(Boolean).length}</p>
        <fieldset>
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
        <div>
          <Button variant="secondary" onClick={() => navigate('plan')}>Back</Button>
          <Button onClick={() => navigate('work')}>Create work</Button>
        </div>
      </Card>
    </PageContainer>
  );
}
