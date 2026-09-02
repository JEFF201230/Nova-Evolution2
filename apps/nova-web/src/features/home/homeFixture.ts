export const homeFixture = {
  composer: {
    title: 'What would you like to achieve?',
    description:
      'Describe an objective to start the frontend Work Setup flow. Continuing does not create or execute a Runtime mission.',
    suggestions: [
      'Prepare a board presentation on Q3 results',
      'Analyse reasons for the drop in NPS',
      'Draft a proposal for a new supplier partnership',
    ],
  },
  loading: {
    title: 'Loading Home',
    description: 'Loading the Home interface.',
  },
  empty: {
    title: 'No active work yet',
    description: 'Home is waiting for the first objective to be loaded.',
  },
  error: {
    title: 'Home temporarily unavailable',
    description: 'The overview could not be rendered right now.',
  },
  blocked: {
    title: 'Home blocked',
    description: 'Home cannot continue in its current state.',
  },
} as const;
