import { Button } from '../../components/shared/Button';
import { Card } from '../../components/surfaces/Card';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Section } from '../../components/surfaces/Section';
import { useNavigation } from '../../hooks/useNavigation';
import { useWorkSetup } from './WorkSetupContext';

export function CanvasPage() {
  const { navigate } = useNavigation();
  const { canvasItems, clarifyAnswers, objective } = useWorkSetup();

  return (
    <PageContainer>
      <Section heading="Canvas" description="Review NOVA's current understanding before planning.">
        <Card heading="Objective"><p>{objective}</p></Card>
        <Card heading="Clarify answers">
          <ul>
            {clarifyAnswers.map((answer, index) => <li key={`${index}-${answer}`}>{answer || 'Skipped'}</li>)}
          </ul>
        </Card>
        {canvasItems.map((item) => (
          <Card key={item.id} heading={item.title}><p>{item.value}</p></Card>
        ))}
        <div>
          <Button variant="secondary" onClick={() => navigate('clarify')}>Back</Button>
          <Button onClick={() => navigate('plan')}>Prepare a plan</Button>
        </div>
      </Section>
    </PageContainer>
  );
}
