var width = 400, height = 400;
var sz = 6, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

var x0, y0;
// grid parameters
var ticks = 4, subticks = 5*ticks, dx = 1/ticks, num_pts = 120;

$(document).ready(function() {
    initialize_canvas("standardBasis", width, height);
    initialize_canvas("changedBasis", width, height);
    initialize_canvas("vectors", width, height);

    context = d3.select("#standardBasis");

});
