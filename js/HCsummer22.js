/*
 * HC: A Javascript library to facilitate 3D drawing/plotting
 */
/*
 * Utility functions
 */
// Tolerance for geometric tests
var DIGITS = 4;
var EPSILON = Math.pow(10, -DIGITS); // 10^{-4}
var ARROW_WIDTH = 2; // arrow width in pixels
var ARROW_RATIO = 4; // arrowhead length-to-width

function trunc(arg) { return parseFloat(arg.toPrecision(DIGITS)); }

function trunc_pt(arg)
{
    for (var i = 0; i < arg.length; ++i)
	arg[i] = trunc(arg[i]);

    return arg;
}

function random_identifier()
{
    return "" + parseInt(Math.pow(2, 32)*Math.random());
}

// Set up drawing context; code adapted from M. Bostock's "margin idiom"
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

// bluntly convert a float to a fraction string for axis labels
function float_to_fraction(arg)
{
    var denom = 1;
    while(Math.abs(denom*arg - Math.round(denom*arg)) > EPSILON)
        ++denom;

    if (denom == 1)
        return (arg >= 0) ? "" + Math.round(arg) : "\\llap{-}" + Math.round(-arg);

    else if (arg > 0)
        return "\\tfrac{" + Math.round(denom*arg) + "}{" + denom + "}";

    else
        return "\\llap{-}\\tfrac{" + Math.round(-denom*arg) + "}{" + denom + "}";
}

/*** Vectors (arrays of floats) and operations ***/
function Equals(arg1, arg2)
{
    if (arg1.length != arg2.length)
	return false;

    // else
    for (var i = 0; i < arg1.length; ++i)
	{
	    if (arg1[i] != arg2[i])
		return false;
	}

    return true;
}

/*** Primitive vector space operations ***/
// Vector sum; arg1 and arg2 are arrays, 0-padded as necessary
function Sum(arg1, arg2)
{
    var len_diff = arg1.length - arg2.length;
    if (len_diff > 0)
	{
	    for (var i = 0; i < len_diff; ++i)
		arg2.push(0);
	}
    else if (len_diff < 0)
	{
	    len_diff *= -1;
	    for (var i = 0; i < len_diff; ++i)
		arg1.push(0);
	}

    var value = [];

    for (var i = 0; i < arg1.length; ++i)
	value.push(arg1[i] + arg2[i]);

    return value;
}

function Diff(arg1, arg2)
{
    var len_diff = arg1.length - arg2.length;
    if (len_diff > 0)
	{
	    for (var i = 0; i < len_diff; ++i)
		arg2.push(0);
	}
    else if (len_diff < 0)
	{
	    len_diff *= -1;
	    for (var i = 0; i < len_diff; ++i)
		arg1.push(0);
	}

    var value = [];

    for (var i = 0; i < arg1.length; ++i)
	value.push(arg1[i] - arg2[i]);

    return value;
}

// Scalar multiplication; arg is an array
function Mult(c, arg)
{
   var value = [];

    for (var i = 0; i < arg.length; ++i)
	value.push(c*arg[i]);

    return value;
}

/*** Higher-level vector operations ***/
function cvx_lin_comb(tail, head, c)
{
    // tail + c*(head - tail)
    return Sum(tail, Mult(c, Diff(head, tail)));
}

function trig_lin_comb(arg1, arg2, th)
{
    // cos(th)*arg1 + sin(th)*arg2
    return Sum(Mult(Math.cos(th), arg1), Mult(Math.sin(th), arg2));
}

/*** Other vector operations ***/
function Dot_product(arg1, arg2)
{
    var value = 0;

    for (var i = 0; i < Math.min(arg1.length, arg2.length); ++i)
	value += arg1[i]*arg2[i];

    return value;
}

function Cross_product(arg1, arg2)
{
    if ((arg1.length != 3) || (arg2.length != 3))
	throw new Error("Cross_product: arguments must have length three");

    var value = [];

    value.push(arg1[1]*arg2[2] - arg1[2]*arg2[1]);
    value.push(arg1[2]*arg2[0] - arg1[0]*arg2[2]);
    value.push(arg1[0]*arg2[1] - arg1[1]*arg2[0]);

    return value;
}

function Norm(arg)
{
    var value = 0;

    for (var i = 0; i < arg.length; ++i)
	value += arg[i]*arg[i];

    return Math.sqrt(value);
}

