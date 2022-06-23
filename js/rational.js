/*
 * rational.js
 * A Javascript library for rational arithmetic.
 *
 * Copyright (c) 2014 Andrew D. Hwang
 * (ahwang -at- mathcs -dot- holycross -dot- edu)
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of
 * the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307
 * USA
 */

/*
 * The Ratl constructor takes one or two ints, num (and denom), or
 * a slash-separated string, num/denom.
 *
 * After construction, denom is non-negative and gcd(num, denom) = 1.
 *
 * Arithmetic operators:
 * Ratl.plus
 * Ratl.minus
 * Ratl.times
 * Ratl.div
 * Ratl.recip
 *
 * Comparison operators:
 * Ratl.eq
 * Ratl.lt
 * Ratl.gt
 *
 * Other operators:
 * Ratl.toString
 * Ratl.toStringX (LaTeX)
 * Ratl.toFloat
 */

// assume we're passed two integers, preferably largest first
function gcd(a, b)
{
    if (!(typeof(a) === 'number') || !(typeof(b) === 'number'))
	return NaN;

    // else
    a = Math.abs(a);
    b = Math.abs(b);

    if (a < b) // swap
    {
        var tmp = b;
        b = a;
        a = tmp;
    }

    if (b === 0)
    {
        if (a === 0)
            return NaN;
        else
	    return a;
    }

    else if (a%b === 0)
    {
	return b;
    }

    else // (b !== 0) and b doesn't divide a; Euclid's algorithm
    {
        while (b !== 0)
        {
            var r = a%b;
            a = b;
            b = r;
        }

	return a;
    }
}

Ratl = function(num, denom)
{
    if (num && denom) // two arguments
    {
        this.m_num = parseInt(num);
        this.m_denom = parseInt(denom);
    }

    else if (!denom) // one argument
    {
	if (typeof(num) === 'string' &&
	    num.match('/'))
	{
            var tmp = num.split('/');
            this.m_num = parseInt(tmp[0]);
	    this.m_denom = parseInt(tmp[1]);
        }
	else // attempt to interpret as an int
	{
            this.m_num = parseInt(num);
            this.m_denom = 1;
        }
    }
    else // could not parse
    {
        this.m_num = 0;
        this.m_denom = 0;
    }

    this.normalize();
}

Ratl.prototype.clone = function()
{
    return new Ratl(this.m_num, this.m_denom);
}

Ratl.prototype.normalize = function()
{
    var hcf = gcd(this.m_num, this.m_denom);
    if (1 < hcf)
    {
	this.m_num /= hcf;
	this.m_denom /= hcf;
    }

    if (this.m_denom < 0)
    {
	this.m_num *= -1;
	this.m_denom *= -1;
    }
}

// write as slash-separated string a/b
Ratl.prototype.toString = function()
{
    var value = "";
    if (this.m_num < 0)
	value += "(";

    value += this.m_num;

    if (this.m_denom !== 1)
	value += "/" + this.m_denom;

    if (this.m_num < 0)
	value += ")";

    return value;
}

// write as TeX \frac{a}{b}
Ratl.prototype.toStringX = function()
{
    var value = "", pos_num = Math.abs(this.m_num);
    if (this.m_num < 0)
	value += "\\left(-";

    if (this.m_denom !== 1)
	value += "\\tfrac{" + pos_num + "}{" + this.m_denom + "}";

    else
	value += pos_num;

    if (this.m_num < 0)
	value += "\\right)";

    return value;
}

Ratl.prototype.toFloat = function()
{
    if (this.m_denom === 0)
	return NaN;
    else
	return this.m_num/this.m_denom;
}

Ratl.prototype.plus = function(arg)
{
    var tmp = this.clone();
    tmp.m_num = tmp.m_num * arg.m_denom + tmp.m_denom * arg.m_num;
    tmp.m_denom *= arg.m_denom;
    tmp.normalize();
    return tmp;
}

Ratl.prototype.minus = function(arg)
{
    var tmp = this.clone();
    tmp.m_num = tmp.m_num * arg.m_denom - tmp.m_denom * arg.m_num;
    tmp.m_denom *= arg.m_denom;
    tmp.normalize();
    return tmp;
}

Ratl.prototype.times = function(arg)
{
    var tmp = this.clone();
    tmp.m_num *= arg.m_num;
    tmp.m_denom *= arg.m_denom;
    tmp.normalize();
    return tmp;
}

Ratl.prototype.div = function(arg)
{
    var tmp = this.clone();
    tmp.m_num *= arg.m_denom;
    tmp.m_denom *= arg.m_num;
    tmp.normalize();
    return tmp;
}

Ratl.prototype.recip = function()
{
    return new Ratl(this.m_denom, this.m_num);
}

// May return true even if denoms are 0
Ratl.prototype.eq = function(arg)
{
    return (this.m_num === arg.m_num &&
	    this.m_denom === arg.m_denom);
}

Ratl.prototype.lt = function(arg)
{
    return (this.m_num * arg.m_denom < arg.m_num * this.m_denom);
}

Ratl.prototype.gt = function(arg)
{
    return (this.m_num * arg.m_denom > arg.m_num * this.m_denom);
}