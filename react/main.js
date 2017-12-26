import jQuery from 'jquery';
window.jQuery = jQuery;
import './random_colors';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
