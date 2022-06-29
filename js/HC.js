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

/*** Geometric operations and tests for binary space partition ***/
function Perp(p0, p1, p2)
{
    var tmp = Cross_product(Diff(p1, p0), Diff(p2, p0));
    return Mult(1/Norm(tmp), tmp);
}

// loc and perp define a plane; perp assumed to have unit norm
function Height(loc, perp, arg)
{
    return Dot_product(perp, Diff(arg, loc));
}

// location where edge [tail, head] cuts plane defined by loc, perp
function Cuts_at(loc, perp, tail, head)
{
    var dir = Diff(head, tail);
    var t = Height(tail, perp, loc)/Dot_product(perp, dir);
    return Sum(tail, Mult(t, dir));
}

function Coplanar(loc1, perp1, loc2, perp2)
{
    // perp1 and perp2 nearly parallel, and nearly orthogonal to loc2 - loc1
    return (1 - EPSILON < Math.abs(Dot_product(perp1, perp2))) &&
	(Math.abs(Height(loc1, perp1, loc2)) < EPSILON);
}
/********** Class definitions **********/
/*** Matrix: ***/
function Matrix(m,n,){
    this.row = m;
    this.col = n;
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

/*** Pen: Holds drawing state ***/
function Pen()
{
    this.m_color = "black";
    this.m_width = "1px";
    this.m_fill = "none";
    this.m_opacity = 1.0;
}

Pen.prototype.clone = function()
{
    var cp = new Pen();
    cp.color(this.color);
    cp.width(this.width);
    cp.fill(this.fill);
    cp.opacity(this.opacity);

    return cp;
}

Pen.prototype.color = function(arg)
{
    this.m_color = arg;
    return this;
}

Pen.prototype.width = function(arg)
{
    this.m_width = arg;
    return this;
}

Pen.prototype.fill = function(arg)
{
    this.m_fill = arg;
    return this;
}

Pen.prototype.opacity = function(arg)
{
    this.m_opacity = arg;
    return this;
}

/*** Binary space partition ***/
function Node()
{
    this.m_loc; // location
    this.m_perp; // unit normal vector
    this.m_data = []; // polygons we hold

    this.m_front; // children
    this.m_back;
}

Node.prototype.draw_data = function(viewpt)
{
    if (!this.m_loc || !this.m_perp)
	return;

    for (var i = 0; i < this.m_data.length; ++i)
	this.m_data[i].draw(viewpt);
}

Node.prototype.draw = function(viewpt)
{
    if (!this.m_loc || !this.m_perp)
	return;

    // else
    var ht = Height(this.m_loc, this.m_perp, viewpt);

    if (0 <= ht) // viewpt "above"
	{
	    if (this.m_back)
		this.m_back.draw(viewpt);

	    this.draw_data(viewpt);

	    if (this.m_front)
		this.m_front.draw(viewpt);
	}

    else // ht < 0
	{
	    if (this.m_front)
		this.m_front.draw(viewpt);

	    this.draw_data(viewpt);

	    if (this.m_back)
		this.m_back.draw(viewpt);
	}
}


Node.prototype.add = function(face)
{
    if (!this.m_loc || !this.m_perp)
    {
	var p0 = face.m_edges[0].m_tail;
	var p1 = face.m_edges[1].m_tail;
	var p2 = face.m_edges[2].m_tail;

	this.m_loc = p0;
	this.m_perp = Perp(p0, p1, p2);
	this.m_data.push(face);

	return this;
    }

    else if (Coplanar(this.m_loc, this.m_perp, face.loc(), face.perp()))
	{
	    this.m_data.push(face.clone());
	    return this;
	}

    else
	{
	    var front_faces = []; // will hold list of faces
	    face.clip_by(this.m_loc, this.m_perp, 1, front_faces);

	    if (0 < front_faces.length) // got pieces in front of us
		{
		    if (!this.m_front) // no child node
			this.m_front = new Node();

		    for (var i = 0; i < front_faces.length; ++i)
			this.m_front.add(front_faces[i].clone());
		}

	    var back_faces = [];
	    face.clip_by(this.m_loc, this.m_perp, -1, back_faces);

	    if (0 < back_faces.length) // got pieces behind us
		{
		    if (!this.m_back) // child node exists
			this.m_back = new Node();

		    for (var i = 0; i < back_faces.length; ++i)
			this.m_back.add(back_faces[i].clone());
		}

	    return this;
	}
} // end of Node.add(face)

/*** Edge: Data for Face boundary ***/
function Edge(tail, head, above)
{
    this.m_tail = tail;
    this.m_head = head;
    this.m_above = above; // Boolean to keep track of inside/outside
}

Edge.prototype.clone = function()
{
    return new Edge(this.m_tail, this.m_head, this.m_above);
}

Edge.prototype.toString = function()
{
    return "(" + this.m_tail.toString() + "), (" + this.m_head.toString() + "), " + this.m_above;
}

// convert a list of Edges to vertices
function to_vtx_list(arg)
{
    var value = [];
    for (var i = 0; i < arg.length; ++i)
    {
	if (!Equals(arg[i].m_tail, arg[i].m_head))
	    value.push(arg[i].m_tail);
    }

    value.push(arg[arg.length - 1].m_head);

    return value;
}

/*** Face: Planar polygon ***/ 
function Face(vertices, my_pen)
{
    if (!vertices) // branch for use by clone()
    {
	this.m_loc;
	this.m_perp;
	this.m_pen;
	this.m_edges = [];
	return;
    }

    // else
    this.m_pen = (my_pen ? my_pen : pen.clone());

    this.m_edges = [];

    for (var i = 0; i < vertices.length - 1; ++i)
	this.m_edges.push(new Edge(vertices[i], vertices[i + 1], false));

    // close loop
    this.m_edges.push(new Edge(vertices[vertices.length-1], vertices[0], false));

    var p0 = this.m_edges[0].m_tail;
    var p1 = this.m_edges[1].m_tail;
    var p2 = this.m_edges[2].m_tail;

    this.m_loc = [];
    for (var i = 0; i < p0.length; ++i)
	this.m_loc.push(p0[i]);

    this.m_perp = Perp(p0, p1, p2);
    //console.log(this.toString());
}

Face.prototype.clone = function()
{
    var face = new Face();
    face.m_loc = this.m_loc;
    face.m_perp = this.m_perp;
    face.m_pen = this.m_pen;
    for (var i = 0; i < this.m_edges.length; ++i)
	face.m_edges.push(this.m_edges[i].clone());

    return face;
}

Face.prototype.toString = function()
{
    var value = "  Location: (" + this.m_loc.toString() + ")\n";
    value += "  Perp: (" + this.m_perp.toString() + ")\n  Edges:\n";

    for (var i = 0; i < this.m_edges.length; ++i)
	value += "    " + this.m_edges[i].toString() + "\n";

    return value;
}

Face.prototype.loc = function()
{
    return this.m_loc;
}

Face.prototype.perp = function()
{
    return this.m_perp;
}

// sign = +1/-1: clip toward/away from perp
Face.prototype.clip_by = function(loc, perp, sign, new_faces)
{
    var new_edges = [];

    perp = Mult(sign, perp);

    var ht_min = Height(loc, perp, this.m_edges[0].m_tail);
    var ht_max = ht_min;

    // first pass: Add cuts, mark edges as in/out
    for (var i = 0; i < this.m_edges.length; ++i)
    {
	var tail = this.m_edges[i].m_tail;
	var head = this.m_edges[i].m_head;

	var ht_tail = Height(loc, perp, tail);
	var ht_head = Height(loc, perp, head);

	// edges contiguous; only need to check one height
	ht_min = Math.min(ht_min, ht_tail);
	ht_max = Math.max(ht_max, ht_tail);

	if (-EPSILON <= ht_tail)
	{
	    if (-EPSILON <= ht_head)
		new_edges.push(new Edge(tail, head, true));
	    else // cuts
	    {
		cut = Cuts_at(loc, perp, tail, head);
		new_edges.push(new Edge(tail, cut, true));
		new_edges.push(new Edge(cut, head, false));
	    }
	}
	else // ht_tail < -EPSILON
	{
	    if (ht_head <= EPSILON)
		new_edges.push(new Edge(tail, head, false));
	    else // cuts
	    {
		cut = Cuts_at(loc, perp, tail, head);
		new_edges.push(new Edge(tail, cut, false));
		new_edges.push(new Edge(cut, head, true));
	    }
	}
    }

    // second pass: cut into sub-faces if necessary
    if (-EPSILON <= ht_min)
    {
	var vertices = to_vtx_list(new_edges);
	if (2 < vertices.length)
	    new_faces.push(new Face(vertices, this.m_pen));

	return;
    }

    else if (ht_max <= EPSILON)
	return; // entire face clipped; do nothing

    else // crossing; collect pieces
    {
	var initially_in = new_edges[0].m_above;
	// cycle starting index to face boundary
	while (new_edges[0].m_above == initially_in)
	    new_edges.push(new_edges.shift());

	// break into contiguous edges having in flag
	while (0 < new_edges.length)
	{
	    var is_in = new_edges[0].m_above, idx = 0;

	    // get initial segment of edges on same side of cutting plane
	    while (idx < new_edges.length && new_edges[idx].m_above == is_in)
		++idx;

	    // remove and store edges found
	    var tmp_edges = new_edges.splice(0, idx);

	    if (is_in) // found edges "above" cutting plane
	    {
		var vertices = to_vtx_list(tmp_edges);
		if (2 < vertices.length)
		{
		    var tmp_face = new Face(vertices, this.m_pen);
		    new_faces.push(tmp_face);
		}
	    }
	}
    }
} // end of Face.clip_by

// Utility function for angle-dependent shading
function dens(arg)
{
    return "" + Math.ceil(255*0.25*(1 + 3*arg*arg)).toString(16);
}

Face.prototype.draw = function(viewpt)
{
    var dir = Diff(viewpt, this.m_loc);
    dir = Mult(1/Norm(dir), dir);
    //var mult = dens(Dot_product(this.m_perp, dir));
    var mult = Dot_product(this.m_perp, dir);
    mult = 0.5*(1 + mult*mult);

    var mult1 = dens(mult*this.m_perp[0]);
    var mult2 = dens(mult*this.m_perp[1]);
    var mult3 = dens(mult*this.m_perp[2]);

    var old_pen = pen.clone(); // save pen state

//    pen.fill("#" + mult + mult + mult);
    pen.fill("#" + mult1 + mult2 + mult3);
    polyline(to_vtx_list(this.m_edges));

    pen = old_pen; // and restore
}

/*** Drawing functions -- context required ***/
function HC_spot(context, location, radius, rect_map, camera, pen)
{
    var loc = camera.shoot(location);

    return context.append("circle")
	.attr({"cx": rect_map.u(loc[0]),
	       "cy": rect_map.v(loc[1]),
	       "r": radius
	      })
	.style("stroke", pen.m_color)
	.style("stroke-width", pen.m_width)
	.style("fill", pen.m_fill)
	.style("opacity", pen.m_opacity);
}

function HC_line(context, tail, head, rect_map, camera, pen)
{
    var Tl = camera.shoot(tail), Hd = camera.shoot(head);

    return context.append("line")
	.attr({"x1": rect_map.u(Tl[0]),
	       "y1": rect_map.v(Tl[1]),
	       "x2": rect_map.u(Hd[0]),
	       "y2": rect_map.v(Hd[1])
	      })
	.style("stroke", pen.m_color)
	.style("stroke-width", pen.m_width)
	.style("opacity", pen.m_opacity);
}

function HC_rect(context, sw, ne, rect_map, camera, pen)
{
    var xmin = Math.min(sw[0], ne[0]), xmax = Math.max(sw[0], ne[0]);
    var ymin = Math.min(sw[1], ne[1]), ymax = Math.max(sw[1], ne[1]);
    var data = [[xmin, ymin, 0], [xmax, ymin, 0],
		[xmax, ymax, 0], [xmin, ymax, 0],
		[xmin, ymin, 0]];

    return HC_polyline(context, data, rect_map, camera, pen);
}

function HC_polyline(context, data, rect_map, camera, pen)
{
    var line = d3.svg.line()
	.x(function(d) { return rect_map.u(camera.shoot(d)[0]); })
	.y(function(d) { return rect_map.v(camera.shoot(d)[1]); });

    return context.append("path")
	.datum(data)
	.attr("d", line)
	.style("stroke", pen.m_color)
	.style("stroke-width", pen.m_width)
	.style("fill", pen.m_fill)
	.style("opacity", pen.m_opacity);
}

function HC_label(context, location, offset, text, size, rect_map, camera, pen)
{
    var loc = camera.shoot(location);
    return context.append("foreignObject")
	.attr({
	    "x": rect_map.u(loc[0]) - 0.5*size[0] + offset[0],
	    "y": rect_map.v(loc[1]) - offset[1], // pos offset shifts up
	    "width": size[0],
	    "height": size[1]
	})
	.html("<span>" + text + "</span>");
}

function HC_arrow(context, tail, head, rect_map, camera, pen)
{
    var dir = Diff(head, tail);
    //dir = Mult(1/Norm(dir), dir);
    var cos_th = Dot_product(camera.m_eye, dir);
    var sin_th = Math.sqrt((1 - cos_th)*(1 + cos_th));

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
	    .style("stroke", pen.m_color)
	    .style("stroke-width", pen.m_width)
	    .style("fill", pen.m_color)
	    .style("opacity", pen.m_opacity);
    }
}// end of HC_arrow

