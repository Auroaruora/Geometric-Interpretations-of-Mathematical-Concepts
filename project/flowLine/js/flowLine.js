// Hight and width of the canvas
var ratio=0.5;
const width = 1000, height = ratio*width;

//coordinate range for the canvas
var sz = 1, xmin = -sz, xmax = sz, ymin = -ratio*sz, ymax = ratio*sz;

const numDiv = 20, MAX_AGE = 200; // maximum age of a Trail

var dx=set_step(xmin, xmax),
    dy=set_step(ymin, ymax),
    l=0.4*Math.min(dx, dy);

var frame_count = 0;
var animate_flag = false;
var allTrails = [];

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", 
                "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();


$(document).ready(function() { 
    initialize_canvas("vectorField", width, height);
    resizeCanvas();
    initialize_canvas("flowLine", width, height);
    context = d3.select("#flowLine");

    context.on("click", toggle_animate);
});

function toggle_animate(){
    animate_flag = !animate_flag;
    if (animate_flag)
	id = setInterval(drawCanvas, 40);
    else// drawCanvas has no action, but call only one a minute
	id = setInterval(drawCanvas, 60000);
}

function random_position()
{
    return [xmin + (xmax - xmin)*Math.random(),
	    ymin + (ymax - ymin)*Math.random()];
}

function resizeCanvas(){
    xmax = $("#range").val();
    xmin = -xmax;
    ymax = ratio*xmax;
    ymin = ratio*xmin;
    var range_string = "$" + xmin + " < x < " + xmax + "$, ";
    range_string += "$" + ymin + " < y < " + ymax + "$"
    $("#canvas_range").html(range_string); // write into the document
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "canvas_range"]);
    delete rect_map;
    rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
    dx=set_step(xmin, xmax);
    dy=set_step(ymin, ymax);
    l=0.4*dx;
    drawVectorField();
}

function resetCanvas(){
    resizeCanvas();
    drawCanvas();
}

function set_step(u, v)
{
    return (v - u)/numDiv;
}

function rungeKutta(current){
    const dt = 0.025;///Norm(computeF(current));
    var k1 = Mult(dt, computeF(current));
    var k2 = Mult(dt, computeF(Sum(current, Mult(0.5, k1))));
    var k3 = Mult(dt, computeF(Sum(current, Mult(0.5, k2))));
    var k4 = Mult(dt, computeF(Sum(current, k3)));
    var val = Sum(k1, Mult(2, k2));
    val = Sum(val, Mult(2, k3));
    val = Sum(val, k4);

    return Sum(current, Mult(1.0/6, val))
}

// Calculate and push the image of data's final point; if length is
// greater than 100, pop the first point.
function iterateData(data){
    var temp = rungeKutta(data[data.length-1]);
    data.push(temp);

    if(20 <= data.length){
        data.shift();
    }

    return data;
}

function drawCanvas(){
    if(!animate_flag)
	return;
    // else
    ++frame_count;
    context = d3.select("#flowLine");
    context.selectAll("path").remove();

    for (i = 0; i < allTrails.length; ++i)
    {
	allTrails[i].iterate();
	allTrails[i].draw();
	// remove "elderly" trails
	while(MAX_AGE < allTrails[0].age())
	    allTrails.shift();
    }
    if (frame_count % 10 == 0)
	allTrails.push(new Trail(random_position()));
}

function drawVectorField(){
    context = d3.select("#vectorField");
    context.selectAll("line").remove();
    context.selectAll("path").remove();
    pen.color(palette[0]).width("2px");
    for(let i = xmin; i < xmax; i+=dx){
        for(let j = ymin; j < ymax; j+=dy){
            var Fxy = computeF([i,j]);
		    if (0.0001 < Norm(Fxy)){
		        Fxy = Mult(l/Norm(Fxy), Fxy);
		        arrow(Diff([i,j], Fxy), Sum([i,j], Fxy));
	        }
	        else
		        spot([i, j], 1);  
        }
    }
}

function computeF(arg){
    let scope = {
        x:arg[0],
        y:arg[1]
    }
    return[math.compile($("#fx").val()).evaluate(scope),
           math.compile($("#fy").val()).evaluate(scope)];
}

function Trail(arg)
{
    this.m_data = [];
    this.m_data.push(arg);
    this.m_age = 0;
}

Trail.prototype.color = function(){
    var dens = Math.min(15, Math.floor(this.m_age*16/MAX_AGE)).toString(16);
    console.log("Trail.color = #" + dens + dens + "f");

    return "#" + dens + dens + "f";
}

Trail.prototype.iterate = function(){
    if (MAX_AGE < ++this.m_age)
	delete this;

    else
	this.m_data = iterateData(this.m_data);
}

Trail.prototype.age = function(){
    return this.m_age;
}

Trail.prototype.draw = function(){
    pen.color(this.color()).width("2px");
    polyline(this.m_data);
}