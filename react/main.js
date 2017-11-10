import jQuery from 'jquery';
window.jQuery = jQuery;

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/Gallery';

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

jQuery(function() {
  jQuery(document).click(function() {
    var color = getRandomColor();
    var value = '-1px 0 ' + color + ', 0 1px ' + color + ', 1px 0 ' + color + ', 0 -1px ' + color;
    jQuery('.first-letter').css('text-shadow', value)
  });
});
