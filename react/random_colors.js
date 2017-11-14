import jQuery from 'jquery';
window.jQuery = jQuery;

var getRandomColor = function() {
  var CSS_COLORS = ['#ff0', '#ff00a3', '#ff00d2', '#ff00f6', '#de00ff', '#b400ff', '#8a00ff', '#4e00ff', '#007dff', '#00b8ff'];
  var random_color = CSS_COLORS[Math.floor(Math.random()*CSS_COLORS.length)];
  return random_color;
};

jQuery(function() {
  jQuery(document).click(function() {
    var color = getRandomColor();
    var value = '-1px 0 ' + color + ', 0 1px ' + color + ', 1px 0 ' + color + ', 0 -1px ' + color;
    jQuery('.first-letter').css('text-shadow', value);
    jQuery('.download-link').css('color', color);
  });
});

var getRandomColors = function(number) {
  var colors = [];
  for(var i=0; i < number; i++){
    colors[i] = getRandomColor();
  };
  return colors;
}

// could use the real gallery count as argument,
// but too much overhead for few milliseconds
window.randomColors = getRandomColors(1000);