/*** Drawing functions -- implicit context ***/
function circle(location, radius)
{
    var num_pts = 120, dt = 2*Math.PI/num_pts;
    var data = [];
    for (var i = 0; i <= num_pts; ++i)
	data.push([location[0] + radius*Math.cos(i*dt),
		   location[1] + radius*Math.sin(i*dt)]);

    return polyline(data);
}

function spot(location, radius)
{
    return HC_spot(context, location, radius, rect_map, camera, pen);
}

function line(tail, head)
{
    return HC_line(context, tail, head, rect_map, camera, pen);
}

function rect(sw, ne)
{
    return HC_rect(context, sw, ne, rect_map, camera, pen)
}

function polyline(data)
{
    return HC_polyline(context, data, rect_map, camera, pen)
}

// treat a number as a constant function
function const_function(c)
{
    switch (typeof c)
    {
    case "number":
	return function() { return c; };

    default:
	return c;
    }
}

// simple check for f:R -> R
function is_R_to_R(f)
{
    if (typeof(f) === "function" && typeof(f(0)) === "number")
	return true;

    else
	throw new Error("Not a number-valued function of number");
}

/*
 * Accept any of: (i) An array of real-valued functions; (ii) a single
 * real-valued function; (iii) an array-valued function.
 */
function plot(f, xmin, xmax, num_pts)
{
    if (f instanceof Array)
    {
	for (var i = 0; i < f.length; ++i) // check for array of R -> R
	{
	    try
	    {
		is_R_to_R(f[i]);
	    }
	    catch(e)
	    {
		throw new Error("plot: Component " + i);
		throw e;
	    }
	}
	// Success: build array-valued function F from f
	F = function(x)
	{
	    var value = [];
	    for (var i = 0; i < f.length; ++i)
		value.push(f[i](x));

	    return value;
	};
    }

    else if (typeof(f) === "function")
    {
	if (typeof f(0) === "number")
	    F = function(x) { return [x, f(x)]; };

	else if (f(0) instanceof Array)
	    F = f;

	else
	    throw new Error("plot: Return type of f is not a number or array");
    }

    else
	throw new Error("plot: f is not a function or function array");

    // Got an array-valued function F; plot it
    num_pts = Math.max(1, Math.ceil(Math.abs(num_pts)));

    var dx = (xmax - xmin)/num_pts;
    var data = [], tmp_data = [];

    for (var i = 0; i <= num_pts; ++i)
	{
	    var loc = F(xmin + i*dx);
	    var not_num = false, j = 0;
	    while (!not_num && j < loc.length)
		{
		    not_num = !isFinite(loc[j]);
		    ++j;
		}

	    if (not_num)
		{
		    if (0 < tmp_data.length)
			data.push(tmp_data);
		    tmp_data = [];
		}

	    else
		tmp_data.push(loc);
	}

    if (0 < tmp_data.length)
	data.push(tmp_data);

    var value = [];
    for (var i = 0; i < data.length; ++i)
	value.push(polyline(data[i]));

    return value;
}

