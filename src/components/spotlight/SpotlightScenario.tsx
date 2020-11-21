import { SpotlightScenarioId } from './SpotlightScenarioId';
import React from 'react';
import { Actions } from '@atlaskit/onboarding/types';

export type SpotlightStepComponent = React.FC<{
  nextStep: () => void,
  previousStep: () => void,
  defaultActions: Actions
}>;

export interface SpotlightScenario {
  id: SpotlightScenarioId,
  steps: Array<SpotlightStepComponent>,
}