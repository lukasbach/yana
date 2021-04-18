import { SpotlightScenarioId } from './SpotlightScenarioId';
import React from 'react';
import { Actions } from '@atlaskit/onboarding/types';
import { Theme } from '../../common/theming';

export type SpotlightStepComponent = React.FC<{
  nextStep: () => void;
  previousStep: () => void;
  defaultActions: Actions;
  theme: Theme;
}>;

export interface SpotlightScenario {
  id: SpotlightScenarioId;
  steps: Array<SpotlightStepComponent>;
}
