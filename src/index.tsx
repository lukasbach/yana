import React from 'react';
import ReactDOM from 'react-dom';
import { LayoutContainer } from './components/layout/LayoutContainer';

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

ReactDOM.render(
  <LayoutContainer>
      abc
  </LayoutContainer>,
  document.getElementById('root')
);
