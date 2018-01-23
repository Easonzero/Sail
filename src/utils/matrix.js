/**
 * Created by eason on 17-4-13.
 */
class Vector{
    constructor(elements){
        this.setElements(elements);
    }

    e(i){
        return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
    }

    dimensions() {
        return this.elements.length;
    }

    modulus() {
        return Math.sqrt(this.dot(this));
    }

    eql(vector) {
        let n = this.elements.length;
        let V = vector.elements || vector;
        if (n != V.length) { return false; }
        do {
            if (Math.abs(this.elements[n-1] - V[n-1]) > 1e-5) { return false; }
        } while (--n);
        return true;
    }

    dup() {
        return new Vector(this.elements);
    }

    map(fn) {
        let elements = [];
        this.each(function(x, i) {
            elements.push(fn(x, i));
        });
        return new Vector(elements);
    }

    each(fn) {
        let n = this.elements.length, k = n, i;
        do { i = k - n;
            fn(this.elements[i], i+1);
        } while (--n);
    }

    toUnitVector() {
        let r = this.modulus();
        if (r === 0) { return this.dup(); }
        return this.map(function(x) { return x/r; });
    }

    angleFrom(vector) {
        let V = vector.elements || vector;
        let n = this.elements.length, k = n, i;
        if (n != V.length) { return null; }
        let dot = 0, mod1 = 0, mod2 = 0;
        // Work things out in parallel to save time
        this.each(function(x, i) {
            dot += x * V[i-1];
            mod1 += x * x;
            mod2 += V[i-1] * V[i-1];
        });
        mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
        if (mod1*mod2 === 0) { return null; }
        let theta = dot / (mod1*mod2);
        if (theta < -1) { theta = -1; }
        if (theta > 1) { theta = 1; }
        return Math.acos(theta);
    }

    add(vector) {
        let V = vector.elements || vector;
        if (this.elements.length != V.length) { return null; }
        return this.map(function(x, i) { return x + V[i-1]; });
    }

    subtract(vector) {
        let V = vector.elements || vector;
        if (this.elements.length != V.length) { return null; }
        return this.map(function(x, i) { return x - V[i-1]; });
    }

    multiply(k) {
        return this.map(function(x) { return x*k; });
    }

    x(k) { return this.multiply(k); }

    dot(vector) {
        let V = vector.elements || vector;
        let i, product = 0, n = this.elements.length;
        if (n != V.length) { return null; }
        do { product += this.elements[n-1] * V[n-1]; } while (--n);
        return product;
    }

    cross(vector) {
        let B = vector.elements || vector;
        if (this.elements.length != 3 || B.length != 3) { return null; }
        let A = this.elements;
        return new Vector([
            (A[1] * B[2]) - (A[2] * B[1]),
            (A[2] * B[0]) - (A[0] * B[2]),
            (A[0] * B[1]) - (A[1] * B[0])
        ]);
    }

    distanceFrom(obj) {
        if (obj.anchor) { return obj.distanceFrom(this); }
        let V = obj.elements || obj;
        if (V.length != this.elements.length) { return null; }
        var sum = 0, part;
        this.each(function(x, i) {
            part = x - V[i-1];
            sum += part * part;
        });
        return Math.sqrt(sum);
    }

    setElements(els) {
        this.elements = (els.elements || els).slice();
        return this;
    }

    flatten(){
        return this.elements;
    };

    static get i(){return new Vector([1,0,0]);}
    static get j(){return new Vector([0,1,0]);}
    static get k(){return new Vector([0,0,1]);}
    
    static random(n){
        let elements = [];
        do { elements.push(Math.random());
        } while (--n);
        return new Vector(elements);
    }
    
    static Zero(n){
        let elements = [];
        do { elements.push(0);
        } while (--n);
        return new Vector(elements);
    }
}

class Matrix{
    constructor(elements){
        this.setElements(elements);
    }

