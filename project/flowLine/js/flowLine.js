// Hight and width of the canvas
var ratio = 1;
const width = 480, height = ratio * width;

//coordinate range for the canvas
var sz = 1, xmin = -sz, xmax = sz, ymin = -ratio * sz, ymax = ratio * sz;

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
/*
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", 
                "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];
*/

// triples representing colors of "young", "mature", "old", and "faded"
const palette = [[0, 1, 0],
[0.25, 1, 0],
[0.25, 0.75, 0],
[0.125, 0.75, 0],
[1, 1, 0],
[1, 0, 0],
[1, 1, 1]];
// mouse position
var x0, y0
const NUM_DIV = 24, // number of vectors to plot in each direction
    MAX_AGE = 100, LIFETIME = palette.length * MAX_AGE,
    PATH_LENGTH = 100;

var dt = 0.025;

var dx = set_step(xmin, xmax),
    dy = set_step(ymin, ymax),
    l = 0.4 * Math.min(dx, dy);

const d_theta = 0.01, d_phi = 0.01;
var frame_count = 0;
var animationFlag = false;
var allTrails = [];

var layernum = 10;
// age is an integer between 0 and LIFETIME
function my_color(age) {
    var time = age / MAX_AGE,
        index = 0;
    while (1 < time) {
        ++index;
        time -= 1;
    }
    if (index < palette.length - 1)
        return RGB2HexColor(cvx_lin_comb(palette[index], palette[index + 1], time));

    else
        return RGB2HexColor(palette[palette.length - 1]);
}

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();

camera.range(50);

$(document).ready(function () {
    initialize_canvas("vectorField", width, height);
    initialize_canvas("flowLine", width, height);
    context = d3.select("#flowLine");
    context.on("click", generateFlowLine);
    $("#play").bind("click", toggle_animate)

    resizeCanvas();
    //drawVectorField();
    d3.select(window).on("keydown", function() {
        switch (d3.event.keyCode) {
        case 188: timeM(); break;
        case 190: timeP(); break;
        }
        console.log(d3.event.keyCode);
    });

});
function generateFlowLine() {
    animationFlag=false;
    context = d3.select("#flowLine");
    context.selectAll("line").remove();
    context.selectAll("path").remove();
    var m = d3.mouse(this);
    x0 = rect_map.x(m[0]);
    y0 = rect_map.y(m[1]);
    var current = new Trail([x0, y0]);
    while (current.is_alive()) {
        current.iterate(PATH_LENGTH / 30);
        current.draw();
    }
}
function redrawFlowLine(x0,y0) {
    context = d3.select("#flowLine");
    context.selectAll("line").remove();
    context.selectAll("path").remove();
    var current = new Trail([x0, y0]);
    while (current.is_alive()) {
        current.iterate(PATH_LENGTH / 30);
        current.draw();
    }
}

function display(name) {
    layernum = layernum + 1;
    $(name).css("z-index", layernum);
}

function toggle_animate() {
    animationFlag = !animationFlag;
    if (animationFlag)
        id = setInterval(drawCanvas, 40);
    else// drawCanvas has no action, but call only one a minute
        clearInterval(id);

}

function random_position() {
    return [xmin + (xmax - xmin) * Math.random(),
    ymin + (ymax - ymin) * Math.random()];
}

function resizeCanvas() {

    xmax = $("#range").val();
    xmin = -xmax;
    ymax = ratio * xmax;
    ymin = ratio * xmin;
    delete rect_map;
    rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
    dx = set_step(xmin, xmax);
    dy = set_step(ymin, ymax);
    l = 0.4 * Math.min(dx, dy);
    drawVectorField();
    var range_string = "$" + xmin + " < x < " + xmax + "$, ";
    range_string += "$" + ymin + " < y < " + ymax + "$";
    $("#canvas_range").html(range_string); // write into the document
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "canvas_range"]);

}

function resetCanvas() {
    resizeCanvas();
    drawCanvas();
}

function set_step(u, v) {
    return (v - u) / NUM_DIV;
}

function rungeKutta(current) {
    var k1 = Mult(dt, computeF(current));
    var k2 = Mult(dt, computeF(Sum(current, Mult(0.5, k1))));
    var k3 = Mult(dt, computeF(Sum(current, Mult(0.5, k2))));
    var k4 = Mult(dt, computeF(Sum(current, k3)));
    var val = Sum(k1, Mult(2, k2));
    val = Sum(val, Mult(2, k3));
    val = Sum(val, k4);

    return Sum(current, Mult(1.0 / 6, val))
}
/*
function Euler(current){
    return Sum(current, Mult(dt, computeF(current)));
}
*/
// Calculate and push the image of data's final point; if length is
// greater than PATH_LENGTH, pop the first point.
function iterateData(data, path) {
    var temp = rungeKutta(data[data.length - 1]);
    //var temp = Euler(data[data.length-1]);
    //if(Norm(temp)<1000)
    data.push(temp);

    if (path <= data.length) {
        data.shift();
    }

    return data;
}

function drawCanvas() {
    if (animationFlag) {
        ++frame_count;

        context = d3.select("#flowLine");
        context.selectAll("line").remove();
        context.selectAll("path").remove();

        for (i = 0; i < allTrails.length; ++i) {
            //	console.log(my_color(allTrails[0].m_age));

            // remove "elderly" trails
            while (!allTrails[0].is_alive()) {
                var tmp = allTrails.shift();
                delete tmp;
            }

            allTrails[i].iterate(PATH_LENGTH);
            allTrails[i].draw();
        }
        if (frame_count % 4 == 0)
            allTrails.push(new Trail(random_position()));
    }else{
        redrawFlowLine(x0,y0)
    }
}

function drawVectorField() {
    context = d3.select("#vectorField");
    //    context.selectAll("line").remove();
    context.selectAll("path").remove();
    context.selectAll("circle").remove();
    //    pen.color(palette[0]).width("2px");
    pen.color("#888").width("1px");
    for (let i = xmin; i <= xmax; i += dx) {
        for (let j = ymin; j <= ymax; j += dy) {
            var Fxy = computeF([i, j]);
            if (0.0001 < Norm(Fxy)) {
                Fxy = Mult(l / Norm(Fxy), Fxy);
                arrow(Diff([i, j], Fxy), Sum([i, j], Fxy));
                //arrow([i, j, k], Sum([i,j, k], Fxy));
            }
            else
                spot([i, j], 1);
        }
    }
}

function computeF(arg) {
    let scope = {
        x: arg[0],
        y: arg[1]
    }
    return [math.compile($("#fx").val()).evaluate(scope),
    math.compile($("#fy").val()).evaluate(scope)]
}

function Trail(arg) {
    this.m_data = [];
    this.m_data.push(arg);
    this.m_age = 0;
}

Trail.prototype.iterate = function (path) {
    ++this.m_age;
    this.m_data = iterateData(this.m_data, path);
}

Trail.prototype.is_alive = function () {
    if (1.5 * LIFETIME < this.m_age || // too old
        (2 < this.m_data.length && // or first two points are too close
            Norm(Diff(this.m_data[0], this.m_data[1])) < 0.01 * dt)) {
        return false;
    }
    else
        return true;
}

Trail.prototype.draw = function () {
    pen.color(my_color(this.m_age)).width("3px");
    polyline(this.m_data);
}

function timeM(){
    if(dt>0.0025){
        dt=dt/2;
        console.log(dt);
    }
}

function timeP(){
    if(dt<0.08){
        dt=dt*2;
    }
    console.log(dt);
}
