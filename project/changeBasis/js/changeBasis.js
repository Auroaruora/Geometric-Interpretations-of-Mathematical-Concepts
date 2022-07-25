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
var u1 = [];
var u2 = [];
var inverseMatrix = [[new Ratl(0,0),new Ratl(0,0)],[new Ratl(0,0),new Ratl(0,0)]];
var coefficent = [];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();
var layernum= 10;

$(document).ready(function() { 
    
    initialize_canvas("standardBasis", width, height);
    drawStandardGrids();
    initialize_canvas("changedBasis", width, height);
    initialize_canvas("vectors", width, height);
    reset();
    //bound function to some mouse events.
    context = d3.select("#vectors");
    context.on("click", freezeV)
           .on("mousemove", drawV);
    
    //draw useful information
});

function display(name){
    layernum = layernum+1;
    $(name).css("z-index",layernum);
}

function drawStandardGrids(){
    context = d3.select("#standardBasis");
    pen.color(palette[0]).width("2px");
    grid([xmin, ymin], [xmax, ymax], [ticks, ticks]);
    pen.width("4px");
    line([xmin, 0],[xmax,0]);
    line([0, ymin],[0,ymax]);
}

function reset(){
    assignMatrix();
    updateMatrix();
    drawBasis();
}
function assignMatrix()
{
    basis[0][0] = parseFloat($("#u11").val());
    basis[1][0] = parseFloat($("#u12").val());
    basis[0][1] = parseFloat($("#u21").val());
    basis[1][1] = parseFloat($("#u22").val());
    u1=[basis[0][0],basis[1][0]];
    u2=[basis[0][1], basis[1][1]];
    var u11 = basis[0][0],
        u12 = basis[0][1],
        u21 = basis[1][0],
        u22 = basis[1][1];
    var det = u11*u22 - u21*u12 ;
    // computeInverse
    if(det!=0){
        inverseMatrix[0][0].change(u22,det);
        inverseMatrix[0][1].change(-u12,det);
        inverseMatrix[1][0].change(-u21,det);
        inverseMatrix[1][1].change(u11,det);
    }else{
        //Notice 0/0 means invalid
        inverseMatrix[0][0].change(0,0);
        inverseMatrix[0][0].change(0,0);
        inverseMatrix[0][0].change(0,0);
        inverseMatrix[0][0].change(0,0);
    }
}
function updateMatrix(){
    var det = basis[0][0]*basis[1][1] - basis[1][0] * basis[0][1];
    // Do whatever with these values, then write the matrices P and P^{-1}
    var temp = printMatrix(basis);
    $("#ItransAtoS").html(temp);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"ItransAtoS"]);
    // P is invertible; write code for P^{-1}
    if (det != 0) {
	   temp = printMatrix(inverseMatrix);
    }else{
        temp = "Not Invertable. Try another basis."
    }
    $("#ItransStoA").html(temp); // write into the document
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"ItransStoA"]);
}
// compute gcd of two positive integers, no safety checks
function printEntry(arg)
{
    if (typeof(arg) === 'number')
	return "" + arg;

    else
    {
	var num = arg.m_num,
	    denom = arg.m_denom,
	    cdiv = gcd(num, denom);

	num = num/cdiv;
	denom = denom/cdiv;
	if (denom < 0)
	{
	    num *= -1;
	    denom *= -1;
	}
	var val = "" + num;
	if (denom != 1)
	    val += "/" + denom;

	return val;
    }
}
function printMatrix(A){
    var info = "$\\left[\\begin{array}{@{}rr@{}}";
    info += printEntry(A[0][0]) + "&" + printEntry(A[0][1]) + "\\\\";
    info += printEntry(A[1][0]) + "&" + printEntry(A[1][1]) + "\\\\ \\end{array}\\right]$";
    return info;
}
function drawBasis(){
    context = d3.select("#vectors");
    context.selectAll("path").remove();
    context.selectAll("line").remove();

    pen.color(palette[4]).width("4px");
    drawLine([0,0],u1);
    drawLine([0,0],u2);

    pen.color(palette[8]).width("5px");
    higlightableArrow([0, 0], u1,"u1");
    higlightableArrow([0, 0], u2,"u2"); 
}

function drawV(){
    //select the vectors convas
    if (!freeze){
        var m = d3.mouse(this);
        x0 = rect_map.x(m[0]).toFixed(2);
        y0 = rect_map.y(m[1]).toFixed(2);
        //redraw the basis (will remove all existing vectors on canvas before redraw)
        drawBasis();

        //draw current vector
        pen.color(palette[7]).width("4px");
        arrow([0, 0],[x0,y0]);

        //draw auxiliary line
        var v11 = inverseMatrix[0][0].toFloat(),
            v12 = inverseMatrix[0][1].toFloat(),
            v21 = inverseMatrix[1][0].toFloat(),
            v22 = inverseMatrix[1][1].toFloat();

        coefficent[0]= v11 * x0 + v12 * y0;
        coefficent[1]= v21* x0 + v22 * y0;
        arrow([0,0],[coefficent[0]*basis[0][0],coefficent[0]*basis[1][0]]);
        
        arrow([0,0],[coefficent[1]*basis[0][1],coefficent[1]*basis[1][1]]);
    }
 
}

function freezeV(){
    freeze = !freeze;
    if (freeze){
        infoV();
    }else{
        $("#infoV").html("Show information when the vector is fixed..."); 
    }
}
function infoV(){
    /* To-do information in ipad */
    var infoString = "<p> $\\Vec{v}$ = ("+x0+","+y0+"2)</p>"
    infoString += "<p>$\\Vec{v}$ in terms of $\\std$ basis: </p>"
    infoString += "<p>$\\Vec{v}$ = "+x0+"$\\Vec{e_1}$ + "+y0+" $\\Vec{e_2}$ </p>"
    $("#infoV").html(infoString); // write into the document
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"infoV"]);
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
        drawLine(Mult(i,u2),Sum(Mult(i,u2),u1))
        drawLine(Mult(i,u1),Sum(Mult(i,u1),u2))
    }
    }
    
}
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

function higlightableArrow(tail, head, ident)
{
    arrow(tail, head, ident);
    $("#" + ident).bind("mouseover", function() {
        $("#" + ident).css({"stroke-width": "10"});
    })
    .bind("mouseout", function() {
        $("#" + ident).css({"stroke-width": "5"});
    });
}