    e(i,j) {
        if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
        return this.elements[i-1][j-1];
    }

    row(i) {
        if (i > this.elements.length) { return null; }
        return new Vector(this.elements[i-1]);
    }

    col(j) {
        if (j > this.elements[0].length) { return null; }
        let col = [], n = this.elements.length, k = n, i;
        do { i = k - n;
            col.push(this.elements[i][j-1]);
        } while (--n);
        return new Vector(col);
    }

    dimensions() {
        return {rows: this.elements.length, cols: this.elements[0].length};
    }

    get rows() {
        return this.elements.length;
    }

    get cols() {
        return this.elements[0].length;
    }

    eql(matrix) {
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        if (this.elements.length != M.length ||
            this.elements[0].length != M[0].length) { return false; }
        let ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
        do { i = ki - ni;
            nj = kj;
            do { j = kj - nj;
                if (Math.abs(this.elements[i][j] - M[i][j]) > 1e-5) { return false; }
            } while (--nj);
        } while (--ni);
        return true;
    }

    dup() {
        return new Matrix(this.elements);
    }

    map(fn) {
        let els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
        do { i = ki - ni;
            nj = kj;
            els[i] = [];
            do { j = kj - nj;
                els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
            } while (--nj);
        } while (--ni);
        return new Matrix(els);
    }

    isSameSizeAs(matrix) {
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        return (this.elements.length == M.length &&
        this.elements[0].length == M[0].length);
    }

    add(matrix) {
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        if (!this.isSameSizeAs(M)) { return null; }
        return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
    }

    subtract(matrix) {
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        if (!this.isSameSizeAs(M)) { return null; }
        return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
    }

    canMultiplyFromLeft(matrix) {
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        return (this.elements[0].length == M.length);
    }

    multiply(matrix) {
        if (!matrix.elements) {
            return this.map(function(x) { return x * matrix; });
        }
        let returnVector = matrix.modulus ? true : false;
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        if (!this.canMultiplyFromLeft(M)) { return null; }
        let ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
        let cols = this.elements[0].length, elements = [], sum, nc, c;
        do { i = ki - ni;
            elements[i] = [];
            nj = kj;
            do { j = kj - nj;
                sum = 0;
                nc = cols;
                do { c = cols - nc;
                    sum += this.elements[i][c] * M[c][j];
                } while (--nc);
                elements[i][j] = sum;
            } while (--nj);
        } while (--ni);
        M = new Matrix(elements);
        return returnVector ? M.col(1) : M;
    }

    x(matrix) { return this.multiply(matrix); }

    minor(a, b, c, d) {
        let elements = [], ni = c, i, nj, j;
        let rows = this.elements.length, cols = this.elements[0].length;
        do { i = c - ni;
            elements[i] = [];
            nj = d;
            do { j = d - nj;
                elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
            } while (--nj);
        } while (--ni);
        return Matrix.create(elements);
    }

    transpose() {
        let rows = this.elements.length, cols = this.elements[0].length;
        let elements = [], ni = cols, i, nj, j;
        do { i = cols - ni;
            elements[i] = [];
            nj = rows;
            do { j = rows - nj;
                elements[i][j] = this.elements[j][i];
            } while (--nj);
        } while (--ni);
        return Matrix.create(elements);
    }

    isSquare() {
        return (this.elements.length == this.elements[0].length);
    }

    diagonal() {
        if (!this.isSquare) { return null; }
        let els = [], n = this.elements.length, k = n, i;
        do { i = k - n;
            els.push(this.elements[i][i]);
        } while (--n);
        return Vector.create(els);
    }
    
