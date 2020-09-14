import React from 'react';
import ReactDOM from 'react-dom';
import { LayoutContainer } from './components/layout/LayoutContainer';
import { AppDataProvider } from './appdata/AppDataProvider';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import { DataInterfaceProvider } from './datasource/DataInterface';

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

ReactDOM.render(
  <AppDataProvider>
    <DataInterfaceProvider>
      <LayoutContainer>abc</LayoutContainer>
    </DataInterfaceProvider>
  </AppDataProvider>,
  document.getElementById('root')
);
