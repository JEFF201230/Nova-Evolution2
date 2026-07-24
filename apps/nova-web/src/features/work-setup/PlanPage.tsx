import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/surfaces/Card';
import { PageContainer } from '../../components/surfaces/PageContainer';
import { Section } from '../../components/surfaces/Section';
import { useNavigation } from '../../hooks/useNavigation';
import { workSetupPlanPhases } from './workSetupFixtures';

export function PlanPage() {
  const { navigate } = useNavigation();

  return (
    <PageContainer>
      <Section heading="Plan" description="Review the temporary work phases before confirmation.">
        {workSetupPlanPhases.map((phase, index) => (
          <Card key={phase.id} heading={phase.title} description={phase.description}>
            <Badge size="sm" tone="neutral">Phase {index + 1}</Badge>
          </Card>
        ))}
        <div>
          <Button variant="secondary" onClick={() => navigate('canvas')}>Back</Button>
          <Button onClick={() => navigate('confirm')}>Continue to confirm</Button>
        </div>
      </Section>
    </PageContainer>
  );
}
