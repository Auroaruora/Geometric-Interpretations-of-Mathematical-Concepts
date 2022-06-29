// Hight and width of the canvas
const width = 400, height = 400;

//coordinate range for the canvas
const sz = 5, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

//mouse location on canvas
var x0, y0;
// grid parameters
var ticks = 4, subticks = 5*ticks, dx = 1/ticks, num_pts = 120;

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

$(document).ready(function() {
    
    initialize_canvas("coordinate", width, height);
    initialize_canvas("eigenvector", width, height);
    //bound function to some mouse events.
    //draw useful information
    drawcoordinate();
    drawStandardBasis();
});

function drawcoordinate(){
    context = d3.select("#coordinate");
    pen.color(palette[0]).width("1px").opacity(1);
    grid([xmin, ymin], [xmax, ymax], [subticks, subticks]);
    pen.color(palette[0]).width("3px");
    grid([xmin, ymin], [xmax, ymax], [ticks, ticks]);
}

function drawStandardBasis(){
    context = d3.select("#coordinate");
    pen.color(palette[7]).width("4px").opacity(1);
    arrow([0, 0], [0,1]);
    arrow([0, 0], [1,0]);
}