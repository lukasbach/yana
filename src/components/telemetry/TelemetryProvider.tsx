import * as React from 'react';
import { useAppData, useSettings } from '../../appdata/AppDataProvider';
import pkg from '../../../package.json';
import { useContext, useEffect, useRef, useState } from 'react';
import { TelemetryEvents } from './TelemetryEvents';
import { LogService } from '../../common/LogService';

const logger = LogService.getLogger('Telemetry');

const GANALYTICS_PROP_ID = 'G-R573NDSFKR';
const APP_NAME = pkg.name;
const APP_VERSION = pkg.version;

export interface TelemetryContextValue {
  trackScreenView: (screenName: string) => void,
  trackEvent: (category: string, action: string) => void,
  trackEventWithValue: (category: string, action: string, label: string, value: string | number) => void,
  trackException: (error: string, fatal?: boolean) => void,
}

export const TelemetryContext = React.createContext<TelemetryContextValue>(null as any);

export const useTelemetry = () => useContext(TelemetryContext);

const gtag: (...args: any[]) => void = function() {
  (window as any).dataLayer.push(arguments);
};

export const install = (trackingId: string, userId: string) => {
  const scriptId = 'ga-gtag';

  if (document.getElementById(scriptId)) return;

  const {head} = document;
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  head.insertBefore(script, head.firstChild);

  (window as any).dataLayer = (window as any).dataLayer || [];

  gtag('js', new Date());
  gtag('config', trackingId, {
    'user_id': userId,
    'end_page_view': false,
  });
};

export let TelemetryService: TelemetryContextValue | undefined;

export const TelemetryProvider: React.FC<{}> = props => {
  const settings = useSettings();
  const appData = useAppData();
  const [ctxValue, setCtxValue] = useState<TelemetryContextValue>({
    trackEvent: () => { logger.log('Telemetry event not sent'); },
    trackEventWithValue: () => { logger.log('Telemetry event not sent'); },
    trackException: () => { logger.log('Telemetry event not sent'); },
    trackScreenView: () => { logger.log('Telemetry event not sent'); },
  });
  const telemetryId = appData.telemetryId;
  const useTelemetry = settings.telemetry;

  useEffect(() => {
    if (useTelemetry) {
      install(GANALYTICS_PROP_ID, telemetryId);
      logger.log(`Connected to telemetry with user ID "${telemetryId}".`);
      gtag('event', TelemetryEvents.App.init[1], {
        'event_category': TelemetryEvents.App.init[0],
      });

      const telemetry: TelemetryContextValue = {
        trackScreenView: (screenName) => {
          gtag('event', 'page_view', {
            'page_title': screenName,
            'page_location': screenName,
            'page_path': screenName,
            'send_to': GANALYTICS_PROP_ID
          });
          logger.log('trackScreenView', [], {screenName});
        },
        trackEvent: (category, action) => {
          gtag('event', action, {
            'event_category': category,
          });
          logger.log('trackEvent', [], {category, action});
        },
        trackEventWithValue: (category, action, label, value) => {
          gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
          });
          logger.log('trackEventWithValue', [], {category, action, label, value});
        },
        trackException: (error, fatal) => {
          gtag('event', 'exception', {
            'description': error,
            'fatal': fatal
          });
          logger.log('trackException', [], {error, fatal});
        },
      };

      setCtxValue(telemetry);
      TelemetryService = telemetry;
    }
  }, []);

  return (
    <TelemetryContext.Provider value={ctxValue}>
      { props.children }
    </TelemetryContext.Provider>
  );
};
