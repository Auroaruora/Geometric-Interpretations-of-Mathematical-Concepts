/*----------------------------------------------------------------
 *  Author:   Z. Weng
 *  Email:    zweng24@g.holycross.edu
 *  Written:  7/29/2022
 * 
 *  Co-author: A.Hwang
 *  Email:     ahwang@holycross.edu
 *  Written:   7/29/2022
 *  
 *  A two dimentional matrix class contains basic calculation about the matrix
 *----------------------------------------------------------------*/

//constructor
Matrix = function (iname, ia11, ia12, ia21, ia22) {
    this.name = iname;
    this.a11 = ia11;
    this.a12 = ia12;
    this.a21 = ia21;
    this.a22 = ia22;
}
//return the matrix as a string (using MathJax syntax)
Matrix.prototype.toString = function () {
    var matrixString = this.name + " = \\left[\\begin{array}{@{}rr@{}}";
    matrixString += this.a11 + "&" + this.a12 + "\\\\";
    matrixString += this.a21 + "&" + this.a22 + "\\\\ \\end{array}\\right]";
    return matrixString;
}

//Compute the determinate of the matrix.
//The function returns a number
Matrix.prototype.det = function () {
    return this.a11 * this.a22 - this.a12 * this.a21;
}

//Compute the trace of the matrix.
//The function returns a number
Matrix.prototype.tr = function () {
    return this.a11 + this.a22;
}

// Compute the product of the matrix with a given vector
// The function takes an array with 2 numbers.
// The function returns an array with 2 numbers. 
Matrix.prototype.vectorProduct = function (arg) {
    return [this.a11 * arg[0] + this.a12 * arg[1], this.a21 * arg[0] + this.a22 * arg[1]];
}

//Compute the inverse of the program
//The function returns a Matrix object
Matrix.prototype.inverse = function () {
    var idet = this.det();

    return new Matrix(this.name + "^{-1}", this.a22 / idet, -this.a12 / idet, -this.a21 / idet, this.a11 / idet);
}

//Count the number of real eigenvalue of the matrix
//The function returns a interger(range:0-2)
Matrix.prototype.numRealEigenvalue = function () {
    var test = this.tr() * this.tr() - 4 * this.det();
    if (test < 0) {
        return 0;
    } else if (test == 0) {
        return 1;
    } else {
        return 2;
    }
}

//return eigenvalue 
Matrix.prototype.eigenvalueString = function () {
    var num = this.numRealEigenvalue();
    var test = this.tr() * this.tr() - 4 * this.det();
    var trA = this.tr();
    var eigenvalue1 = "";
    var eigenvalue2 = "";
    if (num == 0) {

    } else if (num == 1) {
        if (Math.sqrt(test) % 1 === 0) {
            var numerator = trA + Math.sqrt(test);
            if (numerator % 2 == 0) {
                var sol = numerator / 2;
                eigenvalue1 += sol;
            } else {
                eigenvalue1 += '$\\frac{' + numerator + '}{2}'
            }

        } else {
            eigenvalue1 += '$\\frac{1}{2}[' + trA + '+\\sqrt{' + test + '}]$';
        }
    } else {
        if (Math.sqrt(t) % 1 === 0) {
            var numerator1 = trA + Math.sqrt(t);
            var numerator2 = trA - Math.sqrt(t);
            if (numerator1 % 2 == 0) {
                var sol = numerator1 / 2;
                eigenvalue1 += sol;
            } else {
                eigenvalue1 += '$\\frac{' + numerator1 + '}{2}'
            }

            if (numerator2 % 2 == 0) {
                var sol = numerator2 / 2;
                eigenvalue2 += sol;
            } else {
                eigenvalue2 += '$\\frac{' + numerator2 + '}{2}'
            }

        } else {
            eigenvalue1 += '$\\frac{1}{2}[' + trA + '+\\sqrt{' + test + '}]$, ';
            eigenvalue2 += '$\\frac{1}{2}[' + trA + '-\\sqrt{' + test + '}]$';
        }
    }
    return [eigenvalue1, eigenvalue2];
}

Matrix.prototype.eigenvalueFloat = function () {
    var num = this.numRealEigenvalue();
    var test = this.tr() * this.tr() - 4 * this.det();
    var trA = this.tr();
    var eigenvalue1 = "";
    var eigenvalue2 = "";
    if (num == 0) {
    } else if (num == 1) {
        eigenvalue1 = (trA + Math.sqrt(test)) / 2
    } else {
        eigenvalue1 = (trA + Math.sqrt(test)) / 2
        eigenvalue2 = (trA - Math.sqrt(test)) / 2
    }
    return [eigenvalue1, eigenvalue2];
}

Matrix.prototype.eigenvectorFloat = function () {
    var num = this.numRealEigenvalue();
    var eigenvalue = this.eigenvalueFloat();
    var eigenvector1 = [NaN, NaN];
    var eigenvector2 = [NaN, NaN];
    var tempa11 = this.a11 - eigenvalue[0];
    var tempa22 = this.a22 - eigenvalue[0];
    var b = this.a21;
    var c = this.a12;
    if (num == 0) {
        return [eigenvector1, eigenvector2];
    } else {
        if (b == 0 && c == 0 && tempa11 == 0 && tempa22 == 0) {
            return[[this.a11,0],[0,this.a22]]
        } 
        
        if (tempa11 != 0 || c != 0) {
            eigenvector1 = [-c, tempa11];
        } else if (tempa11 == 0 && c == 0) {
            eigenvector1 = [tempa22, -b];
        }
        if (num == 1) {
            return [eigenvector1, eigenvector2];
        } else {
            tempa11 = this.a11 - eigenvalue[1];
            tempa22 = this.a22 - eigenvalue[1];
            if (tempa11 != 0 || c != 0) {
                eigenvector2 = [-c, tempa11];
            } else if (tempa11 == 0 && c == 0) {
                eigenvector2 = [tempa22, -b];
            }
            return [eigenvector1, eigenvector2];
        }
    }
}

//Todo
Matrix.prototype.eigenvectorString = function () {

}