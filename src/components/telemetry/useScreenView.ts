import { useTelemetry } from './TelemetryProvider';
import { useEffect } from 'react';

export const useScreenView = (screenName: string, deps: string[] = []) => {
  const telemetry = useTelemetry();
  useEffect(() => {
    telemetry.trackScreenView(screenName);
  }, deps);
};
