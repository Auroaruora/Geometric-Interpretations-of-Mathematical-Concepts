// 2x2 matrix

Matrix = function (iname, ia11, ia12, ia21, ia22) {
    this.name = iname;
    this.a11 = ia11;
    this.a12 = ia12;
    this.a21 = ia21;
    this.a22 = ia22;
}
Matrix.prototype.toString = function () {
    var matrixString = this.name + " = \\left[\\begin{array}{@{}rr@{}}";
    matrixString += this.a11 + "&" + this.a12 + "\\\\";
    matrixString += this.a21 + "&" + this.a22 + "\\\\ \\end{array}\\right]";
    return matrixString;
}
Matrix.prototype.det = function () {
    return this.a11 * this.a22 - this.a12 * this.a21;
}

Matrix.prototype.tr = function () {
    return this.a11 + this.a22;
}
// the argument should be an array contain 2 element
// the return an array contain 2 element 
Matrix.prototype.vectorProduct = function (arg) {
    return [this.a11 * arg[0] + this.a12 * arg[1], this.a21 * arg[0] + this.a22 * arg[1]];
}

Matrix.prototype.inverse = function () {
    var idet = this.det();

    return new Matrix(this.name + "^{-1}", this.a22 / idet, -this.a12 / idet, -this.a21 / idet, this.a11 / idet);
}

Matrix.prototype.numRealEigenvalue = function () {

    if (this.realTest() < 0) {
        return 0;
    } else if (this.realTest() == 0) {
        return 1;
    } else {
        return 2;
    }
}

Matrix.prototype.realTest = function () {
    return this.tr() * this.tr() - 4 * this.det();
}

Matrix.prototype.eigenvectors = function () {

}

Matrix.prototype.eigenvalueString = function () {
    var num = this.numRealEigenvalue();
    var t = this.realTest();
    var trA = this.tr();
    var eigenvalue1 = "";
    var eigenvalue2 = "";
    if (num == 0) {

    } else if (num == 1) {
        if (Math.sqrt(t) % 1 === 0) {
            var numerator = trA + Math.sqrt(t);
            if (numerator % 2 == 0) {
                var sol = numerator / 2;
                eigenvalue1 += sol;
            } else {
                eigenvalue1 += '$\\frac{' + numerator + '}{2}'
            }

        } else {
            eigenvalue1 += '$\\frac{1}{2}[' + trA + '+\\sqrt{' + t + '}]$';
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
            eigenvalue1 += '$\\frac{1}{2}[' + trA + '+\\sqrt{' + t + '}]$, ';
            eigenvalue2 += '$\\frac{1}{2}[' + trA + '-\\sqrt{' + t + '}]$';
        }

    }
    return [eigenvalue1, eigenvalue2];
}

Matrix.prototype.eigenvalueFloat = function () {
    var num = this.numRealEigenvalue();
    var t = this.realTest();
    var trA = this.tr();
    var eigenvalue1 = "";
    var eigenvalue2 = "";
    if (num == 0) {
    } else if (num == 1) {
        eigenvalue1 = (trA + Math.sqrt(t)) / 2
    } else {
        eigenvalue1 = (trA + Math.sqrt(t)) / 2
        eigenvalue2 = (trA - Math.sqrt(t)) / 2
    }
    return [eigenvalue1, eigenvalue2];
}

Matrix.prototype.eigenvectorFloat = function () {
    var num = this.numRealEigenvalue();
    var eigenvalue = this.eigenvalueFloat();
    //console.log(eigenvalue);

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
        console.log(tempa22,-b)
        console.log(eigenvector1);




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


Matrix.prototype.eigenvectorString = function () {

}