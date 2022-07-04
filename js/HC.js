var ARROW_WIDTH = 2; // arrow width in pixels
var ARROW_RATIO = 4; // arrowhead length-to-width

function initialize_canvas(dom_id, width, height, pad_horiz, pad_vert)
{
    if (!pad_horiz)
	pad_horiz = 0;

    if (!pad_vert)
	pad_vert = 0;

    d3.select("#" + dom_id)
	.attr({
	    "width": width + 2*pad_horiz,
	    "height": height + 2*pad_vert
	})
	.append("g")
	.attr("transform", "translate(" + pad_horiz + "," + pad_vert + ")");
}


function random_identifier()
{
    return "" + parseInt(Math.pow(2, 32)*Math.random());
}

function Sum(arg1, arg2)
{
    return [arg1[0] + arg2[0], arg1[1] + arg2[1]]
}

function Diff(arg1, arg2)
{
    return [arg1[0] - arg2[0], arg1[1] - arg2[1]];
}

function Mult(c, arg)
{
    return [c*arg[0], c*arg[1]];
}

function Norm(arg)
{
    return Math.sqrt(Math.pow(arg[0], 2) + Math.pow(arg[1], 2));
}

function cvx_lin_comb(tail, head, c)
{
    // tail + c*(head - tail)
    return Sum(tail, Mult(c, Diff(head, tail)));
}


/*** Rect_Map: Affine adapter for Cartesian-to-pixel conversion ***/
// Cartesian rectangle with specified corners and canvas dimensions
function Rect_Map(arg1, arg2, wd, ht)
{
    this.xmin=Math.min(arg1[0], arg2[0]);
    this.ymin=Math.min(arg1[1], arg2[1]);

    this.xmax=Math.max(arg1[0], arg2[0]);
    this.ymax=Math.max(arg1[1], arg2[1]);

    this.umax=wd;
    this.vmax=ht;
}

// canvas position (u, v) of horizontal/vertical Cartesian location (x, y)
Rect_Map.prototype.u = function(x)
{
    return this.umax*(x - this.xmin)/this.x_width();
}

Rect_Map.prototype.v = function(y)
{
    return this.vmax*(this.ymax - y)/this.y_height();
}

Rect_Map.prototype.u_scale = function(dx)
{
    return dx*this.umax/this.x_width();
}

Rect_Map.prototype.v_scale = function(dy)
{
    return dy*this.vmax/this.y_height();
}

// screen position of horizontal/vertical canvas coordinates
Rect_Map.prototype.x = function(u)
{
    return this.xmin + u*(this.x_width())/this.umax;
}

Rect_Map.prototype.y = function(v)
{
    return this.ymax - v*(this.y_height())/this.vmax;
}

// Cartesian dimensions
Rect_Map.prototype.x_width = function()
{
    return this.xmax - this.xmin;
}

Rect_Map.prototype.y_height = function()
{
    return this.ymax - this.ymin;
}

// Canvas dimensions
Rect_Map.prototype.u_width = function()
{
    return this.umax;
}

Rect_Map.prototype.v_height = function()
{
    return this.vmax;
}

function HC_arrow(context, tail, head, rect_map, ident)
{
    if (!ident)
	ident = random_identifier();

    // pixel locations
    var STl = [rect_map.u(tail[0]), rect_map.v(tail[1])],
	SHd = [rect_map.u(head[0]), rect_map.v(head[1])],
	dX  = Diff(SHd, STl),
	len = 1.0/Norm(dX),
	base = cvx_lin_comb(SHd, STl, ARROW_RATIO*ARROW_WIDTH*len),
	Jdir = [-ARROW_WIDTH*len*dX[1], ARROW_WIDTH*len*dX[0]];

    data = [STl, base, Sum(base, Jdir), SHd, Diff(base, Jdir), base];

    var line_fcn = d3.svg.line()
	.x(function(d) { return d[0]; })
	.y(function(d) { return d[1]; });

    return context.append("path")
	.datum(data)
	.attr("d", line_fcn)
	.attr("id", ident);
}// end of HC_arrow