/********** Class definitions **********/
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

/*** Camera: Mapping from space to the screen plane ***/
function Camera()
{
    this.m_dist = 1000; // orthogonal projection by default
    this.m_focus = [0, 0, 0]; // look at the origin

    this.m_sea = [1, 0, 0];
    this.m_sky = [0, 1, 0];
    this.m_eye = [0, 0, 1];

    // location = focus + dist*eye
    this.m_loc = Sum(this.m_focus, Mult(this.m_dist, this.m_eye));
}

Camera.prototype.roll = function(th)
{
    var arg1 = this.m_sea, arg2 = this.m_sky;
    this.m_sea = trig_lin_comb(arg1, arg2, th);
    this.m_sky = trig_lin_comb(arg2, Mult(-1, arg1), th);

    return this;
}

Camera.prototype.pan = function(th)
{
    var arg1 = this.m_sea, arg2 = this.m_eye;
    this.m_sea = trig_lin_comb(arg1, Mult(-1, arg2), th);
    this.m_eye = trig_lin_comb(arg2, arg1, th);

    this.m_loc = Sum(this.m_focus, Mult(this.m_dist, this.m_eye));
    return this;
}

Camera.prototype.tilt = function(th)
{
    var arg1 = this.m_sky, arg2 = this.m_eye;
    this.m_sky = trig_lin_comb(arg1, arg2, th);
    this.m_eye = trig_lin_comb(arg2, Mult(-1, arg1), th);

    this.m_loc = Sum(this.m_focus, Mult(this.m_dist, this.m_eye));
    return this;
}

Camera.prototype.focus = function(focus) {
    this.m_focus = focus;

    this.m_loc = Sum(this.m_focus, Mult(this.m_dist, this.m_eye));
    return this;
}

Camera.prototype.range = function(dist) {
    this.m_dist = dist;

    this.m_loc = Sum(this.m_focus, Mult(this.m_dist, this.m_eye));
    return this;
}

// get Cartesian screen location of arg, as seen by us
Camera.prototype.shoot = function(arg)
{
    var dir = Diff(arg, this.m_loc); // displacement from us to arg
    // Cartesian coordinates in our frame
    var x1 = Dot_product(dir, this.m_sea);
    var x2 = Dot_product(dir, this.m_sky);
    var x3 = Dot_product(dir, this.m_eye);

    // do orthogonal projection is dist <= 0
    var scale = (this.m_dist <= 0) ? 1 : -this.m_dist/x3;

    return [x1*scale, x2*scale];
}

/*** Drawing functions -- context required ***/
function HC_spot(context, location, radius, rect_map, camera, ident)
{
    var loc = camera.shoot(location);

    // no identifier given, create one from center and radius
    if (!ident)
	ident = random_identifier();
    return context.append("circle")
	.attr({"cx": rect_map.u(loc[0]),
	       "cy": rect_map.v(loc[1]),
	       "r": radius,
	       "id": ident
	      });
}

function HC_line(context, tail, head, rect_map, camera, ident)
{
    var Tl = camera.shoot(tail), Hd = camera.shoot(head);

    // no identifier given, create one from endpoints
    if (!ident)
	ident = random_identifier();

    return context.append("line")
	.attr({"x1": rect_map.u(Tl[0]),
	       "y1": rect_map.v(Tl[1]),
	       "x2": rect_map.u(Hd[0]),
	       "y2": rect_map.v(Hd[1]),
	       "id": ident
	      });
}

function HC_rect(context, sw, ne, rect_map, camera, ident)
{
    var xmin = Math.min(sw[0], ne[0]), xmax = Math.max(sw[0], ne[0]);
    var ymin = Math.min(sw[1], ne[1]), ymax = Math.max(sw[1], ne[1]);
    var data = [[xmin, ymin, 0], [xmax, ymin, 0],
		[xmax, ymax, 0], [xmin, ymax, 0],
		[xmin, ymin, 0]];
    if (!ident)
	ident = random_identifier();
    
    return HC_polyline(context, data, rect_map, camera, ident);
}

function HC_polyline(context, data, rect_map, camera, ident)
{
    var line = d3.svg.line()
	.x(function(d) { return rect_map.u(camera.shoot(d)[0]); })
	.y(function(d) { return rect_map.v(camera.shoot(d)[1]); });

    if (!ident)
	ident = random_identifier();

    return context.append("path")
	.datum(data)
	.attr("d", line)
	.attr("id", ident);
}

