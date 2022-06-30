Vector = function(iname, itail, ihead){
    this.name = iname;
    this.tail = itail;
    this.head = ihead;
}

Vector.prototype.toString = function()
{
    var vectorString = this.name + " = \\left[\\begin{array}{@{}rr@{}}";
    vectorString += this.a11 + "&" + this.a12 + "\\\\";
    vectorString += this.a21 + "&" + this.a22 + "\\\\ \\end{array}\\right]";
    return vectorString;
}

Vector.prototype.draw = function()
{
    
}

Vector.prototype.erase = function()
{
    
}
Vector.prototype.draw = function()
{
    
}
