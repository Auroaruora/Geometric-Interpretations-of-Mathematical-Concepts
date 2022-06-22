const width = 400, height = 400;// Hight and width of the canvas
const sz = 10, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

var x0, y0;
// grid parameters
const ticks = 4, subticks = 5*ticks, dx = 1/ticks, num_pts = 120;

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var basis = [[],[]];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

$(document).ready(function() {
    initialize_canvas("standardBasis", width, height);
    initialize_canvas("changedBasis", width, height);
    initialize_canvas("vectors", width, height);

    drawStandardGrids();
    generateBasis();
    drawBasis();
    drawChangedGrids();

});

function drawStandardGrids(){
    context = d3.select("#standardBasis");
    pen.color(palette[0]).width("1px");
    grid([xmin, ymin], [xmax, ymax], [subticks, subticks]);
    pen.color(palette[0]).width("3px");
    grid([xmin, ymin], [xmax, ymax], [ticks, ticks]);
}
function generateBasis(){
   
    basis[0][0] = parseFloat($("#u11").val());
    basis[0][1] = parseFloat($("#u12").val());
    basis[1][0] = parseFloat($("#u21").val());
    basis[1][1] = parseFloat($("#u22").val());
}

function drawBasis(){
   
    context = d3.select("#vectors");
    pen.color(palette[2]).width("2px");
    arrow([0, 0], basis[0]);
    arrow([0, 0], basis[1]);
}

function drawChangedGrids(arg1,arg2){
    context = d3.select("#changedBasis");
    pen.color(palette[1]).width("1px");

    var dir = Diff(arg2, arg1);
    var a1 = dir[0], 
        b1 = dir[1],
        a2 = arg2[0], 
        b2 = arg2[1];

    smin = (xmin - a2)/a1,
    smax = (xmax - a2)/a1,
    SMIN = min(smin, smax),
    SMAX = max(smin, smax),
    tmin = (ymin - b2)/b1,
    tmax = (ymax - b2)/b1,
    TMIN = min(tmin, tmax),
    TMAX = max(tmin, tmax),
    UMIN = max(SMIN, TMIN),
    UMAX = min(SMAX, TMAX);

  var p1 = Sum(arg2, Mult(UMIN, dir)),
  p2 = Sum(arg2, Mult(UMAX, dir));
  line(p1, p2);
}


