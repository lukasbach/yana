import React from 'react';
import ReactDOM from 'react-dom';

console.log('process.env.NODE_ENV=', process.env.NODE_ENV);

ReactDOM.render(
  <div>
    <h1>All your bases are belong to us</h1>
  </div>,
  document.getElementById('root')
);
