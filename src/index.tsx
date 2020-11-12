import React from 'react';
import ReactDOM from 'react-dom';
import { LayoutContainer } from './components/layout/LayoutContainer';
import { AppDataProvider } from './appdata/AppDataProvider';
import { DataInterfaceProvider } from './datasource/DataInterfaceContext';
import { defaultTheme, ThemeContext, ThemeProvider } from './common/theming';
import { MainContentContextProvider } from './components/mainContent/context';
import { Alerter } from './components/Alerter';
import { DropZoneContainer } from './components/dropZone/DropZoneContainer';
import { remote } from 'electron';
import { ContextMenu, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { DevToolsContextProvider } from './components/devtools/DevToolsContextProvider';
// @ts-ignore
import {IntlProvider} from 'react-intl';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'animate.css/animate.min.css';
import { OverlaySearch } from './components/overlaySearch/OverlaySearch';
import { OverlaySearchProvider } from './components/overlaySearch/OverlaySearchProvider';

(window as any).ELECTRON_DISABLE_SECURITY_WARNINGS = true;

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

remote.getCurrentWebContents().on('context-menu', (event, params) => {
  if (params.misspelledWord) {
    ContextMenu.show((
      <Menu>
        {
          params.dictionarySuggestions.length ? (
            params.dictionarySuggestions.map(sugg => (
              <MenuItem
                key={sugg}
                text={sugg}
                onClick={() => remote.getCurrentWebContents().replaceMisspelling(sugg)}
              />
            ))
          ) : (
            <MenuItem text="No suggestions available" disabled />
          )
        }
        <MenuDivider />
        <MenuItem
          onClick={() => remote.getCurrentWebContents().session.addWordToSpellCheckerDictionary(params.misspelledWord)}
          text={`Add to the dictionary`}
        />
      </Menu>
    ), { top: params.y, left: params.x});
  }
});

// TODO closing a open tab removes its file contents, because the editor isnt mounted anymore and the content getter returns {}, which overwrites the previous content
ReactDOM.render(
  <IntlProvider locale='en'>
    <AppDataProvider>
      <ThemeProvider>
        <DevToolsContextProvider>
          <DataInterfaceProvider>
            <MainContentContextProvider>
              <OverlaySearchProvider>
                <LayoutContainer />
                <Alerter.Instance.Container />
                <DropZoneContainer />
              </OverlaySearchProvider>
            </MainContentContextProvider>
          </DataInterfaceProvider>
        </DevToolsContextProvider>
      </ThemeProvider>
    </AppDataProvider>
  </IntlProvider>,
  document.getElementById('root')
);
