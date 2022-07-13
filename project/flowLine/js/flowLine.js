// Hight and width of the canvas
const width = 500, height = 500;

//coordinate range for the canvas
const sz = 1, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

const numDiv = 20;

var dx =(xmax-xmin)/numDiv, dy =(ymax-ymin)/numDiv;

var l= 0.4*dx

var flowLineData=[];
var flowLineData2=[];

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
}

$(document).ready(function() { 
    initialize_canvas("vectorField", width, height);
    resetCanvas();
    initialize_canvas("flowLine", width, height);
    context = d3.select("#flowLine");
    context.on("click", drawFlowLine);
    
});
//collecting flow line data using Euler's rule (Error/step = O(dt^2))
function collectFlowLineData(x,y){
    const dt = 0.001;
    flowLineData = [];
    flowLineData.push([x,y]);
    var xi,yi,fxi,fyi,next;
    var current = flowLineData[0];
    for(let i = 1; i < 10000; i++){
        fxi = computeFx(current);
        fyi = computeFy(current);
        //if(isFinite(xi)||isFinite(yi)||isFinite(fxi)||isFinite(fyi)){ 
        if (Math.abs(xi) < 1000 && Math.abs(yi) < 1000) {
            next = [xi+fxi*dt, yi+fyi*dt]
            current = next;
            if(i%20==0){
                flowLineData.push(next);
            }
        }else{
            break;
        }
    } 
}

//collecting flow line data using runge-kutta method(Error/step = O(dt^4))
// function collectFlowLineData2(x,y){
//     const dt = 0.01
//     flowLineData2 = [];
//     flowLineData2.push([x,y]);
//     var fx,fy,k1,k2,k3,k4,next;
//     var current = flowLineData2[0];
//     for(let i = 1; i < 1000; i++){
//         fx = current[0];
//         fy = current[1];
//         k1=computeF([dt*fx,dt*fy]);
//         k2=computeF([dt*(fx+k1/2),dt*(fy+k1/2)]);
//         k3=computeF([dt*(fx+k2/2),dt*(fy+k2/2)]);
//         k4=computeF([dt*(fx+k3),dt*(fy+k3)]);
//         next = [fx+(k1+2*k2+2*k3+k4)/6,fy+(k1+2*k2+2*k3+k4)/6]
//         flowLineData2.push(next)
//     }

// }

function drawFlowLine(){
    var m = d3.mouse(this);
    x0 = rect_map.x(m[0]);
    y0 = rect_map.y(m[1]);

    collectFlowLineData(x0,y0);
    context = d3.select("#flowLine");
    context.selectAll("path").remove();
    pen.color(palette[1]).width("2px");

    //collectFlowLineData2(x0,y0);
    //polyline(flowLineData);
    //pen.color(palette[2]).width("1px");
    //polyline(flowLineData2);
}

function drawVectorField(){
    setF();
    context = d3.select("#vectorField");
    context.selectAll("line").remove();
    context.selectAll("path").remove();
    pen.color(palette[0]).width("2px");
    for(let i = min; i < max; i+=dx){
        for(let j = min; j < max; j+=dy){
            var Fxy = computeFnormal([i,j]);
		    if (0 < Norm(Fxy))
		        line(Diff([i,j], Fxy), Sum([i,j], Fxy));;
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

function computeFnormal(arg1){
    var fx = computeFx(arg1);
    var fy = computeFy(arg1);
    var disf = Math.sqrt(fx*fx+fy*fy);
    
    if(disf==0){
        return[0, 0];
    }else{
        return[l*fx/disf,l*fy/disf]
    } 
}
