// Hight and width of the canvas
const width = 400, height = 400;

//coordinate range for the canvas
const sz = 5, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

//mouse location on canvas
var x0, y0;
// grid parameters
const ticks = 2*sz, dx = 1/ticks, num_pts = 120;

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

//boolean value to control certain state
var freeze = false; 
var showGrid = false;

var basis = [[],[]];
var inverseMatrix = [[],[]];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

$(document).ready(function() {
    
    initialize_canvas("standardBasis", width, height);
    initialize_canvas("changedBasis", width, height);
    initialize_canvas("info", width, height);
    initialize_canvas("interact", width, height);

    //bound function to some mouse events.
    context = d3.select("#interact");
    context.on("click", freezeV)
           .on("mousemove", drawV);

    //draw useful information
    drawStandardGrids();
    BasisInfo();
   

});

function freezeV(){
    freeze = !freeze;
}

function drawV(){
    //select the vectors convas
    if (!freeze){
        context = d3.select("#interact");

        //remove all the pervious vectors on "vectors" layer
        context.selectAll("path").remove();

        //draw current vector
        pen.color(palette[7]).width("4px");
        var m = d3.mouse(this);
        arrow([0, 0],[rect_map.x(m[0]), rect_map.y(m[1])]);
    }
}

function drawStandardGrids(){
    context = d3.select("#standardBasis");
    pen.color(palette[0]).width("2px");
    grid([xmin, ymin], [xmax, ymax], [ticks, ticks]);
    pen.width("4px");
    line([xmin, 0],[xmax,0]);
    line([0, ymin],[0,ymax]);
}

function changeBasis(){
    basis[0][0] = parseFloat($("#u11").val());
    basis[0][1] = parseFloat($("#u12").val());
    basis[1][0] = parseFloat($("#u21").val());
    basis[1][1] = parseFloat($("#u22").val());
}
/*
 * This function writes LaTeX code for transition matrices P and P^{-1} into
 * a document element with id="transition_matrices". It assumes all vectors
 * have integer entries, so the determinant of the new basis is an integer.
 * The result is mathematically correct if this condition is not met, but the 
 * typographical result may look strange.
 */

function updateMatrix()
{
    // computeInverse
    var u11 = basis[0][0],
        u12 = basis[1][0],
        u21 = basis[0][1],
        u22 = basis[1][1];
    var det = u11*u22 - u21*u12 ;
    if(det!=0){
        inverseMatrix[0][0] = new Ratl(u22/det);
        inverseMatrix[0][1] = new Ratl(u21/det);
        inverseMatrix[1][0] = new Ratl(u12/det);
        inverseMatrix[1][1] = new Ratl(u11/det);
    }

    // Do whatever with these values, then write the matrices P and P^{-1}
    var matrixString = "$$P = \\left[\\begin{array}{@{}rr@{}}";
    matrixString += u11 + "&" + u12 + "\\\\";
    matrixString += u21 + "&" + u22 + "\\\\ \\end{array}\\right]";
    
    // P is invertible; write code for P^{-1}
    if (det != 0) {
	    matrixString += ",\\qquad P^{-1} = ";

	    matrixString += "\\left[\\begin{array}{@{}rr@{}}";
	    matrixString +=  inverseMatrix[0][0]+ "&" +  inverseMatrix[0][1] + "\\\\";
	    matrixString +=  inverseMatrix[1][0] + "&" +   inverseMatrix[1][1] + "\\\\ \\end{array}\\right]";
    }else{
        matrixString += "P is not invertible."
    }
    matrixString += ".$$"; // close up displayed equation

    $("#transitionMatrices").html(matrixString); // write into the document
    //MathJax.typeset(); // and typeset
}

function BasisInfo(){
    //set the basis to the current
    changeBasis();
    updateMatrix();
    context = d3.select("#info");
    context.selectAll("path").remove();

    pen.color(palette[4]).width("4px");
    drawLine([0,0],basis[0]);
    drawLine([0,0],basis[1]);

    pen.color(palette[8]).width("5px");
    arrow([0, 0], basis[0]);
    arrow([0, 0], basis[1]); 

    
}

function showHideChangeGrid(){
    showGrid =!showGrid;
    //remove the previous grids
    context = d3.select("#changedBasis");
    context.selectAll("line").remove();
    if(showGrid){
    //genarate the current grids in a loop
    pen.color(palette[3]).width("2px");
    for(var i = -15; i < 15;i++){
        drawLine(Mult(i,basis[1]),Sum(Mult(i,basis[1]),basis[0]))
        drawLine(Mult(i,basis[0]),Sum(Mult(i,basis[0]),basis[1]))
    }
    }
    
}

//draw a stright line across 2 points
//arg1 is a coordinate of a point 
//arg2 is a coordinate of another point
function drawLine(arg1,arg2){
   
    var dir = Diff(arg2,arg1);
    var a1 = dir[0], 
        b1 = dir[1],
        a2 = arg2[0], 
        b2 = arg2[1];

        smin = (xmin - a2)/a1,
        smax = (xmax - a2)/a1,
        SMIN = Math.min(smin, smax),
        SMAX = Math.max(smin, smax),
        tmin = (ymin - b2)/b1,
        tmax = (ymax - b2)/b1,
        TMIN = Math.min(tmin, tmax),
        TMAX = Math.max(tmin, tmax),
        UMIN = Math.max(SMIN, TMIN),
        UMAX = Math.min(SMAX, TMAX);
    
    var p1 = Sum(arg2, Mult(UMIN, dir)),
        p2 = Sum(arg2, Mult(UMAX, dir));
      
        line(p1, p2);
}