function label(location, offset, text, size)
{
    if (!size) // **** Hard-coded default
	return HC_label(context, location, offset, text, [200, 40], rect_map, camera, pen);
    else
	return HC_label(context, location, offset, text, size, rect_map, camera, pen);
}

function arrow(tail, head)
{
    return HC_arrow(context, tail, head, rect_map, camera, pen);
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

// axis1: ticks parallel to x-axis, etc
function axis1(tail, head, ticks, tick_len)
{
    if (!tick_len)
	var tick_length = 4/rect_map.u_scale(1); // **** default length
    else
	var tick_length = tick_len/rect_map.u_scale(1);

    var dir = [tick_length, 0, 0];

    line(tail, head);

    for (var i = 0; i <= ticks; ++i)
    {
	var loc = cvx_lin_comb(tail, head, i/ticks);
	line(Sum(loc, dir), Diff(loc, dir));
    }
}

function axis2(tail, head, ticks, tick_len)
{
    if (!tick_len)
	var tick_length = 4/rect_map.u_scale(1); // **** default length
    else
	var tick_length = tick_len/rect_map.u_scale(1);

    var dir = [0, tick_length, 0];

    line(tail, head);

    for (var i = 0; i <= ticks; ++i)
    {
	var loc = cvx_lin_comb(tail, head, i/ticks);
	line(Sum(loc, dir), Diff(loc, dir));
    }
}

function axis3(tail, head, ticks, tick_len)
{
    if (!tick_len)
	var tick_length = 4/rect_map.u_scale(1); // **** default length
    else
	var tick_length = tick_len/rect_map.u_scale(1);

    var dir = [0, 0, tick_length];

    line(tail, head);

    for (var i = 0; i <= ticks; ++i)
    {
	var loc = cvx_lin_comb(tail, head, i/ticks);
	line(Sum(loc, dir), Diff(loc, dir));
    }
}

function print_axis_labels(tail, head, ticks, offset, idx)
{
    for (var i = 0; i <= ticks; ++i)
    {
	var loc = cvx_lin_comb(tail, head, i/ticks);
	// **** hard-coded size
	label(loc, offset, "$" + float_to_fraction(loc[idx]) + "$", [100, 100]);
    }
}

function x_axis_labels(tail, head, ticks, offset)
{
    print_axis_labels(tail, head, ticks, offset, 0);
}

function y_axis_labels(tail, head, ticks, offset)
{
    print_axis_labels(tail, head, ticks, offset, 1);
}

function z_axis_labels(tail, head, ticks, offset)
{
    print_axis_labels(tail, head, ticks, offset, 2);
}

/*
// draw tick marks perpendicular to axis line
    var Tl = camera.shoot(tail), Hd = camera.shoot(head);
    var dX = [(Hd[0] - Tl[0])/ticks, (Hd[1] - Tl[1])/ticks];
    var len = 1.0/Norm(dX);

    // [sic], not -dX[1], because y increases downward in SVG coords
    var tick_dir = [tick_length*len*dX[1], tick_length*len*dX[0]];

    for (var i = 0; i <= ticks; ++i)
	context.append("line")
	.attr({
	    "x1": rect_map.u(Tl[0] + i*dX[0]) + tick_dir[0],
	    "y1": rect_map.v(Tl[1] + i*dX[1]) + tick_dir[1],
	    "x2": rect_map.u(Tl[0] + i*dX[0]) - tick_dir[0],
	    "y2": rect_map.v(Tl[1] + i*dX[1]) - tick_dir[1]
	})
	.style("stroke", pen.m_color)
	.style("stroke-width", pen.m_width)
	.style("opacity", pen.m_opacity);
*/