function HC_label(context, location, offset, text, rect_map, camera, ident)
{
    var loc = camera.shoot(location);
    if (!ident)
	ident = random_identifier();
    return context.append("foreignObject")
	.attr({
	    "x": rect_map.u(loc[0]) - 0.5*size[0] + offset[0],
	    "y": rect_map.v(loc[1]) - offset[1], // pos offset shifts up
	    "overflow": "visible",
	    "id": ident
	})
	.html("$" + text + "$");
}

function HC_arrow(context, tail, head, rect_map, camera, ident)
{
    var dir = Diff(head, tail);
    //dir = Mult(1/Norm(dir), dir);
    var cos_th = Dot_product(camera.m_eye, dir);
    var sin_th = Math.sqrt((1 - cos_th)*(1 + cos_th));
    if (!ident)
	ident = random_identifier();

    if (EPSILON < sin_th)
    {
	// Cartesian screen locations
	var Tl = camera.shoot(tail), Hd = camera.shoot(head);

	// pixel locations
	var STl = [rect_map.u(Tl[0]), rect_map.v(Tl[1])];
	var SHd = [rect_map.u(Hd[0]), rect_map.v(Hd[1])];

	var dX = Diff(SHd, STl);
	var len = 1.0/Norm(dX);

	var base = cvx_lin_comb(SHd, STl, ARROW_RATIO*ARROW_WIDTH*len*sin_th);

	var Jdir = [-ARROW_WIDTH*len*dX[1], ARROW_WIDTH*len*dX[0]];

	data = [STl, base, Sum(base, Jdir), SHd, Diff(base, Jdir), base];

	var line_fcn = d3.svg.line()
	    .x(function(d) { return d[0]; })
	    .y(function(d) { return d[1]; });

	return context.append("path")
	    .datum(data)
	    .attr("d", line_fcn)
	    .attr("id", ident);
    }
}// end of HC_arrow

/*** Drawing functions -- implicit context ***/
function circle(location, radius, ident)
{
    var num_pts = 120, dt = 2*Math.PI/num_pts;
    var data = [];
    for (var i = 0; i <= num_pts; ++i)
	data.push([location[0] + radius*Math.cos(i*dt),
		   location[1] + radius*Math.sin(i*dt)]);

    return polyline(data, ident);
}

function spot(location, radius, ident)
{
    return HC_spot(context, location, radius, rect_map, camera, ident);
}

function line(tail, head, ident)
{
    return HC_line(context, tail, head, rect_map, camera, ident);
}

function rect(sw, ne, ident)
{
    return HC_rect(context, sw, ne, rect_map, camera, ident)
}

function polyline(data, ident)
{
    return HC_polyline(context, data, rect_map, camera, ident)
}

function label(location, offset, text, ident)
{
    return HC_label(context, location, offset, text, rect_map, camera, ident);
}

function arrow(tail, head, ident)
{
    return HC_arrow(context, tail, head, rect_map, camera, ident);
}

// arrays containing corners and number of subdivisions
function grid(xmin, xmax, mesh)
{
    var i, j;
    var dx = Diff(xmax, xmin);
    var indices = [];

    for(i = 0; i < dx.length - mesh.length; ++i) // pad mesh if too short
	mesh.push(1);

    for (i = 0; i < dx.length; ++i)
    {
	if(dx[i] != 0)
	{
	    indices.push(i);
            mesh[i] = Math.max(1, Math.ceil(Math.abs(mesh[i])));
	    dx[i] /= mesh[i];
	}

	else
	    mesh[i] = 0;
    }

    if (indices.length != 2)
    {
	throw new Error("grid: Dimension is not two");
	return;
    }

    // else indices contains spanning coordinate directions
    var basis = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    var N0 = mesh[indices[0]], N1 = mesh[indices[1]];
    var step0 = dx[indices[0]], step1 = dx[indices[1]];
    var dX0 = basis[indices[0]], dX1 = basis[indices[1]];

    for (i = 0; i <= N0; ++i)
    {
	var loc = Sum(xmin, Mult(i*step0, dX0));
	line(loc, Sum(loc, Mult(N1*step1, dX1)));
    }

    for (i = 0; i <= N1; ++i)
    {
	var loc = Sum(xmin, Mult(i*step1, dX1));
	line(loc, Sum(loc, Mult(N0*step0, dX0)));
    }
}
