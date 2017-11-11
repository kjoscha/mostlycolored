import jQuery from 'jquery';
window.jQuery = jQuery;

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/Gallery';

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
