const width = 400, height = 400;// Hight and width of the canvas
const sz = 6, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

var x0, y0;
// grid parameters
const ticks = 4, subticks = 5*ticks, dx = 1/ticks, num_pts = 120;

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

$(document).ready(function() {
    initialize_canvas("standardBasis", width, height);
    //initialize_canvas("changedBasis", width, height);
    //initialize_canvas("vectors", width, height);

    context = d3.select("#standardBasis");
    drawStandardGrids();
    drawChangedGrids();

});

function drawStandardGrids(){
    context = d3.select("#standardBasis");
    pen.color(palette[0]).width("1px");
    grid([xmin, ymin], [xmax, ymax], [subticks, subticks]);
    pen.color(palette[0]).width("3px");
    grid([xmin, ymin], [xmax, ymax], [ticks, ticks]);
}

function drawChangedGrids(){
    context = d3.select("#changedBasis");
    pen.color(palette[1]).width("1px");
    

}