    toRightTriangular() {
        let M = this.dup(), els;
        let n = this.elements.length, k = n, i, j, np, kp = this.elements[0].length, p;
        do { i = k - n;
            if (M.elements[i][i] == 0) {
                for (j = i + 1; j < k; j++) {
                    if (M.elements[j][i] != 0) {
                        els = []; np = kp;
                        do { p = kp - np;
                            els.push(M.elements[i][p] + M.elements[j][p]);
                        } while (--np);
                        M.elements[i] = els;
                        break;
                    }
                }
            }
            if (M.elements[i][i] != 0) {
                for (j = i + 1; j < k; j++) {
                    let multiplier = M.elements[j][i] / M.elements[i][i];
                    els = []; np = kp;
                    do { p = kp - np;
                        els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
                    } while (--np);
                    M.elements[j] = els;
                }
            }
        } while (--n);
        return M;
    }

    toUpperTriangular() { return this.toRightTriangular(); }
    
    determinant() {
        if (!this.isSquare()) { return null; }
        let M = this.toRightTriangular();
        let det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
        do { i = k - n + 1;
            det = det * M.elements[i][i];
        } while (--n);
        return det;
    }

    det() { return this.determinant(); }
    
    isSingular() {
        return (this.isSquare() && this.determinant() === 0);
    }
    
    trace() {
        if (!this.isSquare()) { return null; }
        let tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
        do { i = k - n + 1;
            tr += this.elements[i][i];
        } while (--n);
        return tr;
    }

    tr() { return this.trace(); }
    
    rank() {
        let M = this.toRightTriangular(), rank = 0;
        let ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
        do { i = ki - ni;
            nj = kj;
            do { j = kj - nj;
                if (Math.abs(M.elements[i][j]) > 1e-5) { rank++; break; }
            } while (--nj);
        } while (--ni);
        return rank;
    }

    rk() { return this.rank(); }

    max() {
        let m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
        do { i = ki - ni;
            nj = kj;
            do { j = kj - nj;
                if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
            } while (--nj);
        } while (--ni);
        return m;
    }

    indexOf(x) {
        let index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
        do { i = ki - ni;
            nj = kj;
            do { j = kj - nj;
                if (this.elements[i][j] == x) { return {i: i+1, j: j+1}; }
            } while (--nj);
        } while (--ni);
        return null;
    }
    
    augment(matrix) {
        let M = matrix.elements || matrix;
        if (typeof(M[0][0]) == 'undefined') { M = new Matrix(M).elements; }
        let T = this.dup(), cols = T.elements[0].length;
        let ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
        if (ni != M.length) { return null; }
        do { i = ki - ni;
            nj = kj;
            do { j = kj - nj;
                T.elements[i][cols + j] = M[i][j];
            } while (--nj);
        } while (--ni);
        return T;
    }
    
    inverse() {
        if (!this.isSquare() || this.isSingular()) { return null; }
        let ni = this.elements.length, ki = ni, i, j;
        let M = this.augment(Matrix.I(ni)).toRightTriangular();
        let np, kp = M.elements[0].length, p, els, divisor;
        let inverse_elements = [], new_element;
        
        do { i = ni - 1;
            els = []; np = kp;
            inverse_elements[i] = [];
            divisor = M.elements[i][i];
            do { p = kp - np;
                new_element = M.elements[i][p] / divisor;
                els.push(new_element);
                if (p >= ki) { inverse_elements[i].push(new_element); }
            } while (--np);
            M.elements[i] = els;
            for (j = 0; j < i; j++) {
                els = []; np = kp;
                do { p = kp - np;
                    els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
                } while (--np);
                M.elements[j] = els;
            }
        } while (--ni);
        return new Matrix(inverse_elements);
    }

    inv() { return this.inverse(); }

    round() {
        return this.map(function(x) { return Math.round(x); });
    }

    snapTo(x) {
        return this.map(function(p) {
            return (Math.abs(p - x) <= 1e-5) ? x : p;
        });
    }
    
    inspect() {
        let matrix_rows = [];
        let n = this.elements.length, k = n, i;
        do { i = k - n;
            matrix_rows.push(new Vector(this.elements[i]).inspect());
        } while (--n);
        return matrix_rows.join('\n');
    }

