window.getRandomColor = function() {
  var CSS_COLORS = ['red', 'yellow', 'green', '#ff00a3', '#ff00d2', '#ff00f6', '#de00ff', '#b400ff', '#8a00ff', '#4e00ff', '#007dff', '#00b8ff'];
  var random_color = CSS_COLORS[Math.floor(Math.random()*CSS_COLORS.length)];
  return random_color;
};
