var width = 400, height = 400;
var sz = 2, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

var x0, y0, grid_idx;
// grid parameters
var ticks = 4, dx = 1/ticks, num_pts = 120;

var freeze = false; // fix mouse position?

// Matrix 
var matrix = [[],[]];
//
var mode;
// Colors for arrows
const pen1 = "#6A0DAD", pen2 = "#31906E", pen3 = "#0000FF",pen4 ="#ADD8E6";// Colorcode for pens. Pen1 is Bright Purple, Pen2 is DarkMint

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

$(document).ready(function() {
    // html file contains svg element with id "canvas"
    
    initialize_canvas("domain", width, height);
    initialize_canvas("target", width, height);

    context = d3.select("#domain");
    context.on("click", toggle_freeze)
	.on("mousemove", draw_canvas);
    draw_grids(); 
    draw_canvas();
    make_coefficient_table();
    //set_coefficients();
    generate_Matrix()
    
});

function generate_Matrix()
{
    matrix[0][0] = parseFloat($("#a11").val());
    matrix[0][1] = parseFloat($("#a12").val());
    matrix[1][0] = parseFloat($("#a21").val());
    matrix[1][1] = parseFloat($("#a22").val());
}

function make_coefficient_table()
{
    // Create code for a 2 x 2 HTML table to collect the matrix coefficients
    var message = '<table>\n';
    for (var i = 1; i <= 2; ++i) // row index
    {
	message += '<tr>\n';
	for (var j = 1; j <= 2; ++j) // column index
	{
	    /*
	     * The table has one <td> element for each coefficient.
	     * The <td> element in the i-th row and j-th column is coded by
	     * \(a_{ij}=\)<input name="aij" size="2" type="text" id="aij" onchange="set_aij()" value="coeff" />
	     *
	     * The coefficient is the remainider of 1 + i + j on division by 2,
	     * i.e., the entry of the identity matrix.
	     * Note that the generated code sets the name and id of the element
	     * so we can refer to it later if needed; the code also binds the
	     * callback function set_aij(), so that when the user changes the
	     * field the interval value updates automatically. This is what I
	     * meant today about Javascript can write HTML that itself responds
	     * to user actions.
	     * The set_aij() functions are written separately, and use jquery
	     * to find the corresponding document element and get its value.
	     */

	    // Generate the HTML element name and the default value
	    var nm='a' + i + j,
		coeff = -((1 + i + j) )% 2;
	    // Compose the <td> line
	    message += '<td>\n';
	    message += '\\(a_{' + i + j + '} = \\)'; // MathJaX string
	    message += '<input name="' + nm + '" size="2" type="text" id="';
	    message += nm + '" onchange="generate_Matrix()" value ="';
	    message += coeff + '" />\n';
	    message += '</td>\n';
	}
	message += '</tr>\n';
    }
    message += '</table>\n';

    $("#coefficients").html(message);
}

function calculateT(u, v)
{
    return [matrix[0][0] * u + matrix[0][1] *v, matrix[1][0] * u + matrix[1][1] * v];
}

function toggle_freeze()
{
    freeze = !freeze;
}

function draw_one_grid()
{
    pen.color("#888").width("1px").opacity(1);
    grid([xmin, ymin], [xmax, ymax], [5*ticks, 5*ticks]);

    pen.color("black").width("3px");
    grid([xmin, ymin], [xmax, ymax], [ticks, ticks]);
}

function draw_grids()
{
    context = d3.select("#domain");
    context.selectAll("circle").remove();
    context.selectAll("line").remove();

    pen.opacity(1);
    draw_one_grid();

    context = d3.select("#target");
    context.selectAll("path").remove();
    context.selectAll("line").remove();
    draw_one_grid();
}

function draw_canvas()
{
    if (!freeze)
    {
	var m = d3.mouse(this);
	[x0, y0] = [rect_map.x(m[0]), rect_map.y(m[1])];
    }
    draw_grids();

    if(mode== "ordinary"){
        drawOrdinary();
    }else if(mode== "unit"){
        drawUnit()
    }
}

function drawOrdinary(){
   
    context = d3.select("#domain");
    context.selectAll("path").remove();
   
    context = d3.select("#domain");
    pen.color(pen1).width("2px");
    arrow([0, 0], [x0, y0]);

    context = d3.select("#target");
    context.selectAll("path").remove();

    pen.color(pen1).width("2px");
    // arrow([0, 0], [x0, y0]);
    arrow ([0,0],[x0,y0]);

    pen.color(pen2).width("4px");
    arrow([0, 0], calculateT(x0, y0));	
}

function drawUnit(){
    var norm = Math.sqrt(x0*x0+y0*y0);
    context = d3.select("#domain");
    context.selectAll("path").remove();
    
    context = d3.select("#domain");
    pen.color(pen3).width("1px").fill(pen4).opacity(0.5);
    circle([0, 0], 1);
    

    pen.color(pen1).width("2px").opacity(1);
    arrow([0, 0], [x0/norm, y0/norm]);

    context = d3.select("#target");
    context.selectAll("path").remove();

    pen.color(pen1).width("2px").opacity(1);
    // arrow([0, 0], [x0, y0]);
    arrow ([0,0],[x0/norm,y0/norm]);

    pen.color(pen2).width("4px").opacity(1);
    arrow([0, 0], calculateT(x0/norm, y0/norm));
    
    var bd = [];
    var numPts = 120;
    var dTheta = 2*Math.PI/numPts;
    for (var i=0; i<=numPts;i++){
        bd.push(calculateT(Math.cos(i*dTheta),Math.sin(i*dTheta))); 
    }
    pen.color(pen3).width("1px").fill(pen4).opacity(0.5);
    polyline(bd);
}

function make_menu()
{
    $("#modeMenu").change(function() {
	mode = $("#modeMenu").find("option:selected").val();
	if (mode == "ordinary")
        mode = "ordinary"
	else if (mode == "unit")
        mode = "unit"
    });
}

