// 2x2 matrix

Matrix = function(iname,ia11, ia12, ia21, ia22){
    this.name = iname;
    this.a11 = ia11;
    this.a12 = ia12;
    this.a21 = ia21;
    this.a22 = ia22;
}
Matrix.prototype.toString = function()
{
    var matrixString = this.name + " = \\left[\\begin{array}{@{}rr@{}}";
    matrixString += this.a11 + "&" + this.a12 + "\\\\";
    matrixString += this.a21 + "&" + this.a22 + "\\\\ \\end{array}\\right]";
    return matrixString;
}
Matrix.prototype.det = function()
{
    return this.a11 * this.a22 - this.a12 * this.a21;
}

Matrix.prototype.tr = function()
{
    return this.a11 + this.a22;
}
// the argument should be an array contain 2 element
// the return an array contain 2 element 
Matrix.prototype.vectorProduct= function(arg)
{
    return [this.a11*arg[0]+this.a12*arg[1],this.a21*arg[0]+this.a22*arg[1]];
}

Matrix.prototype.inverse = function()
{
    var idet = this.det();

    return new Matrix(this.name+"^{-1}",this.a22/idet,-this.a12/idet,-this.a21/idet,this.a11/idet);
}

Matrix.prototype.eigenvectors = function(){

}