    setElements(els) {
        let i, elements = els.elements || els;
        if (typeof(elements[0][0]) != 'undefined') {
            let ni = elements.length, ki = ni, nj, kj, j;
            this.elements = [];
            do { i = ki - ni;
                nj = elements[i].length; kj = nj;
                this.elements[i] = [];
                do { j = kj - nj;
                    this.elements[i][j] = elements[i][j];
                } while (--nj);
            } while(--ni);
            return this;
        }
        let n = elements.length, k = n;
        this.elements = [];
        do { i = k - n;
            this.elements.push([elements[i]]);
        } while (--n);
        return this;
    }
    
    static I(n) {
        let els = [], k = n, i, nj, j;
        do { i = k - n;
            els[i] = []; nj = k;
            do { j = k - nj;
                els[i][j] = (i == j) ? 1 : 0;
            } while (--nj);
        } while (--n);
        return new Matrix(els);
    }
    
    static Diagonal(elements) {
        let n = elements.length, k = n, i;
        let M = Matrix.I(n);
        do { i = k - n;
            M.elements[i][i] = elements[i];
        } while (--n);
        return M;
    }

    Rotation (theta, a) {
        if (!a) {
            return Matrix.create([
                [Math.cos(theta),  -Math.sin(theta)],
                [Math.sin(theta),   Math.cos(theta)]
            ]);
        }
        let axis = a.dup();
        if (axis.elements.length != 3) { return null; }
        let mod = axis.modulus();
        let x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
        let s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;

        return Matrix.create([
            [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
            [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
            [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
        ]);
    }

    flatten(){
        let result = [];
        if (this.elements.length == 0)
            return [];


        for (let j = 0; j < this.elements[0].length; j++)
            for (let i = 0; i < this.elements.length; i++)
                result.push(this.elements[i][j]);
        return result;
    }

    static RotationX (t) {
        let c = Math.cos(t), s = Math.sin(t);
        return new Matrix([
            [  1,  0,  0 ],
            [  0,  c, -s ],
            [  0,  s,  c ]
        ]);
    }
    static RotationY (t) {
        let c = Math.cos(t), s = Math.sin(t);
        return new Matrix([
            [  c,  0,  s ],
            [  0,  1,  0 ],
            [ -s,  0,  c ]
        ]);
    }
    static RotationZ (t) {
        let c = Math.cos(t), s = Math.sin(t);
        return new Matrix([
            [  c, -s,  0 ],
            [  s,  c,  0 ],
            [  0,  0,  1 ]
        ]);
    }
    static Random (n, m) {
        return new Matrix.Zero(n, m).map(
            function() { return Math.random(); }
        );
    }

    static Zero (n, m) {
        let els = [], ni = n, i, nj, j;
        do { i = n - ni;
            els[i] = [];
            nj = m;
            do { j = m - nj;
                els[i][j] = 0;
            } while (--nj);
        } while (--ni);
        return new Matrix(els);
    }

    static Scale(v){
        if (v.elements.length == 2) {
            let r = Matrix.I(3);
            r.elements[0][0] = v.elements[0];
            r.elements[1][1] = v.elements[1];
            return r;
        }

        if (v.elements.length == 3) {
            let r = Matrix.I(4);
            r.elements[0][0] = v.elements[0];
            r.elements[1][1] = v.elements[1];
            r.elements[2][2] = v.elements[2];
            return r;
        }
    }

    static Translation(v) {
        if (v.elements.length == 2) {
            let r = Matrix.I(3);
            r.elements[2][0] = v.elements[0];
            r.elements[2][1] = v.elements[1];
            return r;
        }

        if (v.elements.length == 3) {
            let r = Matrix.I(4);
            r.elements[0][3] = v.elements[0];
            r.elements[1][3] = v.elements[1];
            r.elements[2][3] = v.elements[2];
            return r;
        }
    }
}

export {Vector,Matrix}