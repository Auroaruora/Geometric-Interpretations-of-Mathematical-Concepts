// Hight and width of the canvas
const width = 500, height = 500;

//coordinate range for the canvas
const sz = 1, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;

const numDiv = 20;

const dx =(xmax-xmin)/numDiv, dy =(ymax-ymin)/numDiv, dt = 0.00001;

const l= 0.4*dx

var flowLineData=[];

// "Muted" qualitative color scheme suggested by Paul Tol
// https://personal.sron.nl/~pault/
const palette = ["#000000", "#332288", "#88CCEE", "#44AA99", "#117733", 
                "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"];

var camera = new Camera();
var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);
var pen = new Pen();
//mouse location on canvas
var x0, y0;

$(document).ready(function() { 
    initialize_canvas("vectorField", width, height);
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
    for(let i = 1; i < 1000000; i++){
        xi = current[0];
        yi = current[1];
        fxi = computeFx(xi,yi);
        fyi = computeFy(xi,yi);
        next = [xi+fxi*dt, yi+fyi*dt]
        current = next;
        if(i%20==0){
            flowLineData.push(next);
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
    context = d3.select("#vectorField");
    pen.color(palette[0]).width("2px");
    for(let i = xmin; i < xmax; i+=dx){
        for(let j = ymin; j < ymax; j+=dy){
            line([i,j],computeFnormal(i,j));
        }
    }
}

function computeF(x,y){
    return[computeFx(x,y),computeFy(x,y)]
}
function computeFx(x,y){
    return (x-y)*(x+y);
}
function computeFy(x,y){
    return (-2)*x*y;
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