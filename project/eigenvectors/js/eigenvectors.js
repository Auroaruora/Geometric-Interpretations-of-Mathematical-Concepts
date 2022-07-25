var width = 400, height = 400;
var sz = 6, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

var x0, y0;
// grid parameters
var ticks = 4, subticks = 5*ticks, dx = 1/ticks, num_pts = 120;

var freeze = false; // fix mouse position?

// Matrix 
var matrix = [[],[]];

// Eigenvalues
var Eigenvalues = [[],[]]

// vectors we'll draw
var vector_list = []

// Colors for arrows
//const pen1 = "#6A0DAD", pen2 = "#31906E", pen3 = "#0000FF",pen4 ="#ADD8E6";// Colorcode for pens. Pen1 is Bright Purple, Pen2 is DarkMint
// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

// Define these for backward compatibility
var pen1 = palette[9],
    pen2 = palette[7],
    pen3 = palette[3],
    pen4 = palette[2];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

var layernum = 10;

$(document).ready(function() {
    // html file contains svg element with id "canvas"
    
    initialize_canvas("domain", width, height);
    initialize_canvas("target", width, height);

    context = d3.select("#domain");
    context.on("click", toggle_freeze)
    /* Bind a function to the double-click event */
	.on("dblclick", add_vector)
	.on("mousemove", draw_canvas);
    make_menu();
    draw_grids();
    make_coefficient_table();
    //set_coefficients();
    generate_Matrix()
    solve ()
});

function display(name){
    layernum = layernum+1;
    $(name).css("z-index",layernum);
}

function solve(){
    var trA = matrix[0][0] + matrix[1][1],
        detA = matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0];
    var test = trA*trA-4*detA;
    var message;
    message +='<p> ';
    if(test < 0){
        message+='There is no eigenvalue for this matrix.';
    }else if(test == 0){
        message+='There is one eigenvalue for this matrix.';
        if(Math.sqrt(test) % 1 === 0){
            var numerator = trA + Math.sqrt(test);
            if(numerator%2==0){
                var sol = numerator/2;
                message+= sol;
            }else{
                message+='$\\frac{' + numerator + '}{2}'
            }
            
        }else{
            message+='$\\frac{1}{2}[' + trA + '+\\sqrt{' + test + '}]$';
        }
        
        
    }else{
        message+='There are two eigenvalue for this matrix.'
        if(Math.sqrt(test) % 1 === 0){
            var numerator1 = trA + Math.sqrt(test);
            var numerator2 = trA - Math.sqrt(test);
            if(numerator1%2==0){
                var sol = numerator1 / 2;
                message+= sol;
            }else{
                message+='$\\frac{' + numerator1 + '}{2}'
            }

            if(numerator2%2==0){
                var sol = numerator2 / 2;
                message+= sol;
            }else{
                message+='$\\frac{' + numerator2 + '}{2}'
            }
            
        }else{
            message+='$\\frac{1}{2}[' + trA + '+\\sqrt{' + test + '}]$, ';
            message+='$\\frac{1}{2}[' + trA + '-\\sqrt{' + test + '}]$';
        }
    }
    message +='</p>'
    $("#numEigenvectors").html(message);

}

function generate_Matrix()
{
    matrix[0][0] = parseFloat($("#a11").val());
    matrix[0][1] = parseFloat($("#a12").val());
    matrix[1][0] = parseFloat($("#a21").val());
    matrix[1][1] = parseFloat($("#a22").val());

    /* If matrix changes, re-set the list of vectors to be drawn */
    vector_list = [];
    solve();
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
		//coeff = -((1 + i + j) )% 2;
		/* Randomly generate initial matrix entrues */
		coeff = Math.round(4*(-1+2*Math.random()));
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

/* Function to calculate the determinant of two vectors */
function determinant(arg1, arg2)
{
    return Math.abs(arg1[0]*arg2[1] - arg1[1]*arg2[0]);
}

/* Boolean test for proportionality of two vectors */
function proportional(arg1, arg2)
{
    return determinant(arg1, arg2) < 0.01;
}

function toggle_freeze()
{
    freeze = !freeze;
}

/* Append a vector to our list of stored vectors */
function add_vector()
{
    var tmp = [x0, y0];
    if (freeze && determinant(tmp, calculateT(x0, y0)) < 0.05)
	vector_list.push(tmp);

    draw_canvas();
}

function draw_one_grid()
{
    pen.color(palette[0]).width("1px").opacity(1);
    grid([xmin, ymin], [xmax, ymax], [subticks, subticks]);

    pen.color(palette[0]).width("3px");
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
//    $("#debug").html("(" + x0 + ", " + y0 + ")");
    if (!freeze)
    {
	var m = d3.mouse(this);
	[x0, y0] = [rect_map.x(m[0]), rect_map.y(m[1])];
    }
    draw_grids();
    drawUnit()
}


function drawUnit(){
    var norm = Math.sqrt(x0*x0+y0*y0);
    // If user has picked [0, 0], do nothing
    if (norm < EPSILON)
	return;

    // else
    // store user's unit vector and its image under T
    var tmp_unit = [x0/norm, y0/norm],
	tmp_image = calculateT(tmp_unit[0], tmp_unit[1]);
    
    context = d3.select("#domain");
    context.selectAll("path").remove();
    // clear labels
    context.selectAll("foreignObject").remove();
    
    pen.color(pen3).width("1px").fill(pen4).opacity(0.5);
    circle([0, 0], 1);

    /* Draw our stored vectors */
    pen.color(palette[5]).fill(palette[5]).width("3px").opacity(1);
    for (var i = 0; i < vector_list.length; ++i)
	arrow([0, 0], vector_list[i]);

    /* Draw the unnormalized mouse position */
    pen.color(palette[5]).width("3px").fill(palette[5]).opacity(0.5);
    arrow([0, 0], [x0, y0]);

    /* Draw the normalized mouse position */
    pen.color(pen1).width("2px").opacity(1);
    arrow([0, 0], tmp_unit);
    // Mult is scalar multiplication, defined in HC.js
    label(tmp_unit, Mult(0.05, tmp_unit), "<b>x</b>");

    // Draw the target canvas
    context = d3.select("#target");
    context.selectAll("path").remove();
    context.selectAll("foreignObject").remove();

    // Check for parallel vectors (i.e., an eigenvector), do special drawing
    if (proportional(tmp_unit, tmp_image))
    {
	// Draw the eigenspace
	pen.color(palette[3]).width("6px").opacity(1);
	line(Mult(-1.5*sz, tmp_unit), Mult(1.5*sz, tmp_unit));

	/* Not working, not sure why.... */
	// Use CSS to set border to green 5 pixels wide
	$("#target").css({"border-width": "5px", "border-color": "green"});
    }
    // no "else" branch; just draw the canvas as usual
    
    pen.color(pen1).width("2px").opacity(1);
    arrow ([0,0], tmp_unit);
    label(tmp_unit, Mult(0.05, tmp_unit), "<b>x</b>");

    pen.color(pen2).width("4px").opacity(1);
    arrow([0, 0], tmp_image);
    label(tmp_image, Mult(0.05, tmp_image), "<em>T</em>(<b>x</b>)");

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
