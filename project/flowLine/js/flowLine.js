// Hight and width of the canvas
const width = 600, height = 600;

//coordinate range for the canvas
var min = -1, max = 1;
var numDiv = 20;

var dx =(max-min)/numDiv, dy =(max-min)/numDiv, dt = 0.001;

var l= 0.4*dx

var flowLineData=[];

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", 
                "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var camera = new Camera();
var rect_map = new Rect_Map([min, min], [max, max], width, height);
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
    resetCanvas()
    drawVectorField()
    initialize_canvas("flowLine", width, height);
    context = d3.select("#flowLine");
    context.on("click", drawFlowLine);
    
});

function collectFlowLineData(x,y){
    flowLineData = [];
    flowLineData.push([x,y]);
    var xi,yi,fxi,fyi,next;
    var current = flowLineData[0];
    for(let i = 1; i < 10000; i++){
        xi = current[0];
        yi = current[1];
        fxi = computeFx(xi,yi);
        fyi = computeFy(xi,yi);
        if(isFinite(xi)||isFinite(yi)||isFinite(fxi)||isFinite(fyi)){ 
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
function drawFlowLine(){
    flowLine=[]
    var m = d3.mouse(this);
    x0 = rect_map.x(m[0]);
    y0 = rect_map.y(m[1]);
    collectFlowLineData(x0,y0);
    context = d3.select("#flowLine");
    context.selectAll("path").remove();
    pen.color(palette[0]).width("2px");
    polyline(flowLineData);
}

function drawVectorField(){
    setF();
    context = d3.select("#vectorField");
    context.selectAll("line").remove();
    context.selectAll("path").remove();
    pen.color(palette[0]).width("2px");
    for(let i = min; i < max; i+=dx){
        for(let j = min; j < max; j+=dy){
            line([i,j],computeFnormal(i,j));
        }
    }
}

function computeF(x,y){
    return[computeFx(x,y),computeFy(x,y)]
}

function setF(){
    fxExpression = math.parse($("#fx").val()).compile();
    fyExpression = math.parse($("#fy").val()).compile();
}

function computeFx(u,v){
    let scope = {
        x:u,
        y:v
    }
    return fxExpression.evaluate(scope);
}

function computeFy(u,v){
    let scope = {
        x:u,
        y:v
    }
    return fyExpression.evaluate(scope);
}

function computeFnormal(x,y){
    var fx = computeFx(x,y);
    var fy = computeFy(x,y);
    var disf = Math.sqrt(fx*fx+fy*fy);
    if(disf==0){
        return[x,y];
    }else{
        return[x-l*fx/disf,y-l*fy/disf]
    } 
}