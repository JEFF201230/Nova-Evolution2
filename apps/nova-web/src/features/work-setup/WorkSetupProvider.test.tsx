import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useWorkSetup } from './WorkSetupContext';
import { WorkSetupProvider } from './WorkSetupProvider';

function WorkSetupProbe() {
  const workSetup = useWorkSetup();

  return (
    <div>
      <output data-testid="objective">{workSetup.objective}</output>
      <output data-testid="answers">{JSON.stringify(workSetup.clarifyAnswers)}</output>
      <output data-testid="canvas">{JSON.stringify(workSetup.canvasItems)}</output>
      <output data-testid="autonomy">{workSetup.selectedAutonomyLevel}</output>
      <button type="button" onClick={() => workSetup.setObjective('Certified objective')}>Set objective</button>
      <button type="button" onClick={() => workSetup.setClarifyAnswer(1, 'Certified answer')}>Set answer</button>
      <button
        type="button"
        onClick={() => workSetup.setCanvasItem({ id: 'risk', title: 'Risk', value: 'Controlled' })}
      >
        Set canvas item
      </button>
      <button type="button" onClick={() => workSetup.setAutonomyLevel(2)}>Set autonomy</button>
      <button type="button" onClick={workSetup.resetWorkSetup}>Reset</button>
    </div>
  );
}

describe('WorkSetupProvider', () => {
  it('keeps strict Work Setup state and supports every operation', async () => {
    const user = userEvent.setup();

    render(
      <WorkSetupProvider>
        <WorkSetupProbe />
      </WorkSetupProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Set objective' }));
    await user.click(screen.getByRole('button', { name: 'Set answer' }));
    await user.click(screen.getByRole('button', { name: 'Set canvas item' }));
    await user.click(screen.getByRole('button', { name: 'Set autonomy' }));

    expect(screen.getByTestId('objective')).toHaveTextContent('Certified objective');
    expect(screen.getByTestId('answers')).toHaveTextContent('Certified answer');
    expect(screen.getByTestId('canvas')).toHaveTextContent('"id":"risk"');
    expect(screen.getByTestId('autonomy')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByTestId('objective')).toBeEmptyDOMElement();
    expect(screen.getByTestId('answers')).toHaveTextContent('[]');
    expect(screen.getByTestId('canvas')).not.toHaveTextContent('"id":"risk"');
    expect(screen.getByTestId('autonomy')).toHaveTextContent('1');
  });
});
