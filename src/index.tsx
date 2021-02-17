import React from 'react';
import ReactDOM from 'react-dom';
import { LayoutContainer } from './components/layout/LayoutContainer';
import { AppDataProvider } from './appdata/AppDataProvider';
import { DataInterfaceProvider } from './datasource/DataInterfaceContext';
import { defaultTheme, ThemeContext, ThemeProvider } from './common/theming';
import { MainContentContextProvider } from './components/mainContent/context';
import { Alerter } from './components/Alerter';
import { DropZoneContainer } from './components/dropZone/DropZoneContainer';
import { DevToolsContextProvider } from './components/devtools/DevToolsContextProvider';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { OverlaySearchProvider } from './components/overlaySearch/OverlaySearchProvider';
import { registerCommonContextMenu } from './components/commonContextMenu/registerCommonContextMenu';
import { SpotlightContainer } from './components/spotlight/SpotlightContainer';
import { TelemetryProvider } from './components/telemetry/TelemetryProvider';
import { AppNotifications } from './components/notifications/AppNotifications';
// @ts-ignore
import {IntlProvider} from 'react-intl';
import pkg from '../package.json';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'animate.css/animate.min.css';

(window as any).ELECTRON_DISABLE_SECURITY_WARNINGS = true;

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

// if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: "https://013c5132a6d340ef97c62dd74d5afa02@o227507.ingest.sentry.io/5604989",
    release: `yana@${pkg.version}`,
    autoSessionTracking: true,
    integrations: [
      new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: .4,
  });
// }

registerCommonContextMenu();

// TODO closing a open tab removes its file contents, because the editor isnt mounted anymore and the content getter returns {}, which overwrites the previous content
ReactDOM.render(
  <IntlProvider locale='en'>
    <AppDataProvider>
      <TelemetryProvider>
        <AppNotifications />
        <ThemeProvider>
          <DevToolsContextProvider>
            <DataInterfaceProvider>
              <MainContentContextProvider>
                <SpotlightContainer>
                  <OverlaySearchProvider>
                    <LayoutContainer />
                    <Alerter.Instance.Container />
                    <DropZoneContainer />
                  </OverlaySearchProvider>
                </SpotlightContainer>
              </MainContentContextProvider>
            </DataInterfaceProvider>
          </DevToolsContextProvider>
        </ThemeProvider>
      </TelemetryProvider>
    </AppDataProvider>
  </IntlProvider>,
  document.getElementById('root')
);
