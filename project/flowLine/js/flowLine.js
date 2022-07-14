// Hight and width of the canvas
const width = 500, height = 500;

//coordinate range for the canvas
const sz = 1, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

const numDiv = 20;

var dx =(xmax-xmin)/numDiv, dy =(ymax-ymin)/numDiv;

var l= 0.4*dx

var flowLineData=[];
var flowLineData2=[];
var animationData= [];
var mouseLocation;

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", 
                "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();
//mouse location on canvas
var x0, y0;
var fxExpression;
var fyExpression;

function resetCanvas(){
    max = $("#range").val();
    min = -max;
    $("#min").html(min); // write into the document
    $("#max").html(max); 
    rect_map.change([min,min], [max,max]);
    dx =(max-min)/numDiv;
    dy =(max-min)/numDiv;
    l= 0.4*dx;
    drawVectorField();
    resizeFlowLine();
}

function initilizeCanvas(){
    max = $("#range").val();
    min = -max;
    $("#min").html(min); // write into the document
    $("#max").html(max); 
    rect_map.change([min,min], [max,max]);
    dx =(max-min)/numDiv;
    dy =(max-min)/numDiv;
    l= 0.4*dx;
    drawVectorField();
}


$(document).ready(function() { 
    initialize_canvas("vectorField", width, height);
    initilizeCanvas();
    initialize_canvas("flowLine", width, height);
    context = d3.select("#flowLine");
    //context.on("click", drawFlowLine);
    context.on("click", animateFlowLine);
    
});

//collecting flow line data using Euler's rule (Error/step = O(dt^2))
function collectFlowLineData(x,y){
    const dt = 0.001;
    flowLineData = [];
    flowLineData.push([x,y]);
    var current = [x, y], next = [];

    for(let i = 1; i < 10000; ++i){
        if (Norm(current) < 1000) {
	    next = Sum(current, Mult(dt, computeF(current)));

            if(i%20==0){
                flowLineData.push(next);
            }
	    current = next;
	}
    }
}

function rungeKutta(current){
    const dt = 0.001;
    var k1 = Mult(dt, computeF(current));
	var k2 = Mult(dt, computeF(Sum(current, Mult(0.5, k1))));
	var k3 = Mult(dt, computeF(Sum(current, Mult(0.5, k2))));
	var k4 = Mult(dt, computeF(Sum(current, k3)));
    var val = Sum(k1, Mult(2, k2));
	val = Sum(val, Mult(2, k3));
	val = Sum(val, k4);
    return Sum(current, Mult(1.0/6, val))
}

function collectAnimationData(current){
    var size = animationData.length;
    if(size==0){
        animationData.push(current);
    }else{
        var temp = rungeKutta(animationData[size-1]);
        animationData.push(temp)
        if(size>1000){
            animationData.shift();
        }
    }
}

function animateFlowLine(){
    mouseLocation = d3.mouse(this);
    x0 = rect_map.x(mouseLocation [0]);
    y0 = rect_map.y(mouseLocation [1]);
    var current =[x0,y0];
    context = d3.select("#flowLine");
    //context.selectAll("path").remove();
    collectAnimationData(current);
    
    // while(animationData[animationData.length-1][0]<xmax &&
    //       animationData[animationData.length-1][0]>xmin &&
    //       animationData[animationData.length-1][1]<ymax &&
    //       animationData[animationData.length-1][1]>ymin){}
        for(var i = 0; i<10000;i++){
            context.selectAll("path").remove();
            console.log(animationData[animationData.length-1][0]);
            collectAnimationData(current);
            
            pen.color(palette[1]).width("4px");
            polyline(animationData);
        }
    }     
    

 
 //collecting flow line data using runge-kutta method(Error/step = O(dt^4))
function collectFlowLineData2(x,y){
    const dt = 0.05;
    flowLineData2 = [];
    flowLineData2.push([x,y]);
    var current = flowLineData2[0],
	next = [];

    let i = 1;
    while (flowLineData2.length < 10000) {
        rungeKutta(current);
	if(Norm(current) < 1000 && // we're not escaping to infinity
	   (++i < 100 || 0.001 < Norm(Diff(current, [x, y]))) && // path not closed
	   0.0001 < Norm(computeF(current))) // not appraching a fixed point
	{
	    flowLineData2.push(next);
        current = next; 
	}
	else
	{
	    //flowLineData2.push(next); // save last-computed point and quit
	    break;
	}
    }
    console.log("Number of points = " + flowLineData2.length);

}



function drawFlowLine(){
    mouseLocation = d3.mouse(this);
    x0 = rect_map.x(mouseLocation [0]);
    y0 = rect_map.y(mouseLocation [1]);

    collectFlowLineData(x0,y0);
    context = d3.select("#flowLine");
    context.selectAll("path").remove();

    pen.color(palette[1]).width("4px");
    polyline(flowLineData);
    console.log(flowLineData.length);

    collectFlowLineData2(x0,y0);
    pen.color(palette[2]).width("2px");
    polyline(flowLineData2);
    console.log(flowLineData2.length);
}

function resizeFlowLine(){
    context = d3.select("#flowLine");
    context.selectAll("path").remove();
    pen.color(palette[1]).width("4px");
    polyline(flowLineData);
    pen.color(palette[2]).width("2px");
    polyline(flowLineData2);
    console.log(flowLineData2.length);
}

function drawVectorField(){
    setF();
    context = d3.select("#vectorField");
    context.selectAll("line").remove();
    context.selectAll("path").remove();
    pen.color(palette[0]).width("2px");
    for(let i = min; i < max; i+=dx){
        for(let j = min; j < max; j+=dy){
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




function computeF(arg1){
    return[computeFx(arg1),computeFy(arg1)]
}

function setF(){
    fxExpression = math.parse($("#fx").val()).compile();
    fyExpression = math.parse($("#fy").val()).compile();
}

function computeFx(arg1){
    let scope = {
        x:arg1[0],
        y:arg1[1]
    }
    return fxExpression.evaluate(scope);
}

function computeFy(arg1){
    let scope = {
        x:arg1[0],
        y:arg1[1]
    }
    return fyExpression.evaluate(scope);
}