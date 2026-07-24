import { useState } from 'react';
import { Button } from '../../components/shared/Button';
import { Progress } from '../../components/shared/Progress';
import { Card } from '../../components/surfaces/Card';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { useNavigation } from '../../hooks/useNavigation';
import { useWorkSetup } from './WorkSetupContext';
import { workSetupClarifySteps } from './workSetupFixtures';

export function ClarifyPage() {
  const { navigate } = useNavigation();
  const { clarifyAnswers, objective, setClarifyAnswer } = useWorkSetup();
  const [stepIndex, setStepIndex] = useState(0);
  const step = workSetupClarifySteps[stepIndex];
  const answer = clarifyAnswers[stepIndex] ?? '';
  const isLastStep = stepIndex === workSetupClarifySteps.length - 1;

  function advance() {
    if (isLastStep) {
      navigate('canvas');
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function goBack() {
    if (stepIndex === 0) {
      navigate('home');
      return;
    }

    setStepIndex((current) => current - 1);
  }

  return (
    <PageContainer narrow>
      <Card heading="Clarify" description={`Objective: ${objective}`}>
        <Progress
          label={`Clarify step ${stepIndex + 1} of ${workSetupClarifySteps.length}`}
          max={workSetupClarifySteps.length}
          value={stepIndex + 1}
        />
        <h2>{step.question}</h2>
        <div>
          {step.suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant={answer === suggestion ? 'primary' : 'secondary'}
              onClick={() => setClarifyAnswer(stepIndex, suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
        <textarea
          aria-label="Clarify answer"
          value={answer}
          onChange={(event) => setClarifyAnswer(stepIndex, event.target.value)}
        />
        <div>
          <Button variant="secondary" onClick={goBack}>Back</Button>
          <Button variant="quiet" onClick={advance}>Skip</Button>
          <Button disabled={!answer.trim()} onClick={advance}>
            {isLastStep ? 'Review understanding' : 'Continue'}
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
