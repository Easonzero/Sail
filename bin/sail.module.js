/**
 * Created by eason on 17-3-15.
 */
class ShaderProgram {
    constructor(hasFrameBuffer=false) {
        this.hasFrameBuffer = hasFrameBuffer;
        this.run = false;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            -1, +1,
            +1, -1,
            +1, +1
        ]), gl.STATIC_DRAW);

        if(hasFrameBuffer){
            this.framebuffer = gl.createFramebuffer();

            if(!ShaderProgram.frameCache) {
                ShaderProgram.frameCache = [];

                let type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;

                gl.activeTexture(gl.TEXTURE0);
                for(let i = 0; i < 2; i++) {
                    ShaderProgram.frameCache.push(WebglHelper.createTexture());
                    WebglHelper.setTexture(
                        ShaderProgram.frameCache[i],0,
                        512,512,gl.RGB,gl.RGB,type,null
                    );
                }
            }
        }
    }

    setProgram(shader){
        this.shader = shader;

        this.program = WebglHelper.createProgram(shader.combinevs(), shader.combinefs());

        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        gl.enableVertexAttribArray(this.vertexAttribute);
    }

    render(uniforms=true,textures=true){
        if(!this.program||!this.shader) return;

        gl.useProgram(this.program);

        if(!this.run) {
            this._updateUniforms();
            this._updateTextures();
            this._updateVBO();
            this.run = true;
        }else{
            if(uniforms) this._updateUniforms();
            if(textures) this._updateTextures();
        }

        if(this.hasFrameBuffer){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, ShaderProgram.frameCache[0]);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ShaderProgram.frameCache[1], 0);
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        if(this.hasFrameBuffer){
            ShaderProgram.frameCache.reverse();
        }
    }

    _updateUniforms(){
        if(!this.uniform) return;
        for(let entry of Object.entries(this.uniform)) {
            let location = gl.getUniformLocation(this.program, entry[0]);
            if(location == null||!entry[1]) continue;
            if(entry[1].type=='vec3') {
                gl.uniform3fv(location, new Float32Array([entry[1].value.elements[0], entry[1].value.elements[1], entry[1].value.elements[2]]));
            } else if(entry[1].type=='mat4') {
                gl.uniformMatrix4fv(location, false, new Float32Array(entry[1].value.flatten()));
            } else if(entry[1].type=='int'){
                gl.uniform1i(location, entry[1].value);
            } else if(entry[1].type=='float'){
                gl.uniform1f(location, entry[1].value);
            }
        }
    }

    _updateTextures(){
        if(!this.texture) return;
        for(let entry of Object.entries(this.texture)) {
            let location = gl.getUniformLocation(this.program, entry[0]);
            if(location == null) continue;

            gl.uniform1i(location,entry[1]);
        }
    }

    _updateVBO(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttribute, 2, gl.FLOAT, false, 0, 0);
    }

    set uniform(uniform){}

    get uniform(){return this.shader.uniform}

    set texture(texture){}

    get texture(){return this.shader.texture}
}

ShaderProgram.OBJECTS_LENGTH = 18;
ShaderProgram.TEXPARAMS_LENGTH = 16;

class WebglHelper {
    static createTexture(){
        return gl.createTexture();
    }

    static setTexture(texture,unitID,width,height,internalFormat,format,type,data,npot){
        gl.activeTexture(gl.TEXTURE0+unitID);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(npot){
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }else{
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
    }

    static clearScreen(){
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    static createProgram(vshader, fshader){
        let vertexShader = WebglHelper.loadShader(gl.VERTEX_SHADER, vshader);
        let fragmentShader = WebglHelper.loadShader(gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        let program = gl.createProgram();
        if (!program) {
            return null;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            let error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }

    static loadShader(type, source) {
        let shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }
        gl.shaderSource(shader, source);

        gl.compileShader(shader);

        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            let error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    static initWebgl(canvas){
        window.gl = null;

        try {
            gl = canvas.getContext("webgl2");
        }
        catch(e) {}
        if (!gl) {
            alert("WebGL2初始化失败，可能是因为您的浏览器不支持。");
            gl = null;
        }
        return gl;
    }
}

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

/**
 * Created by eason on 1/21/18.
 */
class PluginParams{
    constructor(name){
        this.name = name;
        this.params = {};
    }

    addParam(name,value){
        this.params[name] = value;
    }

    getParam(name){
        let result = this.params[name].match(/-?\d+\.\d+?/g);
        for(let i in result){
            result[i] = parseFloat(result[i]);
        }
        return result;
    }

    getParamName(name,generatorName){
       return `${generatorName}_${this.name}_${name}`.toUpperCase();
    }
}

class Plugin {
    constructor(name, fn) {
        this.name = name;
        this.fn = fn;
    }

    capitalName() {
        let name = "";
        for(let c of this.name){
            if(c==this.name[0]) c=this.name[0].toUpperCase();
            name += c;
        }
        return name;
    }

    defineName() {
        return this.name.toUpperCase();
    }

    equal(name){
        return this.name === name;
    }

    param(pluginParam,generatorName){
        let params = '';
        for(let param of Object.entries(pluginParam.params)){
            params += `#define ${pluginParam.getParamName(param[0],generatorName)} ${param[1]}\n`;
        }
        return params;
    }
}

class Export{
    constructor(name,head,tail,flag,callfn){
        this.name = name;
        this.head = head;
        this.tail = tail;
        this.flag = flag;
        this.callfn = callfn;
    }

    condition(defineName){
        return `else if(${this.flag}==${defineName}) `;
    }
}

class Generator{
    constructor(name,head,tail,plugins,...exports){
        this.plugins = plugins;
        this._name = name;
        this.exports = exports;
        this._head = head;
        this._tail = tail;
    }

    set head(head){}

    get head(){
        let head = "";
        for(let e of this._head)
            head += e + '\n';
        return head;
    }

    set tail(tail){}

    get tail(){
        let tail = "";
        for(let e of this._tail)
            tail += e + '\n';
        return tail;
    }

    set name(name){}

    get name(){
        return this._name;
    }

    generate(...pluginParams){
        let result = this.head + '\n';
        for(let pluginParam of pluginParams){
            result += this.plugins[pluginParam.name].param(pluginParam,this.name);
            result += this.plugins[pluginParam.name].fn + '\n';
        }
        for(let e of this.exports){
            result += e.head;
            for(let pluginParam of pluginParams){
                result += e.condition(this.plugins[pluginParam.name].defineName());
                result += `{${e.callfn(this.plugins[pluginParam.name])}}`;
            }
            result += e.tail + '\n';
        }
        result += this.tail + '\n';
        return result;
    }

    query(plugin){
        return Object.keys(this.plugins).includes(plugin);
    }
}

var define = "#define OBJECTS_LENGTH 17.0\n#define TEX_PARAMS_LENGTH 15.0\n#define MAX_DISTANCE 1e5\n#define MAXBOUNCES 5\n#define EPSILON 1e-4\n#define ONEMINUSEPSILON 0.9999\n#define INF 1e5\n#define PI 3.141592653589793\n#define INVPI 0.3183098861837907\n#define INV2PI 0.159154943091895\n#define INV4PI 0.079577471545947\n#define PIOVER2 1.570796326794896\n#define PIOVER4 0.785398163397448\n#define SQRT2 1.414213562373095\n#define CUBE 1\n#define SPHERE 2\n#define RECTANGLE 3\n#define CONE 4\n#define CYLINDER 5\n#define DISK 6\n#define HYPERBOLOID 7\n#define PARABOLOID 8\n#define MATTE 1\n#define MIRROR 2\n#define METAL 3\n#define GLASS 4\n#define UNIFORM_COLOR 0\n#define CHECKERBOARD 5\n#define CORNELLBOX 6\n#define CHECKERBOARD2 7\n#define BILERP 8\n#define MIXF 9\n#define SCALE 10\n#define UVF 11\n#define BLACK vec3(0.0,0.0,0.0)\n#define WHITE vec3(1.0,1.0,1.0)\n#define GREY vec3(0.5,0.5,0.5)\n#define RED vec3(0.75,0.25,0.25)\n#define BLUE vec3(0.1, 0.5, 1.0)\n#define YELLOW vec3(1.0, 0.9, 0.1)\n#define NC 1.0\n#define NOOP 0\n#define CONDUCTOR 1\n#define DIELECTRIC 2\n#define BECKMANN 1\n#define TROWBRIDGEREITZ 2\n#define OBJECT_SPACE_N vec3(0,1,0)\n#define OBJECT_SPACE_S vec3(0,0,-1)\n#define OBJECT_SPACE_T vec3(1,0,0)\n";

var struct = "struct Intersect{\n    float d;\n    vec3 hit;\n    vec3 normal;\n    vec3 dpdu,dpdv;\n    bool into;\n    float matIndex;    vec3 sc;    vec3 emission;\n    float seed;    int index;\n    int matCategory;\n};\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};";

/**
 * Created by eason on 1/20/18.
 */
var c = new Generator("const",[define],[struct]);

var window$1 = "vec3 windowSampler(vec2 coord,inout int count){\n    if(coord.x<0.0||coord.x>1.0||coord.y<0.0||coord.y>1.0)\n        return vec3(0,0,0);\n    count++;\n    return texture(tex,coord).rgb;\n}\nvec3 window(vec2 coord,float i,float j,out int count){\n    count = 0;\n    vec2 x = vec2(i/512.0,0);\n    vec2 y = vec2(0,j/512.0);\n    vec3 color = vec3(0,0,0);\n    color += windowSampler(coord+x+y,count);\n    color += windowSampler(coord+x-y,count);\n    color += windowSampler(coord-x+y,count);\n    color += windowSampler(coord-x-y,count);\n    return color;\n}\nvec4 pixelFilter(vec2 texCoord){\n    vec3 color = vec3(0.0,0.0,0.0);\n    float weightSum = 0.0;\n    for(int i=0;i<FILTER_WINDOW_WIDTH;i++){\n        for(int j=0;j<FILTER_WINDOW_WIDTH;j++){\n            int count;\n            vec3 tmpColor = window(\n                texCoord,\n                (float(j) + 0.5) * FILTER_WINDOW_RADIUS.x / float(FILTER_WINDOW_WIDTH),\n                (float(i) + 0.5) * FILTER_WINDOW_RADIUS.y / float(FILTER_WINDOW_WIDTH),\n                count\n            );\n            float weight = windowWeightTable[i*j+j];\n            weightSum += weight*float(count);\n            color += tmpColor * weight;\n        }\n    }\n    return vec4(color/weightSum,1.0);\n}";

var gamma = "float gamma(float x) {\n    return pow(clamp(x,0.0,1.0), 1.0/FILTER_GAMMA_C) + 0.0022222222222222;\n}\nvec4 pixelFilter(vec2 texCoord){\n    vec3 color = texture(tex, texCoord).rgb;\n    return vec4(gamma(color.r),gamma(color.g),gamma(color.b),1.0);\n}";

var none = "vec4 pixelFilter(vec2 texCoord){\n    vec3 color = texture(tex, texCoord).rgb;\n    return vec4(color,1.0);\n}";

/**
 * Created by eason on 1/26/18.
 */
function box(p){
    return 1.0;
}

function Box_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let length = windowWidth*windowWidth;
        let result = `
        #define FILTER_WINDOW_WIDTH ${windowWidth}
        #define FILTER_WINDOW_LENGTH ${length}
        #define FILTER_WINDOW_RADIUS ${pluginParams.params.r}
        float windowWeightTable[FILTER_WINDOW_LENGTH] = float[FILTER_WINDOW_LENGTH](`;

        let offset = 0;
        for(let i=0;i<windowWidth;i++){
            for(let j=0;j<windowWidth;j++,offset++){
                let p = {
                  x:(j + 0.5) * r.x / windowWidth,
                  y:(i + 0.5) * r.y / windowWidth
                };
                let weight = box(p)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

/**
 * Created by eason on 1/26/18.
 */
function gaussian(d,expv,alpha){
    return Math.max(0.0, Math.exp(-alpha * d * d) - expv);
}

function Gaussian_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let alpha = pluginParams.getParam("alpha")[0];
        let length = windowWidth*windowWidth;
        let result = `
        #define FILTER_WINDOW_WIDTH ${windowWidth}
        #define FILTER_WINDOW_LENGTH ${length}
        #define FILTER_WINDOW_RADIUS ${pluginParams.params.r}
        float windowWeightTable[FILTER_WINDOW_LENGTH] = float[FILTER_WINDOW_LENGTH](`;

        let offset = 0;
        for(let i=0;i<windowWidth;i++){
            for(let j=0;j<windowWidth;j++,offset++){
                let p = {
                    x:(j + 0.5) * r[0] / windowWidth,
                    y:(i + 0.5) * r[1] / windowWidth
                };
                let expx = Math.exp(-alpha*r[0]*r[0]),expy = Math.exp(-alpha*r[1]*r[1]);
                let weight = gaussian(p.x,expx,alpha)*gaussian(p.y,expy,alpha)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

/**
 * Created by eason on 1/26/18.
 */
function mitchell(x,B,C){
    x = Math.abs(2 * x);
    if (x > 1)
        return ((-B - 6 * C) * x * x * x + (6 * B + 30 * C) * x * x +
            (-12 * B - 48 * C) * x + (8 * B + 24 * C)) *
            (1.0 / 6.0);
    else
        return ((12 - 9 * B - 6 * C) * x * x * x +
            (-18 + 12 * B + 6 * C) * x * x + (6 - 2 * B)) *
            (1.0 / 6.0);
}

function Mitchell_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let b = pluginParams.getParam("b");
        let c = pluginParams.getParam("c");
        let length = windowWidth*windowWidth;
        let result = `
        #define FILTER_WINDOW_WIDTH ${windowWidth}
        #define FILTER_WINDOW_LENGTH ${length}
        #define FILTER_WINDOW_RADIUS ${pluginParams.params.r}
        float windowWeightTable[FILTER_WINDOW_LENGTH] = float[FILTER_WINDOW_LENGTH](`;

        let offset = 0;
        for(let i=0;i<windowWidth;i++){
            for(let j=0;j<windowWidth;j++,offset++){
                let p = {
                    x:(j + 0.5) * r[0] / windowWidth,
                    y:(i + 0.5) * r[1] / windowWidth
                };
                let weight = mitchell(p.x/r[0],b,c)
                    *mitchell(p.y/r[1],b,c)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

/**
 * Created by eason on 1/26/18.
 */
function sinc(x){
    x = Math.abs(x);
    if (x < 1e-5) return 1.0;
    return Math.sin(Math.PI * x) / (Math.PI * x);
}

function windowedSinc(x,radius,tau){
    x = Math.abs(x);
    if (x > radius) return 0.0;
    let lanczos = sinc(x / tau);
    return sinc(x) * lanczos;
}

function Sinc_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let tau = pluginParams.getParam("tau");
        let length = windowWidth*windowWidth;
        let result = `
        #define FILTER_WINDOW_WIDTH ${windowWidth}
        #define FILTER_WINDOW_LENGTH ${length}
        #define FILTER_WINDOW_RADIUS ${pluginParams.params.r}
        float windowWeightTable[FILTER_WINDOW_LENGTH] = float[FILTER_WINDOW_LENGTH](`;

        let offset = 0;
        for(let i=0;i<windowWidth;i++){
            for(let j=0;j<windowWidth;j++,offset++){
                let p = {
                    x:(j + 0.5) * r[0] / windowWidth,
                    y:(i + 0.5) * r[1] / windowWidth
                };
                let weight = windowedSinc(p.x,r[0],tau)
                    *windowedSinc(p.y,r[1],tau)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

/**
 * Created by eason on 1/26/18.
 */
function triangle(d,radius){
    return Math.max(0.0,radius - d);
}

function Triangle_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let length = windowWidth*windowWidth;
        let result = `
        #define FILTER_WINDOW_WIDTH ${windowWidth}
        #define FILTER_WINDOW_LENGTH ${length}
        #define FILTER_WINDOW_RADIUS ${pluginParams.params.r}
        float windowWeightTable[FILTER_WINDOW_LENGTH] = float[FILTER_WINDOW_LENGTH](`;

        let offset = 0;
        for(let i=0;i<windowWidth;i++){
            for(let j=0;j<windowWidth;j++,offset++){
                let p = {
                    x:(j + 0.5) * r[0] / windowWidth,
                    y:(i + 0.5) * r[1] / windowWidth
                };
                let weight = triangle(p.x,r[0])
                    *triangle(p.y,r[1])+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

/**
 * Created by eason on 1/23/18.
 */
let plugins = {
    "none":new Plugin("none",none),
    "gamma":new Plugin("gamma",gamma),
    "box":new Plugin("box",window$1),
    "gaussian":new Plugin("gaussian",window$1),
    "mitchell":new Plugin("mitchell",window$1),
    "sinc":new Plugin("sinc",window$1),
    "triangle":new Plugin("triangle",window$1)
};
let windowWidth = 4;

plugins.box.param = Box_param(windowWidth);

plugins.gaussian.param = Gaussian_param(windowWidth);

plugins.mitchell.param = Mitchell_param(windowWidth);

plugins.sinc.param = Sinc_param(windowWidth);

plugins.triangle.param = Triangle_param(windowWidth);

var filter = new Generator("filter",[""],[""],plugins);

var fsrender = "in vec2 texCoord;\nout vec4 color;\nvoid main() {\n    color = pixelFilter(texCoord);\n}";

var vsrender = "in vec3 vertex;\nout vec2 texCoord;\nvoid main() {\n    texCoord = vertex.xy * 0.5 + 0.5;\n    gl_Position = vec4(vertex, 1.0);\n}";

var fstrace = "in vec3 raydir;\nout vec4 out_color;\nvoid main() {\n    int deepth;\n    vec3 e;\n    Ray ray = Ray(eye,raydir);\n    trace(ray,e,MAXBOUNCES);\n    vec3 texture = texture( cache, gl_FragCoord.xy/512.0 ).rgb;\n    out_color = vec4(mix(e, texture, textureWeight),1.0);\n}\n";

var vstrace = "in vec3 vertex;\nout vec3 raydir;\nvoid main() {\n    gl_Position = vec4(vertex, 1.0);\n    raydir = normalize(ensure3byW(matrix*gl_Position)-eye);\n}";

/**
 * Created by eason on 1/20/18.
 */
let plugins$1 = {
    "fsrender":new Plugin("fsrender",fsrender),
    "vsrender":new Plugin("vsrender",vsrender),
    "fstrace":new Plugin("fstrace",fstrace),
    "vstrace":new Plugin("vstrace",vstrace)
};

var main = new Generator("main",[""],[""],plugins$1);

var ssutility = "float cosTheta(const vec3 w) { return w.z; }\nfloat cos2Theta(const vec3 w) { return w.z * w.z; }\nfloat absCosTheta(const vec3 w) { return abs(w.z); }\nfloat sin2Theta(const vec3 w) {\n    return max(0.0, 1.0 - cos2Theta(w));\n}\nfloat sinTheta(const vec3 w) { return sqrt(sin2Theta(w)); }\nfloat tanTheta(const vec3 w) {\n    float cosT = cosTheta(w);\n    if(equalZero(cosT)) return INF;\n    return sinTheta(w) / cosT;\n}\nfloat tan2Theta(const vec3 w) {\n    float cos2T = cos2Theta(w);\n    if(cos2T<EPSILON) return INF;\n    return sin2Theta(w) / cos2T;\n}\nfloat cosPhi(const vec3 w) {\n    float sinTheta = sinTheta(w);\n    return (equalZero(sinTheta)) ? 1.0 : clamp(w.x / sinTheta, -1.0, 1.0);\n}\nfloat sinPhi(const vec3 w) {\n    float sinTheta = sinTheta(w);\n    return (equalZero(sinTheta)) ? 0.0 : clamp(w.y / sinTheta, -1.0, 1.0);\n}\nfloat cos2Phi(const vec3 w) { return cosPhi(w) * cosPhi(w); }\nfloat sin2Phi(const vec3 w) { return sinPhi(w) * sinPhi(w); }\nfloat cosDPhi(const vec3 wa, const vec3 wb) {\n    return clamp(\n        (wa.x * wb.x + wa.y * wb.y) /\n        sqrt((wa.x * wa.x + wa.y * wa.y) * (wb.x * wb.x + wb.y * wb.y)),\n        -1.0, 1.0);\n}\nbool sameHemisphere(const vec3 w, const vec3 wp) {\n    return w.z * wp.z > EPSILON;\n}";

var fresnel = "struct Fresnel{\n    int type;\n    vec3 etaI;\n    vec3 etaT;\n    vec3 k;\n};\nFresnel createFresnelD(float etaI,float etaT){\n    Fresnel fresnel;\n    fresnel.etaI = vec3(etaI);\n    fresnel.etaT = vec3(etaT);\n    fresnel.type = DIELECTRIC;\n    return fresnel;\n}\nFresnel createFresnelC(vec3 etaI,vec3 etaT,vec3 k){\n    Fresnel fresnel;\n    fresnel.etaI = etaI;\n    fresnel.etaT = etaT;\n    fresnel.k = k;\n    fresnel.type = CONDUCTOR;\n    return fresnel;\n}\nFresnel createFresnelN(){\n    Fresnel fresnel;\n    fresnel.type = NOOP;\n    return fresnel;\n}\nfloat frDielectric(float cosThetaI, float etaI, float etaT) {\n    cosThetaI = clamp(cosThetaI, -1.0, 1.0);\n    float sinThetaI = sqrt(max(0.0, 1.0 - cosThetaI * cosThetaI));\n    float sinThetaT = etaI / etaT * sinThetaI;\n    if (sinThetaT >= 1.0) return 1.0;\n    float cosThetaT = sqrt(max(0.0, 1.0 - sinThetaT * sinThetaT));\n    float TI = etaT * cosThetaI,IT = etaI * cosThetaT,\n        II = etaI * cosThetaI, TT = etaT * cosThetaT;\n    float Rparl = (TI - IT) /\n                  (TI + IT);\n    float Rperp = (II - TT) /\n                  (II + TT);\n    return (Rparl * Rparl + Rperp * Rperp) / 2.0;\n}\nvec3 frConductor(float cosThetaI, vec3 etaI, vec3 etaT, vec3 k) {\n    cosThetaI = clamp(cosThetaI, -1.0, 1.0);\n    vec3 eta = etaT / etaI;\n    vec3 etak = k / etaI;\n    float cosThetaI2 = cosThetaI * cosThetaI;\n    float sinThetaI2 = 1.0 - cosThetaI2;\n    vec3 eta2 = eta * eta;\n    vec3 etak2 = etak * etak;\n    vec3 t0 = eta2 - etak2 - sinThetaI2;\n    vec3 a2plusb2 = sqrt(t0 * t0 + 4.0 * eta2 * etak2);\n    vec3 t1 = a2plusb2 + cosThetaI2;\n    vec3 a = sqrt(0.5 * (a2plusb2 + t0));\n    vec3 t2 = 2.0 * cosThetaI * a;\n    vec3 Rs = (t1 - t2) / (t1 + t2);\n    vec3 t3 = cosThetaI2 * a2plusb2 + sinThetaI2 * sinThetaI2;\n    vec3 t4 = t2 * sinThetaI2;\n    vec3 Rp = Rs * (t3 - t4) / (t3 + t4);\n    return 0.5 * (Rp + Rs);\n}\nvec3 frEvaluate(Fresnel f,float cosThetaI){\n    if(f.type==DIELECTRIC) return WHITE*frDielectric(cosThetaI,f.etaI.x,f.etaT.x);\n    else if(f.type==CONDUCTOR) return frConductor(cosThetaI,f.etaI,f.etaT,f.k);\n    return WHITE;\n}";

var microfacet = "struct MicrofacetDistribution{\n    float alphax;\n    float alphay;\n    int type;\n};\nvec3 beckmann_sample_wh(vec2 u,float alphax,float alphay,vec3 wo){\n    float tan2Theta, phi;\n    float logSample = log(u.x);\n    if (logSample>=INF) logSample = 0.0;\n    if (equalZero(alphax - alphay)) {\n        tan2Theta = -alphax * alphax * logSample;\n        phi = u.x * 2.0 * PI;\n    } else {\n        phi = atan(alphay / alphax * tan(2.0 * PI * u.x + 0.5 * PI));\n        if (u.x > 0.5) phi += PI;\n        float sinPhi = sin(phi), cosPhi = cos(phi);\n        float alphax2 = alphax * alphax, alphay2 = alphay * alphay;\n        tan2Theta = -logSample / (cosPhi * cosPhi / alphax2 + sinPhi * sinPhi / alphay2);\n    }\n    \n    float cosTheta = 1.0 / sqrt(1.0 + tan2Theta);\n    float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));\n    vec3 wh = sphericalDirection(sinTheta, cosTheta, phi);\n    if (!sameHemisphere(wo, wh)) wh = -wh;\n    return wh;\n}\nfloat beckmann_d(float alphax, float alphay, vec3 wh){\n    float tan2Theta = tan2Theta(wh);\n    if (tan2Theta>=INF) return 0.001;\n    float cos4Theta = cos2Theta(wh) * cos2Theta(wh);\n    return exp(-tan2Theta * (cos2Phi(wh) / (alphax * alphax) + sin2Phi(wh) / (alphay * alphay))) /\n           (PI * alphax * alphay * cos4Theta);\n}\nfloat beckmann_pdf(float alphax, float alphay, vec3 wo,vec3 wh){\n    return beckmann_d(alphax,alphay,wh) * absCosTheta(wh);\n}\nvec3 trowbridgeReitz_sample_wh(vec2 u, float alphax, float alphay, vec3 wo){\n    float cosTheta = 0.0, phi = 2.0 * PI * u.x;\n    if (alphax == alphay) {\n        float tanTheta2 = alphax * alphax * u.x / (1.0 - u.x);\n        cosTheta = 1.0 / sqrt(1.0 + tanTheta2);\n    } else {\n        phi = atan(alphay / alphax * tan(PIOVER2 + 2.0 * PI * u.x));\n        if (u.x > 0.5) phi += PI;\n        float sinPhi = sin(phi), cosPhi = cos(phi);\n        float alphax2 = alphax * alphax, alphay2 = alphay * alphay;\n        float alpha2 = 1.0 / (cosPhi * cosPhi / alphax2 + sinPhi * sinPhi / alphay2);\n        float tanTheta2 = alpha2 * u.x / (1.0 - u.x);\n        cosTheta = 1.0 / sqrt(1.0 + tanTheta2);\n    }\n    float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));\n    vec3 wh = sphericalDirection(sinTheta, cosTheta, phi);\n    if (!sameHemisphere(wo, wh)) wh = -wh;\n    return wh;\n}\nfloat trowbridgeReitz_d(float alphax, float alphay, vec3 wh){\n    float tan2Theta = tan2Theta(wh);\n    if (tan2Theta>=INF) return 0.001;\n    float cos4Theta = cos2Theta(wh) * cos2Theta(wh);\n    float e = (cos2Phi(wh) / (alphax * alphax) + sin2Phi(wh) / (alphay * alphay)) * tan2Theta;\n    return 1.0 / (PI * alphax * alphay * cos4Theta * (1.0 + e) * (1.0 + e));\n}\nfloat trowbridgeReitz_pdf(float alphax, float alphay, vec3 wo,vec3 wh){\n    return trowbridgeReitz_d(alphax, alphay, wh) * absCosTheta(wh);\n}\nvec3 microfacet_sample_wh(MicrofacetDistribution md,vec2 u,vec3 wo){\n    if(md.type==BECKMANN) return beckmann_sample_wh(u,md.alphax,md.alphay,wo);\n    else if(md.type==TROWBRIDGEREITZ) return trowbridgeReitz_sample_wh(u,md.alphax,md.alphay,wo);\n    return BLACK;\n}\nfloat microfacet_d(MicrofacetDistribution md,vec3 wh){\n    if(md.type==BECKMANN) return beckmann_d(md.alphax,md.alphay,wh);\n    else if(md.type==TROWBRIDGEREITZ) return trowbridgeReitz_d(md.alphax,md.alphay,wh);\n    return 0.0;\n}\nfloat microfacet_pdf(MicrofacetDistribution md,vec3 wo,vec3 wh){\n    if(md.type==BECKMANN) return beckmann_pdf(md.alphax,md.alphay,wo,wh);\n    else if(md.type==TROWBRIDGEREITZ) return trowbridgeReitz_pdf(md.alphax,md.alphay,wo,wh);\n    return 0.0;\n}";

var bsdf = "\nstruct LambertianR{\n    vec3 R;\n};\nvec3 lambertian_r_f(LambertianR lr, vec3 wo, vec3 wi){\n    return lr.R * INVPI;\n}\nfloat lambertian_r_pdf(LambertianR lr, vec3 wo, vec3 wi){\n    return sameHemisphere(wo, wi) ? absCosTheta(wi) * INVPI : 0.0;\n}\nvec3 lambertian_r_sample_f(LambertianR lr, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    wi = cosineSampleHemisphere(u);\n    pdf = lambertian_r_pdf(lr, wo, wi);\n    return lambertian_r_f(lr,wo, wi);\n}\nstruct LambertianT{\n    vec3 T;\n};\nvec3 lambertian_t_f(LambertianT lt, vec3 wo, vec3 wi){\n    return lt.T * INVPI;\n}\nfloat lambertian_t_pdf(LambertianT lt, vec3 wo, vec3 wi){\n    return !sameHemisphere(wo, wi) ? absCosTheta(wi) * INVPI : 0.0;\n}\nvec3 lambertian_t_sample_f(LambertianT lt, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    wi = cosineSampleHemisphere(u);\n    wi.z *= -1.0;\n    pdf = lambertian_t_pdf(lt, wo, wi);\n    return lambertian_t_f(lt,wo, wi);\n}\nstruct OrenNayar{\n    vec3 R;\n    float A,B;\n};\nvec3 orenNayar_f(OrenNayar on, vec3 wo, vec3 wi){\n    float sinThetaI = sinTheta(wi);\n    float sinThetaO = sinTheta(wo);\n    float maxCos = 0.0;\n    if (sinThetaI > EPSILON && sinThetaO > EPSILON) {\n        float sinPhiI = sinPhi(wi), cosPhiI = cosPhi(wi);\n        float sinPhiO = sinPhi(wo), cosPhiO = cosPhi(wo);\n        float dCos = cosPhiI * cosPhiO + sinPhiI * sinPhiO;\n        maxCos = max(0.0, dCos);\n    }\n    float sinAlpha, tanBeta;\n    if (absCosTheta(wi) > absCosTheta(wo)) {\n        sinAlpha = sinThetaO;\n        tanBeta = sinThetaI / absCosTheta(wi);\n    } else {\n        sinAlpha = sinThetaI;\n        tanBeta = sinThetaO / absCosTheta(wo);\n    }\n    return on.R * INVPI * (on.A + on.B * maxCos * sinAlpha * tanBeta);\n}\nfloat orenNayar_pdf(OrenNayar on, vec3 wo, vec3 wi){\n    return sameHemisphere(wo, wi) ? absCosTheta(wi) * INVPI : 0.0;\n}\nvec3 orenNayar_sample_f(OrenNayar on, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    wi = cosineSampleHemisphere(u);\n    pdf = orenNayar_pdf(on, wo, wi);\n    return orenNayar_f(on,wo, wi);\n}\nstruct SpecularR{\n    vec3 R;\n    Fresnel f;\n};\nvec3 specular_r_f(SpecularR sr, vec3 wo, vec3 wi){\n    return BLACK;\n}\nfloat specular_r_pdf(SpecularR sr, vec3 wo, vec3 wi){\n    return 0.0;\n}\nvec3 specular_r_sample_f(SpecularR sr, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    wi = vec3(-wo.x, -wo.y, wo.z);\n    pdf = 1.0;\n    return frEvaluate(sr.f,cosTheta(wi)) * sr.R / absCosTheta(wi);\n}\nstruct SpecularT{\n    vec3 T;\n    float etaA, etaB;\n    bool into;\n};\nvec3 specular_t_f(SpecularT st, vec3 wo, vec3 wi){\n    return BLACK;\n}\nfloat specular_t_pdf(SpecularT st, vec3 wo, vec3 wi){\n    return 0.0;\n}\nvec3 specular_t_sample_f(SpecularT st, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    float etaI = st.into ? st.etaA : st.etaB;\n    float etaT = st.into ? st.etaB : st.etaA;\n    wi = refract(-wo,vec3(0,0,1),etaI / etaT);\n    pdf = 1.0;\n    vec3 ft = st.T * (WHITE - frDielectric(cosTheta(wi),st.etaA,st.etaB));\n    return ft / absCosTheta(wi);\n}\nstruct SpecularFr{\n    vec3 R;\n    vec3 T;\n    float etaA, etaB;\n    bool into;\n};\nvec3 specular_fr_f(SpecularFr sf, vec3 wo, vec3 wi){\n    return BLACK;\n}\nfloat specular_fr_pdf(SpecularFr sf, vec3 wo, vec3 wi){\n    return 0.0;\n}\nvec3 specular_fr_sample_f(SpecularFr sf, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    float F = frDielectric(cosTheta(wo), sf.etaA, sf.etaB);\n    if (u.x < F) {\n        wi = vec3(-wo.x, -wo.y, wo.z);\n        pdf = 1.0;\n        return  sf.R / absCosTheta(wi);\n    }else{\n        float etaI = sf.into ? sf.etaA : sf.etaB;\n        float etaT = sf.into ? sf.etaB : sf.etaA;\n        wi = refract(-wo,vec3(0,0,1),etaI / etaT);\n        vec3 ft = sf.T * (1.0 - F);\n        pdf = 1.0;\n        return ft / absCosTheta(wi);\n    }\n}\nstruct MicrofacetR{\n    vec3 R;\n    Fresnel f;\n    MicrofacetDistribution md;\n};\nvec3 microfacet_r_f(MicrofacetR mr, vec3 wo, vec3 wi){\n    float cosThetaO = absCosTheta(wo), cosThetaI = absCosTheta(wi);\n    vec3 wh = wi + wo;\n    if (cosThetaI < EPSILON || cosThetaO < EPSILON) return BLACK * 0.001;\n    if (equalZero(wh.x) && equalZero(wh.y) && equalZero(wh.z)) return BLACK * 0.001;\n    wh = normalize(wh);\n    vec3 F = frEvaluate(mr.f,dot(wi, wh));\n    return mr.R * microfacet_d(mr.md,wh) * F / (4.0 * cosThetaI * cosThetaO);\n}\nfloat microfacet_r_pdf(MicrofacetR mr, vec3 wo, vec3 wi){\n    if (!sameHemisphere(wo, wi)) return 0.001;\n    vec3 wh = normalize(wo + wi);\n    return microfacet_pdf(mr.md, wo, wh) / (4.0 * dot(wo, wh));\n}\nvec3 microfacet_r_sample_f(MicrofacetR mr, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    if (wo.z < EPSILON) return BLACK * 0.001;\n    vec3 wh = microfacet_sample_wh(mr.md,u,wo);\n    wi = reflect(-wo, wh);\n    if (!sameHemisphere(wo, wi)) return BLACK * 0.001;\n    float dotoh = dot(wo,wh);\n    pdf = microfacet_pdf(mr.md, wo, wh) / (4.0 * dot(wo,wh));\n    return microfacet_r_f(mr, wo, wi);\n}\nstruct MicrofacetT{\n    vec3 T;\n    float etaA, etaB;\n    bool into;\n    MicrofacetDistribution md;\n};\nvec3 microfacet_t_f(MicrofacetT mt, vec3 wo, vec3 wi){\n    if (sameHemisphere(wo, wi)) return BLACK * 0.001;\n    float cosThetaO = cosTheta(wo);\n    float cosThetaI = cosTheta(wi);\n    if (equalZero(cosThetaI) || equalZero(cosThetaO)) return BLACK * 0.001;\n    float eta = mt.into ? (mt.etaB / mt.etaA) : (mt.etaA / mt.etaB);\n    vec3 wh = normalize(wo + wi * eta);\n    if (wh.z < -EPSILON) wh = -wh;\n    float F = frDielectric(dot(wo, wh),mt.etaA,mt.etaB);\n    float sqrtDenom = dot(wo, wh) + eta * dot(wi, wh);\n    return (1.0 - F) * mt.T *\n           abs(eta * eta * microfacet_d(mt.md,wh) *\n                    abs(dot(wi, wh)) * abs(dot(wo, wh)) /\n                    (cosThetaI * cosThetaO * sqrtDenom * sqrtDenom));\n}\nfloat microfacet_t_pdf(MicrofacetT mt, vec3 wo, vec3 wi){\n    if (sameHemisphere(wo, wi)) return 0.001;\n    float eta = mt.into ? (mt.etaB / mt.etaA) : (mt.etaA / mt.etaB);\n    vec3 wh = normalize(wo + wi * eta);\n    float sqrtDenom = dot(wo, wh) + eta * dot(wi, wh);\n    float dwh_dwi = abs((eta * eta * dot(wi, wh)) / (sqrtDenom * sqrtDenom));\n    return microfacet_pdf(mt.md, wo, wh) * dwh_dwi;\n}\nvec3 microfacet_t_sample_f(MicrofacetT mt, vec2 u, vec3 wo, out vec3 wi, out float pdf){\n    if (equalZero(wo.z)) return BLACK * 0.001;\n    vec3 wh = microfacet_sample_wh(mt.md, u, wo);\n    float eta = mt.into ? (mt.etaA / mt.etaB) : (mt.etaB / mt.etaA);\n    wi = refract(-wo,wh,eta);\n    pdf = microfacet_t_pdf(mt, wo, wi);\n    return microfacet_t_f(mt, wo, wi);\n}\n";

var metal = "void metal_attr(float matIndex,out float uroughness,out float vroughness,out vec3 eta,out vec3 k){\n    uroughness = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    vroughness = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n    eta = readVec3(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);\n    k = readVec3(texParams,vec2(6.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 metal(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    float uroughness,vroughness;\n    vec3 eta,k;\n    metal_attr(matIndex,uroughness,vroughness,eta,k);\n    MicrofacetDistribution md = MicrofacetDistribution(uroughness,vroughness,TROWBRIDGEREITZ);\n    Fresnel fresnel = createFresnelC(WHITE,eta,k);\n    MicrofacetR mr = MicrofacetR(sc,fresnel,md);\n    f = microfacet_r_sample_f(mr,u,wo,wi,pdf);\n    return f * absCosTheta(wi)/pdf;\n}\nvec3 metal_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){\n    float uroughness,vroughness;\n    vec3 eta,k;\n    metal_attr(matIndex,uroughness,vroughness,eta,k);\n    MicrofacetDistribution md = MicrofacetDistribution(uroughness,vroughness,TROWBRIDGEREITZ);\n    Fresnel fresnel = createFresnelC(WHITE,eta,k);\n    MicrofacetR mr = MicrofacetR(sc,fresnel,md);\n    return microfacet_r_f(mr,wo,wi);\n}";

var matte = "void matte_attr(float matIndex,out float kd,out float sigma,out float A,out float B){\n    kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    sigma = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n    A = readFloat(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);\n    B = readFloat(texParams,vec2(4.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 matte(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    float kd,sigma,A,B;\n    matte_attr(matIndex,kd,sigma,A,B);\n    if(sigma<EPSILON){\n        LambertianR diffuseR = LambertianR(kd*sc);\n        f = lambertian_r_sample_f(diffuseR,u,wo,wi,pdf);\n    }else{\n        OrenNayar diffuseR = OrenNayar(kd*sc,A,B);\n        f = orenNayar_sample_f(diffuseR,u,wo,wi,pdf);\n    }\n    return f * absCosTheta(wi)/pdf;\n}\nvec3 matte_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){\n    float kd,sigma,A,B;\n    matte_attr(matIndex,kd,sigma,A,B);\n    if(sigma<EPSILON){\n        LambertianR diffuseR = LambertianR(kd*sc);\n        return lambertian_r_f(diffuseR,wo,wi);\n    }else{\n        OrenNayar diffuseR = OrenNayar(kd*sc,A,B);\n        return orenNayar_f(diffuseR,wo,wi);\n    }\n}";

var mirror = "void mirror_attr(float matIndex,out float kr){\n    kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 mirror(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    float kr;\n    mirror_attr(matIndex,kr);\n    SpecularR sr = SpecularR(kr*sc,createFresnelN());\n    f = specular_r_sample_f(sr,u,wo,wi,pdf);\n    return f * absCosTheta(wi)/pdf;\n}\nvec3 mirror_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){\n    float kr;\n    mirror_attr(matIndex,kr);\n    SpecularR sr = SpecularR(kr*sc,createFresnelN());\n    return specular_r_f(sr,wo,wi);\n}";

var glass = "void glass_attr(float matIndex,out float kr,out float kt,\n                out float eta,out float vroughness,out float vroughness){\n    kr= readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    kt = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n    eta = readFloat(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);\n    vroughness = readFloat(texParams,vec2(4.0,matIndex),TEX_PARAMS_LENGTH);\n    vroughness = readFloat(texParams,vec2(5.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 glass(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    float kr,kt,eta,vroughness,vroughness;\n    glass_attr(matIndex,kr,kt,eta,vroughness,vroughness);\n    bool isSpecular = urough < EPSILON&&vrough < EPSILON;\n    if(isSpecular){\n        SpecularFr sf = SpecularFr(kr*sc,kt*sc,1.0,eta,into);\n        f = specular_fr_sample_f(sf,u,wo,wi,pdf);\n    }else{\n        MicrofacetDistribution md = MicrofacetDistribution(vroughness,vroughness,TROWBRIDGEREITZ);\n        float p = u.x;\n        u.x = min(u.x * 2.0 - 1.0, ONEMINUSEPSILON);\n        if(p<0.5){\n            Fresnel fresnel = createFresnelD(1.0,eta);\n            MicrofacetR mr = MicrofacetR(kr*sc,fresnel,md);\n            f = microfacet_r_sample_f(mr,u,wo,wi,pdf);\n        }else{\n            MicrofacetT mt = MicrofacetT(kt*sc,1.0,eta,into,md);\n            f = microfacet_t_sample_f(mt,u,wo,wi,pdf);\n        }\n    }\n    return f * absCosTheta(wi)/pdf;\n}\nvec3 glass_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){\n    float kr,kt,eta,vroughness,vroughness;\n    glass_attr(matIndex,kr,kt,eta,vroughness,vroughness);\n    bool isSpecular = vroughness == 0.0&&vroughness == 0.0;\n    if(isSpecular){\n        SpecularFr sf = SpecularFr(kr*sc,kt*sc,1.0,eta,into);\n        return specular_fr_f(sf,wo,wi);\n    }else{\n        MicrofacetDistribution md = MicrofacetDistribution(vroughness,vroughness,TROWBRIDGEREITZ);\n        if(sameHemisphere(wo,wi)){\n            Fresnel fresnel = createFresnelD(1.0,eta);\n            MicrofacetR mr = MicrofacetR(kr*sc,fresnel,md);\n            return microfacet_r_f(mr,wo,wi);\n        }else{\n            MicrofacetT mt = MicrofacetT(kt*sc,1.0,eta,into,md);\n            return microfacet_t_f(mt,wo,wi);\n        }\n    }\n}";

/**
 * Created by eason on 1/20/18.
 */
let plugins$2 = {
    "metal":new Plugin("metal",metal),
    "matte":new Plugin("matte",matte),
    "mirror":new Plugin("mirror",mirror),
    "glass":new Plugin("glass",glass)
};

let head = `vec3 material(Intersect ins,vec3 wo,out vec3 wi,out vec3 f){
    f = BLACK;
    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );
    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );
    vec3 fpdf;if(false){}`;
let tail = `return fpdf;}`;

let ep = new Export("material",head,tail,"ins.matCategory",function(plugin){
    return `fpdf = ${plugin.name}(vec2(u1,u2),ins.matIndex,ins.sc,wo,wi,ins.into);
        f = ${plugin.name}_f(ins.matIndex,ins.sc,wo,wi,ins.into);`
});

var material = new Generator("material",[ssutility,fresnel,microfacet,bsdf],[""],plugins$2,ep);

var shade$1 = "vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){\n    vec3 f,direct = BLACK,_fpdf;\n    vec3 ss = normalize(ins.dpdu),ts = cross(ins.normal,ss);\n    wo = worldToLocal(wo,ins.normal,ss,ts);\n    fpdf = material(ins,wo,wi,f);\n    wi = localToWorld(wi,ins.normal,ss,ts);\n    if(ins.index>=ln&&ins.matCategory==MATTE)\n        for(int i=0;i<ln;i++){\n            vec3 light = sampleGeometry(ins,i,_fpdf);\n            vec3 toLight = light - ins.hit;\n            float d = length(toLight);\n            if(!testShadow(Ray(ins.hit + 0.0001*ins.normal, toLight)))\n                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);\n        }\n    return ins.emission+direct;\n}";

/**
 * Created by eason on 1/21/18.
 */
var shade = new Generator("shade",[shade$1],[""]);

var cube = "struct Cube{\n    vec3 min;\n    vec3 max;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nCube parseCube(float index){\n    Cube cube;\n    cube.min = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    cube.max = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    cube.reverseNormal = readBool(objects,vec2(7.0,index),OBJECTS_LENGTH);\n    cube.matIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.texIndex = readFloat(objects,vec2(9.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.emission = readVec3(objects,vec2(10.0,index),OBJECTS_LENGTH);\n    return cube;\n}\nvec3 normalForCube( vec3 hit, Cube cube){\n    float c = (cube.reverseNormal?-1.0:1.0);\n\tif ( hit.x < cube.min.x + 0.0001 )\n\t\treturn c*vec3( -1.0, 0.0, 0.0 );\n\telse if ( hit.x > cube.max.x - 0.0001 )\n\t\treturn c*vec3( 1.0, 0.0, 0.0 );\n\telse if ( hit.y < cube.min.y + 0.0001 )\n\t\treturn c*vec3( 0.0, -1.0, 0.0 );\n\telse if ( hit.y > cube.max.y - 0.0001 )\n\t\treturn c*vec3( 0.0, 1.0, 0.0 );\n\telse if ( hit.z < cube.min.z + 0.0001 )\n\t\treturn c*vec3( 0.0, 0.0, -1.0 );\n\telse return c*vec3( 0.0, 0.0, 1.0 );\n}\nvoid computeDpDForCube( vec3 normal,out vec3 dpdu,out vec3 dpdv){\n    if (abs(normal.x)<0.5) {\n        dpdu = cross(normal, vec3(1,0,0));\n    }else {\n        dpdu = cross(normal, vec3(0,1,0));\n    }\n    dpdv = cross(normal,dpdu);\n}\nvec3 sampleCube(float seed,Cube cube,out float pdf){\n    return BLACK;\n}\nIntersect intersectCube(Ray ray,Cube cube){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 tMin = (cube.min - ray.origin) / ray.dir;\n    vec3 tMax = (cube.max- ray.origin) / ray.dir;\n    vec3 t1 = min( tMin, tMax );\n    vec3 t2 = max( tMin, tMax );\n    float tNear = max( max( t1.x, t1.y ), t1.z );\n    float tFar = min( min( t2.x, t2.y ), t2.z );\n    float t=-1.0,f;\n    if(tNear>EPSILON&&tNear<tFar) t = tNear;\n    else if(tNear<tFar) t = tFar;\n    if(t > EPSILON){\n        result.d = t;\n        result.hit = ray.origin+t*ray.dir;\n        result.normal = normalForCube(ray.origin+t*ray.dir,cube);\n        computeDpDForCube(result.normal,result.dpdu,result.dpdv);\n        result.matIndex = cube.matIndex;\n        result.sc = getSurfaceColor(result.hit,vec2(0,0),cube.texIndex);\n        result.emission = cube.emission;\n    }\n    return result;\n}";

var sphere = "struct Sphere{\n    vec3 c;\n    float r;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nSphere parseSphere(float index){\n    Sphere sphere;\n    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    sphere.reverseNormal = readBool(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    sphere.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);\n    return sphere;\n}\nvec3 normalForSphere( vec3 hit, Sphere sphere ){\n\treturn (sphere.reverseNormal?-1.0:1.0)*(hit - sphere.c) / sphere.r;\n}\nvoid computeDpDForSphere(vec3 hit,float radius,out vec3 dpdu,out vec3 dpdv){\n    float theta = acos(clamp(hit.z / radius, -1.0, 1.0));\n    float zRadius = sqrt(hit.x * hit.x + hit.y * hit.y);\n    float invZRadius = 1.0 / zRadius;\n    float cosPhi = hit.x * invZRadius;\n    float sinPhi = hit.y * invZRadius;\n    dpdu = vec3(-2.0*PI * hit.y, 2.0*PI * hit.x,0.0);\n    dpdv = PI * vec3(hit.z * cosPhi, hit.z * sinPhi,-radius * sin(theta));\n}\nIntersect intersectSphere(Ray ray,Sphere sphere){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    ray.origin = worldToLocal(ray.origin - sphere.c,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n\tfloat a = dot( ray.dir, ray.dir );\n\tfloat b = 2.0 * dot( ray.origin, ray.dir );\n\tfloat c = dot( ray.origin, ray.origin ) - sphere.r * sphere.r;\n\tfloat t1,t2,t;\n\tif(!quadratic(a,b,c,t1,t2)) return result;\n\tif(t2 < EPSILON) return result;\n    t = t1;\n    if(t1 < EPSILON) t = t2;\n    if(t >= MAX_DISTANCE) return result;\n    vec3 hit = ray.origin+t*ray.dir;\n    if (hit.x == 0.0 && hit.y == 0.0) hit.x = 1e-5f * sphere.r;\n    float phi = atan(hit.y, hit.x);\n    if (phi < 0.0) phi += 2.0 * PI;\n    float u = phi / (2.0 * PI);\n    float theta = acos(clamp(hit.z / sphere.r, -1.0, 1.0));\n    float v = theta / PI;\n    result.d = t;\n    result.hit = ray.origin+t*ray.dir;\n    computeDpDForSphere(result.hit,sphere.r,result.dpdu,result.dpdv);\n    result.normal = normalize(cross(result.dpdv,result.dpdu));\n    result.matIndex = sphere.matIndex;\n    result.sc = getSurfaceColor(result.hit,vec2(u,v),sphere.texIndex);\n    result.emission = sphere.emission;\n    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+sphere.c;\n    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return result;\n}\nvec3 sampleSphere(float seed,Sphere sphere,out float pdf){\n    return BLACK;\n}";

var rectangle = "struct Rectangle{\n    vec3 min;\n    vec3 max;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nRectangle parseRectangle(float index){\n    Rectangle rectangle;\n    rectangle.min = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    rectangle.max = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    rectangle.reverseNormal = readBool(objects,vec2(7.0,index),OBJECTS_LENGTH);\n    rectangle.matIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    rectangle.texIndex = readFloat(objects,vec2(9.0,index),OBJECTS_LENGTH)/float(tn-1);\n    rectangle.emission = readVec3(objects,vec2(10.0,index),OBJECTS_LENGTH);\n    return rectangle;\n}\nvec3 normalForRectangle(vec3 hit,Rectangle rectangle){\n    vec3 x = vec3(rectangle.max.x-rectangle.min.x,0.0,0.0);\n    vec3 y = vec3(0.0,(rectangle.max-rectangle.min).yz);\n    vec3 normal = normalize(cross(x,y));\n    return (rectangle.reverseNormal?-1.0:1.0)*normal;\n}\nIntersect intersectRectangle(Ray ray,Rectangle rectangle){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    result.dpdu = vec3(rectangle.max.x-rectangle.min.x,0.0,0.0);\n    result.dpdv = vec3(0.0,(rectangle.max-rectangle.min).yz);\n    result.normal = normalize(cross(result.dpdu,result.dpdv));\n    float maxX = length(result.dpdu);\n    float maxY = length(result.dpdv);\n    vec3 ss = result.dpdu/maxX,ts = cross(result.normal,ss);\n    ray.dir = worldToLocal(ray.dir,result.normal,ss,ts);\n    ray.origin = worldToLocal(ray.origin - rectangle.min,result.normal,ss,ts);\n    if(ray.dir.z == 0.0) return result;\n    float t = -ray.origin.z/ray.dir.z;\n    if(t < EPSILON) return result;\n    vec3 hit = ray.origin+t*ray.dir;\n    if(hit.x > maxX || hit.y > maxY ||\n        hit.x < -EPSILON || hit.y < -EPSILON) return result;\n    result.d = t;\n    result.matIndex = rectangle.matIndex;\n    result.sc = getSurfaceColor(hit,vec2(hit.x/maxX,hit.y/maxY),rectangle.texIndex);\n    result.emission = rectangle.emission;\n    result.hit = localToWorld(hit,result.normal,ss,ts)+rectangle.min;\n    return result;\n}\nvec3 sampleRectangle(float seed,Rectangle rectangle,out float pdf){\n    vec3 x = vec3(rectangle.max.x-rectangle.min.x,0.0,0.0);\n    vec3 y = vec3(0.0,(rectangle.max-rectangle.min).yz);\n    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n    pdf = 1.0/(length(x)*length(y));\n    return rectangle.min+x*u1+y*u2;\n}";

var cone = "struct Cone{\n    vec3 p;\n    float h;\n    float r;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nCone parseCone(float index){\n    Cone cone;\n    cone.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    cone.h = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    cone.r = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    cone.reverseNormal = readBool(objects,vec2(6.0,index),OBJECTS_LENGTH);\n    cone.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cone.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cone.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);\n    return cone;\n}\nvoid computeDpDForCone(vec3 hit,float h,out vec3 dpdu,out vec3 dpdv){\n    float v = hit.z / h;\n    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);\n    dpdv = vec3(-hit.x / (1.0 - v), -hit.y / (1.0 - v), h);\n}\nvec3 normalForCone(vec3 hit,Cone cone){\n    hit = hit-cone.p;\n    float tana = cone.r/cone.h;\n    float d = sqrt(hit.x*hit.x+hit.y*hit.y);\n    float x1 = d/tana;\n    float x2 = d*tana;\n    vec3 no = vec3(0,0,cone.h-x1-x2);\n    return (cone.reverseNormal?-1.0:1.0)*normalize(hit-no);\n}\nIntersect intersectCone(Ray ray,Cone cone){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    ray.origin = worldToLocal(ray.origin - cone.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    float k = cone.r / cone.h;\n    k = k * k;\n    float a = ray.dir.x * ray.dir.x + ray.dir.y * ray.dir.y - k * ray.dir.z * ray.dir.z;\n    float b = 2.0 * (ray.dir.x * ray.origin.x + ray.dir.y * ray.origin.y - k * ray.dir.z * (ray.origin.z - cone.h));\n    float c = ray.origin.x * ray.origin.x + ray.origin.y * ray.origin.y - k * (ray.origin.z - cone.h) * (ray.origin.z - cone.h);\n    float t1,t2,t;\n    if(!quadratic(a,b,c,t1,t2)) return result;\n    if(t2 < -EPSILON) return result;\n    t = t1;\n    if(t1 < EPSILON) t = t2;\n    vec3 hit = ray.origin+t*ray.dir;\n    if (hit.z < -EPSILON || hit.z > cone.h){\n        if (t == t2) return result;\n        t = t2;\n        hit = ray.origin+t*ray.dir;\n        if (hit.z < -EPSILON || hit.z > cone.h) return result;\n    }\n    if(t >= MAX_DISTANCE) return result;\n    float phi = atan(hit.y, hit.x);\n    if (phi < 0.0) phi += 2.0 * PI;\n    float u = phi / (2.0 * PI);\n    float v = hit.z / cone.h;\n    result.d = t;\n    computeDpDForCone(hit,cone.h,result.dpdu,result.dpdv);\n    result.normal = normalize(cross(result.dpdu,result.dpdv));\n    result.hit = hit;\n    result.matIndex = cone.matIndex;\n    result.sc = getSurfaceColor(result.hit,vec2(u,v),cone.texIndex);\n    result.emission = cone.emission;\n    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+cone.p;\n    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return result;\n}\nvec3 sampleCone(float seed,Cone cone,out float pdf){\n    return BLACK;\n}";

var cylinder = "struct Cylinder{\n    vec3 p;\n    float h;\n    float r;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nCylinder parseCylinder(float index){\n    Cylinder cylinder;\n    cylinder.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    cylinder.h = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    cylinder.r = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    cylinder.reverseNormal = readBool(objects,vec2(6.0,index),OBJECTS_LENGTH);\n    cylinder.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cylinder.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cylinder.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);\n    return cylinder;\n}\nvoid computeDpDForCylinder(vec3 hit,float h,out vec3 dpdu,out vec3 dpdv){\n    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);\n    dpdv = vec3(0, 0, h);\n}\nvec3 normalForCylinder(vec3 hit,Cylinder cylinder){\n    return (cylinder.reverseNormal?-1.0:1.0)*normalize(vec3(hit.xy-cylinder.p.xy,0));\n}\nIntersect intersectCylinder(Ray ray,Cylinder cylinder){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    ray.origin = worldToLocal(ray.origin - cylinder.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    float a = ray.dir.x * ray.dir.x + ray.dir.y * ray.dir.y;\n    float b = 2.0 * (ray.dir.x * ray.origin.x + ray.dir.y * ray.origin.y);\n    float c = ray.origin.x * ray.origin.x + ray.origin.y * ray.origin.y - cylinder.r * cylinder.r;\n    float t1,t2,t;\n    if(!quadratic(a,b,c,t1,t2)) return result;\n    if(t2 < -EPSILON) return result;\n    t = t1;\n    if(t1 < EPSILON) t = t2;\n    vec3 hit = ray.origin+t*ray.dir;\n    if (hit.z < -EPSILON || hit.z > cylinder.h){\n        if (t == t2) return result;\n        t = t2;\n        hit = ray.origin+t*ray.dir;\n        if (hit.z < -EPSILON || hit.z > cylinder.h) return result;\n    }\n    if(t >= MAX_DISTANCE) return result;\n    float phi = atan(hit.y, hit.x);\n    if (phi < 0.0) phi += 2.0 * PI;\n    float u = phi / (2.0 * PI);\n    float v = hit.z / cylinder.h;\n    result.d = t;\n    computeDpDForCylinder(hit,cylinder.h,result.dpdu,result.dpdv);\n    result.normal = normalize(cross(result.dpdu,result.dpdv));\n    result.hit = hit;\n    result.matIndex = cylinder.matIndex;\n    result.sc = getSurfaceColor(result.hit,vec2(u,v),cylinder.texIndex);\n    result.emission = cylinder.emission;\n    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+cylinder.p;\n    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return result;\n}\nvec3 sampleCylinder(float seed,Cylinder cylinder,out float pdf){\n    return BLACK;\n}";

var disk = "struct Disk{\n    vec3 p;\n    float r;\n    float innerR;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nDisk parseDisk(float index){\n    Disk disk;\n    disk.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    disk.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    disk.innerR = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    disk.reverseNormal = readBool(objects,vec2(6.0,index),OBJECTS_LENGTH);\n    disk.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    disk.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    disk.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);\n    return disk;\n}\nvoid computeDpDForDisk(vec3 hit,float r,float innerR,float dist2,out vec3 dpdu,out vec3 dpdv){\n    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);\n    dpdv = vec3(hit.x, hit.y, 0) * (innerR - r) / sqrt(dist2);\n}\nvec3 normalForDisk(vec3 hit,Disk disk){\n    return (disk.reverseNormal?-1.0:1.0)*vec3(0,-1,0);\n}\nIntersect intersectDisk(Ray ray,Disk disk){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    ray.origin = worldToLocal(ray.origin - disk.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    if (ray.dir.z == 0.0) return result;\n    float t = -ray.origin.z / ray.dir.z;\n    if (t <= 0.0) return result;\n    vec3 hit = ray.origin+t*ray.dir;\n    float dist2 = hit.x * hit.x + hit.y * hit.y;\n    if (dist2 > disk.r * disk.r || dist2 < disk.innerR * disk.innerR)\n        return result;\n    if(t >= MAX_DISTANCE) return result;\n    float phi = atan(hit.y, hit.x);\n    if(phi < 0.0) phi += 2.0 * PI;\n    float u = phi / (2.0 * PI);\n    float rHit = sqrt(dist2);\n    float oneMinusV = ((rHit - disk.innerR) / (disk.r - disk.innerR));\n    float v = 1.0 - oneMinusV;\n    result.d = t;\n    computeDpDForDisk(hit,disk.r,disk.innerR,dist2,result.dpdu,result.dpdv);\n    result.normal = normalize(cross(result.dpdu,result.dpdv));\n    result.hit = hit;\n    result.matIndex = disk.matIndex;\n    result.sc = getSurfaceColor(result.hit,vec2(u,v),disk.texIndex);\n    result.emission = disk.emission;\n    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+disk.p;\n    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return result;\n}\nvec3 sampleDisk(float seed,Disk disk,out float pdf){\n    vec2 pd = ConcentricSampleDisk(seed);\n    vec3 p = vec3(pd.x * disk.r + disk.p.x, disk.p.y, pd.y * disk.r + disk.p.z);\n    float area = 2.0 * PI * 0.5 * (disk.r * disk.r - disk.innerR * disk.innerR);\n    pdf = 1.0 / area;\n    return p;\n}";

var hyperboloid = "struct Hyperboloid{\n    vec3 p;\n    vec3 p1;\n    vec3 p2;\n    float ah;\n    float ch;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nHyperboloid parseHyperboloid(float index){\n    Hyperboloid hyperboloid;\n    hyperboloid.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    hyperboloid.p1 = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    hyperboloid.p2 = readVec3(objects,vec2(7.0,index),OBJECTS_LENGTH);\n    hyperboloid.ah = readFloat(objects,vec2(10.0,index),OBJECTS_LENGTH);\n    hyperboloid.ch = readFloat(objects,vec2(11.0,index),OBJECTS_LENGTH);\n    hyperboloid.reverseNormal = readBool(objects,vec2(12.0,index),OBJECTS_LENGTH);\n    hyperboloid.matIndex = readFloat(objects,vec2(13.0,index),OBJECTS_LENGTH)/float(tn-1);\n    hyperboloid.texIndex = readFloat(objects,vec2(14.0,index),OBJECTS_LENGTH)/float(tn-1);\n    hyperboloid.emission = readVec3(objects,vec2(15.0,index),OBJECTS_LENGTH);\n    return hyperboloid;\n}\nvoid computeDpDForHyperboloid(vec3 hit,vec3 p1,vec3 p2,float phi,out vec3 dpdu,out vec3 dpdv){\n    float sinPhi = sin(phi),cosPhi = cos(phi);\n    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);\n    dpdv = vec3((p2.x - p1.x) * cosPhi - (p2.y - p1.y) * sinPhi,\n                      (p2.x - p1.x) * sinPhi + (p2.y - p1.y) * cosPhi, p2.z - p1.z);\n}\nvec3 normalForHyperboloid(vec3 hit,Hyperboloid hyperboloid){\n    float v = (hit.z - hyperboloid.p1.z) / (hyperboloid.p2.z - hyperboloid.p1.z);\n    vec3 pr = (1.0 - v) * hyperboloid.p1 + v * hyperboloid.p2;\n    float phi = atan(pr.x * hit.y - hit.x * pr.y,\n                         hit.x * pr.x + hit.y * pr.y);\n    if (phi < 0.0) phi += 2.0 * PI;\n    vec3 dpdu,dpdv;\n    computeDpDForHyperboloid(hit,hyperboloid.p1,hyperboloid.p2,phi,dpdu,dpdv);\n    vec3 normal = localToWorld(normalize(cross(dpdu,dpdv)),OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return (hyperboloid.reverseNormal?-1.0:1.0)*normal;\n}\nIntersect intersectHyperboloid(Ray ray,Hyperboloid hyperboloid){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    ray.origin = worldToLocal(ray.origin - hyperboloid.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    float a = hyperboloid.ah * ray.dir.x * ray.dir.x + hyperboloid.ah * ray.dir.y * ray.dir.y - hyperboloid.ch * ray.dir.z * ray.dir.z;\n    float b = 2.0 * (hyperboloid.ah * ray.dir.x * ray.origin.x + hyperboloid.ah * ray.dir.y * ray.origin.y - hyperboloid.ch * ray.dir.z * ray.origin.z);\n    float c = hyperboloid.ah * ray.origin.x * ray.origin.x + hyperboloid.ah * ray.origin.y * ray.origin.y - hyperboloid.ch * ray.origin.z * ray.origin.z - 1.0;\n    float t1,t2,t;\n    if(!quadratic(a,b,c,t1,t2)) return result;\n    if(t2 < -EPSILON) return result;\n    t = t1;\n    if(t1 < EPSILON) t = t2;\n    vec3 hit = ray.origin+t*ray.dir;\n    float zMin = min(hyperboloid.p1.z, hyperboloid.p2.z);\n    float zMax = max(hyperboloid.p1.z, hyperboloid.p2.z);\n    if (hit.z < zMin || hit.z > zMax){\n        if (t == t2) return result;\n        t = t2;\n        hit = ray.origin+t*ray.dir;\n        if (hit.z < zMin || hit.z > zMax) return result;\n    }\n    if(t >= MAX_DISTANCE) return result;\n    float v = (hit.z - hyperboloid.p1.z) / (hyperboloid.p2.z - hyperboloid.p1.z);\n    vec3 pr = (1.0 - v) * hyperboloid.p1 + v * hyperboloid.p2;\n    float phi = atan(pr.x * hit.y - hit.x * pr.y,\n                             hit.x * pr.x + hit.y * pr.y);\n    if (phi < 0.0) phi += 2.0 * PI;\n    float u = phi / (2.0*PI);\n    result.d = t;\n    computeDpDForHyperboloid(hit,hyperboloid.p1,hyperboloid.p2,phi,result.dpdu,result.dpdv);\n    result.normal = normalize(cross(result.dpdu,result.dpdv));\n    result.hit = hit;\n    result.matIndex = hyperboloid.matIndex;\n    result.sc = getSurfaceColor(result.hit,vec2(u,v),hyperboloid.texIndex);\n    result.emission = hyperboloid.emission;\n    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+hyperboloid.p;\n    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return result;\n}\nvec3 sampleHyperboloid(float seed,Hyperboloid hyperboloid,out float pdf){\n    return BLACK;\n}";

var paraboloid = "struct Paraboloid{\n    vec3 p;\n    float z0;\n    float z1;\n    float r;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n    bool reverseNormal;\n};\nParaboloid parseParaboloid(float index){\n    Paraboloid paraboloid;\n    paraboloid.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    paraboloid.z0 = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    paraboloid.z1 = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    paraboloid.r = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH);\n    paraboloid.reverseNormal = readBool(objects,vec2(7.0,index),OBJECTS_LENGTH);\n    paraboloid.matIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    paraboloid.texIndex = readFloat(objects,vec2(9.0,index),OBJECTS_LENGTH)/float(tn-1);\n    paraboloid.emission = readVec3(objects,vec2(10.0,index),OBJECTS_LENGTH);\n    return paraboloid;\n}\nvoid computeDpDForParaboloid(vec3 hit,float zMax,float zMin,out vec3 dpdu,out vec3 dpdv){\n    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);\n    dpdv = (zMax - zMin) *\n                vec3(hit.x / (2.0 * hit.z), hit.y / (2.0 * hit.z), 1);\n}\nvec3 normalForParaboloid(vec3 hit,Paraboloid paraboloid){\n    float zMin = min(paraboloid.z0, paraboloid.z1);\n    float zMax = max(paraboloid.z0, paraboloid.z1);\n    vec3 dpdu,dpdv;\n    computeDpDForParaboloid(hit,zMax,zMin,dpdu,dpdv);\n    vec3 normal = localToWorld(normalize(cross(dpdu,dpdv)),OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return (paraboloid.reverseNormal?-1.0:1.0)*normal;\n}\nIntersect intersectParaboloid(Ray ray,Paraboloid paraboloid){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    ray.origin = worldToLocal(ray.origin - paraboloid.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    float zMin = min(paraboloid.z0, paraboloid.z1);\n    float zMax = max(paraboloid.z0, paraboloid.z1);\n    float k = zMax / (paraboloid.r * paraboloid.r);\n    float a = k * (ray.dir.x * ray.dir.x + ray.dir.y * ray.dir.y);\n    float b = 2.0 * k * (ray.dir.x * ray.origin.x + ray.dir.y * ray.origin.y) - ray.dir.z;\n    float c = k * (ray.origin.x * ray.origin.x + ray.origin.y * ray.origin.y) - ray.origin.z;\n    float t1,t2,t;\n    if(!quadratic(a,b,c,t1,t2)) return result;\n    if(t2 < -EPSILON) return result;\n    t = t1;\n    if(t1 < EPSILON) t = t2;\n    vec3 hit = ray.origin+t*ray.dir;\n    if (hit.z < zMin || hit.z > zMax){\n        if (t == t2) return result;\n        t = t2;\n        hit = ray.origin+t*ray.dir;\n        if (hit.z < zMin || hit.z > zMax) return result;\n    }\n    if(t >= MAX_DISTANCE) return result;\n    float phi = atan(hit.y, hit.x);\n    if (phi < 0.0) phi += 2.0 * PI;\n    float u = phi / (2.0*PI);\n    float v = (hit.z - zMin) / (zMax - zMin);\n    result.d = t;\n    computeDpDForParaboloid(hit,zMax,zMin,result.dpdu,result.dpdv);\n    result.normal = normalize(cross(result.dpdu,result.dpdv));\n    result.hit = hit;\n    result.matIndex = paraboloid.matIndex;\n    result.sc = getSurfaceColor(result.hit,vec2(u,v),paraboloid.texIndex);\n    result.emission = paraboloid.emission;\n    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+paraboloid.p;\n    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);\n    return result;\n}\nvec3 sampleParaboloid(float seed,Paraboloid paraboloid,out float pdf){\n    return BLACK;\n}";

/**
 * Created by eason on 1/21/18.
 */
let plugins$3 = {
    "cube":new Plugin("cube",cube),
    "sphere":new Plugin("sphere",sphere),
    "rectangle":new Plugin("rectangle",rectangle),
    "cone":new Plugin("cone",cone),
    "cylinder":new Plugin("cylinder",cylinder),
    "disk":new Plugin("disk",disk),
    "hyperboloid":new Plugin("hyperboloid",hyperboloid),
    "paraboloid":new Plugin("paraboloid",paraboloid)
};

let intersectHead = `Intersect intersectObjects(Ray ray){
    Intersect ins;
    ins.d = MAX_DISTANCE;
    for(int i=0;i<ln+n;i++){
        Intersect tmp;
        tmp.d = MAX_DISTANCE;
        int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
        if(false) {}`;
let intersectTail = `if(tmp.d < ins.d) ins = tmp;}

ins.matCategory = readInt(texParams,vec2(0.0,ins.matIndex),TEX_PARAMS_LENGTH);
ins.into = dot(ins.normal,ray.dir) < -EPSILON;
if(!ins.into) {
    ins.normal = -ins.normal;
}
return ins;}`;

let intersect = new Export("intersect",intersectHead,intersectTail,"category",function(plugin){
    return `${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
    tmp = intersect${plugin.capitalName()}(ray,${plugin.name});
    vec3 n = (${plugin.name}.reverseNormal?-1.0:1.0)*tmp.normal;
    bool faceObj = dot(n,ray.dir)<-EPSILON;
    tmp.emission = faceObj?tmp.emission:BLACK;
    tmp.index = i;`
});

let sampleHead = `
    vec3 sampleGeometry(Intersect ins,int i,out vec3 fpdf){
    fpdf = BLACK;
    int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
    vec3 result = BLACK;if(false){}
`;
let sampleTail = `return result;}`;

let sample = new Export("sample",sampleHead,sampleTail,"category",function(plugin){
    return `float pdf;
        ${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
        result = sample${plugin.capitalName()}(ins.seed,${plugin.name},pdf);
        vec3 normal = normalFor${plugin.capitalName()}(result,${plugin.name});
        fpdf = ${plugin.name}.emission*max(0.0,dot(normal,ins.hit-result))/pdf;`
});

let testShadow = `
bool testShadow(Ray ray){
    Intersect ins = intersectObjects(ray);
    if(ins.index>=ln&&ins.d>EPSILON&&ins.d<1.0)
        return true;
    return false;
}
`;
var shape = new Generator("shape",[""],[testShadow],plugins$3,intersect,sample);

var noise = "const int NoisePermSize = 256;\nint NoisePerm[] = int[2 * NoisePermSize](\n    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,\n    36, 103, 30, 69, 142,\n    8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62,\n    94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174,\n    20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77,\n    146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55,\n    46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76,\n    132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100,\n    109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147,\n    118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28,\n    42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,\n    155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,\n    178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,\n    191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,\n    181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,\n    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66,\n    215, 61, 156, 180, 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194,\n    233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,\n    148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,\n    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74,\n    165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60,\n    211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,\n    63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135,\n    130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226,\n    250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59,\n    227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2,\n    44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19,\n    98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251,\n    34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,\n    14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115,\n    121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72,\n    243, 141, 128, 195, 78, 66, 215, 61, 156, 180);\nfloat Grad(int x, int y, int z, float dx, float dy, float dz) {\n    int h = NoisePerm[NoisePerm[NoisePerm[x] + y] + z];\n    h &= 15;\n    float u = h < 8 || h == 12 || h == 13 ? dx : dy;\n    float v = h < 4 || h == 12 || h == 13 ? dy : dz;\n    return ((h & 1)!=0 ? -u : u) + ((h & 2)!=0 ? -v : v);\n}\nfloat noiseWeight(float t) {\n    float t3 = t * t * t;\n    float t4 = t3 * t;\n    return 6.0 * t4 * t - 15.0 * t4 + 10.0 * t3;\n}\nfloat noise(float x, float y, float z) {\n    int ix = int(floor(x)), iy = int(floor(y)), iz = int(floor(z));\n    float dx = x - float(ix), dy = y - float(iy), dz = z - float(iz);\n    ix &= NoisePermSize - 1;\n    iy &= NoisePermSize - 1;\n    iz &= NoisePermSize - 1;\n    float w000 = Grad(ix, iy, iz, dx, dy, dz);\n    float w100 = Grad(ix + 1, iy, iz, dx - 1.0, dy, dz);\n    float w010 = Grad(ix, iy + 1, iz, dx, dy - 1.0, dz);\n    float w110 = Grad(ix + 1, iy + 1, iz, dx - 1.0, dy - 1.0, dz);\n    float w001 = Grad(ix, iy, iz + 1, dx, dy, dz - 1.0);\n    float w101 = Grad(ix + 1, iy, iz + 1, dx - 1.0, dy, dz - 1.0);\n    float w011 = Grad(ix, iy + 1, iz + 1, dx, dy - 1.0, dz - 1.0);\n    float w111 = Grad(ix + 1, iy + 1, iz + 1, dx - 1.0, dy - 1.0, dz - 1.0);\n    float wx = noiseWeight(dx), wy = noiseWeight(dy), wz = noiseWeight(dz);\n    float x00 = mix(w000, w100, wx);\n    float x10 = mix(w010, w110, wx);\n    float x01 = mix(w001, w101, wx);\n    float x11 = mix(w011, w111, wx);\n    float y0 = mix(x00, x10, wy);\n    float y1 = mix(x01, x11, wy);\n    return mix(y0, y1, wz);\n}\nfloat noise(vec3 p){\n    return noise(p.x,p.y,p.z);\n}\nfloat fbm(vec3 p, float omega, int maxOctaves) {\n    int nInt = maxOctaves/2;\n    float sum = 0.0, lambda = 1.0, o = 1.0;\n    for (int i = 0; i < nInt; ++i) {\n        sum += o * noise(lambda * p);\n        lambda *= 1.99f;\n        o *= omega;\n    }\n    float nPartial = float(maxOctaves - nInt);\n    sum += o * smoothstep(0.3, 0.7, nPartial) * noise(lambda * p);\n    return sum;\n}\nfloat turbulence(vec3 p, float omega, int maxOctaves) {\n    int nInt = maxOctaves/2;\n    float sum = 0.0, lambda = 1.0, o = 1.0;\n    for (int i = 0; i < nInt; ++i) {\n        sum += o * abs(noise(lambda * p));\n        lambda *= 1.99;\n        o *= omega;\n    }\n    float nPartial = float(maxOctaves - nInt);\n    sum += o * mix(0.2, abs(noise(lambda * p)),smoothstep(0.3, 0.7, nPartial));\n    for (int i = nInt; i < maxOctaves; ++i) {\n        sum += o * 0.2;\n        o *= omega;\n    }\n    return sum;\n}";

var checkerboard = "void checkerboard_attr(float texIndex,out float size,out float lineWidth){\n    size = readFloat(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    lineWidth = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 checkerboard(vec3 hit,vec2 uv,float texIndex){\n    float size,lineWidth;\n    checkerboard_attr(texIndex,size,lineWidth);\n    float width = 0.5 * lineWidth / size;\n    float fx = hit.x/size-floor(hit.x/size),\n    fy = hit.y/size-floor(hit.y/size),\n    fz = hit.z/size-floor(hit.z/size);\n    bool in_outline = (fx<width||fx>1.0-width)||(fy<width||fy>1.0-width)||(fz<width||fz>1.0-width);\n    if (!in_outline) {\n        return WHITE;\n    } else {\n        return GREY;\n    }\n}";

var checkerboard2 = "void checkerboard2_attr(float texIndex,out vec3 color1,out vec3 color2){\n    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 checkerboard2(vec3 hit,vec2 uv,float texIndex){\n    vec3 color1,color2;\n    checkerboard2_attr(texIndex,color1,color2);\n    uv = 10.0*uv;\n    uv = vec2(floor(uv.x),floor(uv.y));\n    if(int(uv.x+uv.y)%2==0) return color1;\n    return color2;\n}";

var cornellbox = "void cornellbox_attr(float texIndex,out vec3 min,out vec3 max){\n    min = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    max = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 cornellbox(vec3 hit,vec2 uv,float texIndex){\n    vec3 min,max;\n    cornellbox_attr(texIndex,min,max);\n    if ( hit.x < min.x + 0.0001 )\n    \treturn YELLOW;\n    else if ( hit.x > max.x - 0.0001 )\n    \treturn BLUE;\n    else if ( hit.y < min.y + 0.0001 )\n    \treturn WHITE;\n    else if ( hit.y > max.y - 0.0001 )\n    \treturn WHITE;\n    else if ( hit.z > min.z - 0.0001 )\n    \treturn WHITE;\n    return BLACK;\n}";

var bilerp = "void bilerp_attr(float texIndex,out vec3 color00,out vec3 color01,out vec3 color10,out vec3 colory11){\n    color00 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    color01 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n    color10 = readVec3(texParams,vec2(7.0,texIndex),TEX_PARAMS_LENGTH);\n    color11 = readVec3(texParams,vec2(10.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 bilerp(vec3 hit,vec2 uv,float texIndex){\n    vec3 color00,color01,color10,colory11;\n    bilerp_attr(texIndex,color00,color01,color10,colory11);\n    return (1.0 - uv.x) * (1.0 - uv.y) * color00 + (1.0 - uv.x) * (uv.y) * color01 +\n                   (uv.x) * (1.0 - uv.y) * color10 + (uv.x) * (uv.y) * colory11;\n}";

var mixf = "void mix_attr(float texIndex,out vec3 color1,out vec3 color2,out float amount){\n    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n    amount = readFloat(texParams,vec2(7.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 mixf(vec3 hit,vec2 uv,float texIndex){\n    vec3 color1,color2;\n    float amount;\n    mix_attr(texIndex,color1,color2,amount);\n    return (1.0 - amount) * color1 + amount * color2;\n}\n";

var scale = "void scale_attr(float texIndex,out vec3 color1,out vec3 color2){\n    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 scale(vec3 hit,vec2 uv,float texIndex){\n    vec3 color1,color2;\n    scale_attr(texIndex,color1,color2);\n    return color1 * color2;\n}\n";

var uvf = "vec3 uvf(vec3 hit,vec2 uv,float texIndex){\n    return vec3(uv.x-floor(uv.x),uv.y-floor(uv.y),0);\n}\n";

/**
 * Created by eason on 1/20/18.
 */
let plugins$4 = {
    "checkerboard":new Plugin("checkerboard",checkerboard),
    "checkerboard2":new Plugin("checkerboard2",checkerboard2),
    "cornellbox":new Plugin("cornellbox",cornellbox),
    "bilerp":new Plugin("bilerp",bilerp),
    "mixf":new Plugin("mixf",mixf),
    "scale":new Plugin("scale",scale),
    "uvf":new Plugin("uvf",uvf),
};

let head$1 = `vec3 getSurfaceColor(vec3 hit,vec2 uv,float texIndex){
    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);
    if(texCategory==UNIFORM_COLOR) return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);`;
let tail$1 = `return BLACK;}`;

let ep$1 = new Export("getSurfaceColor",head$1,tail$1,"texCategory",function(plugin){
    return `return ${plugin.name}(hit,uv,texIndex);`
});

var texture = new Generator("texture",[noise],[""],plugins$4,ep$1);

var pathtrace = "void trace(Ray ray,out vec3 e,int maxDeepth){\n    vec3 fpdf = WHITE;e = BLACK;\n    int deepth=0;\n    while(++deepth<=maxDeepth){\n        Intersect ins = intersectObjects(ray);\n        ins.seed = timeSinceStart + float(deepth);\n        if(ins.d>=MAX_DISTANCE) break;\n        vec3 wi;\n        vec3 _fpdf;\n        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;\n        fpdf *= clamp(_fpdf,BLACK,WHITE);\n        float outdot = dot(ins.normal,wi);\n        ray.origin = ins.hit+ins.normal*(outdot>EPSILON?0.0001:-0.0001);\n        ray.dir = wi;\n    }\n}";

/**
 * Created by eason on 1/21/18.
 */
let plugins$5 = {
    "pathtrace":new Plugin("pathtrace",pathtrace)
};

var trace = new Generator("trace",[""],[""],plugins$5);

var random = "float random( vec3 scale, float seed ){\n\treturn(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );\n}\nvec2 random2(float seed){\n\treturn vec2(fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453 + seed),\n\t\tfract(cos(dot(gl_FragCoord.xy ,vec2(4.898,7.23))) * 23421.631 + seed));\n}";

var sampler = "vec3 uniformlyRandomDirection(vec2 u){\n\tfloat z = 1.0 - 2.0 * u.x;   float r = sqrt( 1.0 - z * z );\n\tfloat angle = 2.0 * PI * u.y;\n\treturn vec3( r * cos( angle ), r * sin( angle ), z );\n}\nvec3 cosineSampleHemisphere(vec2 u){\n\tfloat r = sqrt(u.x);\n\tfloat angle = 2.0 * PI * u.y;\n\treturn vec3(r*cos(angle),r*sin(angle),sqrt(1.-u.x));\n}\nvec3 cosineSampleHemisphere2(vec2 u){\n\tfloat angle = 2.0 * PI * u.y;\n\treturn vec3(u.x*cos(angle),u.x*sin(angle),cos(asin(u.x)));\n}\nvec2 uniformSampleDisk(vec2 u, float seed) {\n    float r = sqrt(u.x);\n    float theta = 2.0 * PI * u.y;\n    return vec2(r * cos(theta), r * sin(theta));\n}\nvec2 concentricSampleDisk(vec2 u, float seed){\n    float uOffset = 2.0 * u.x - 1.0;\n    float vOffset = 2.0 * u.y - 1.0;\n    if (uOffset == 0.0 && vOffset == 0.0) return vec2(0, 0);\n    float theta, r;\n    if (abs(uOffset) > abs(vOffset)) {\n        r = uOffset;\n        theta =(vOffset / uOffset) * PIOVER4;\n    } else {\n        r = vOffset;\n        theta = PIOVER2 - (uOffset / vOffset) * PIOVER4;\n    }\n    return r * vec2(cos(theta), sin(theta));\n}\nvec3 uniformSampleCone(vec2 u,float cosThetaMax) {\n    float cosTheta = (1.0 - u.x) + u.x * cosThetaMax;\n    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);\n    float phi = u.y * 2.0 * PI;\n    return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta,\n                    cosTheta);\n}\nvec2 uniformSampleTriangle(vec2 u) {\n    float su0 = sqrt(u.x);\n    return vec2(1.0 - su0, u.y * su0);\n}";

var texhelper = "vec2 convert(vec2 pos,float width){\n    pos.x = pos.x/width;\n    return pos;\n}\nint readInt(sampler2D tex,vec2 pos,float width){\n    return int(texture(tex,convert(pos,width)).r);\n}\nfloat readFloat(sampler2D tex,vec2 pos,float width){\n    return texture(tex,convert(pos,width)).r;\n}\nbool readBool(sampler2D tex,vec2 pos,float width){\n    return readInt(tex,pos,width)==1;\n}\nvec2 readVec2(sampler2D tex,vec2 pos,float width){\n    vec2 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    return result;\n}\nvec3 readVec3(sampler2D tex,vec2 pos,float width){\n    vec3 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.z = texture(tex,pos).r;\n    return result;\n}";

var utility = "vec3 worldToLocal(vec3 v,vec3 ns,vec3 ss,vec3 ts){\n    return vec3(dot(v,ss),dot(v,ts),dot(v,ns));\n}\nvec3 localToWorld(vec3 v,vec3 ns,vec3 ss,vec3 ts){\n    return vec3(ss.x * v.x + ts.x * v.y + ns.x * v.z,\n        ss.y * v.x + ts.y * v.y + ns.y * v.z,\n        ss.z * v.x + ts.z * v.y + ns.z * v.z);\n}\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nvec3 ortho(vec3 d) {\n\tif (abs(d.x)>0.00001 || abs(d.y)>0.00001) {\n\t\treturn vec3(d.y,-d.x,0.0);\n\t} else  {\n\t\treturn vec3(0.0,d.z,-d.y);\n\t}\n}\nfloat maxComponent(vec3 v){\n    return max(max(v.x,v.y),v.z);\n}\nvoid swap(inout float f1,inout float f2){\n    float tmp = f1;\n    f1 = f2;\n    f2 = tmp;\n}\nbool quadratic(float A,float B,float C,out float t0,out float t1) {\n    float discrim = B * B - 4.0 * A * C;\n    if (discrim < 0.0) return false;\n    float rootDiscrim = sqrt(discrim);\n    float q;\n    if (B < 0.0)\n        q = -0.5 * (B - rootDiscrim);\n    else\n        q = -0.5 * (B + rootDiscrim);\n    t0 = q / A;\n    t1 = C / q;\n    if (t0 > t1) swap(t0, t1);\n    return true;\n}\nvec3 sphericalDirection(float sinTheta, float cosTheta, float phi) {\n    return vec3(sinTheta * cos(phi), sinTheta * sin(phi),\n                    cosTheta);\n}\nbool equalZero(float x){\n    return x < 1e-4 && x > -1e-4;\n}";

/**
 * Created by eason on 1/20/18.
 */
let plugins$6 = {
    "random":new Plugin("random",random),
    "sampler":new Plugin("sampler",sampler),
    "texhelper":new Plugin("texhelper",texhelper),
    "utility":new Plugin("utility",utility)
};

var util = new Generator("util",[""],[""],plugins$6);

/**
 * Created by eason on 1/20/18.
 */
class Shader{
    constructor(pluginsList){
        this.pluginsList = pluginsList;
        this.glslv = "300 es";
    }
}

class TraceShader extends Shader{
    constructor(pluginsList = {shape:[],texture:[],material:[],trace:"pathtrace"}){
        super(pluginsList);

        this.uniform = {
            n:{type:'int',value:0},
            ln:{type:'int',value:0},
            tn:{type:'int',value:0},
            textureWeight:{type:'float',value:0},
            timeSinceStart:{type:'float',value:0},
            matrix:{type:'mat4',value:Matrix.I(4)},
            eye:{type:'vec3',value:Vector.Zero(3)},
        };
        this.texture = {
            cache:0,
            objects:1,
            texParams:2
        };
    }

    combinefs(){
        return `#version ${this.glslv}\n`
            + `precision highp float;
               precision highp int;\n`
            + this.uniformstr()
            + c.generate()
            + util.generate(
                new PluginParams("random"),
                new PluginParams("sampler"),
                new PluginParams("texhelper"),
                new PluginParams("utility")
            )
            + texture.generate(...this.pluginsList.texture)
            + material.generate(...this.pluginsList.material)
            + shape.generate(...this.pluginsList.shape)
            + shade.generate()
            + trace.generate(this.pluginsList.trace)
            + main.generate(new PluginParams("fstrace"))
    }

    combinevs(){
        return `#version ${this.glslv}\n`
            + `precision highp float;
               precision highp int;\n`
            + this.uniformstr()
            + util.generate(new PluginParams("utility"))
            + main.generate(new PluginParams("vstrace"))
    }

    uniformstr(){
        let result = "";
        for(let entry of Object.entries(this.uniform)){
            result += `uniform ${entry[1].type} ${entry[0]};\n`;
        }
        for(let entry of Object.entries(this.texture)){
            result += `uniform sampler2D ${entry[0]};\n`;
        }
        return result;
    }
}


class RenderShader extends Shader{
    constructor(pluginsList={filter:"gamma"}){
        super(pluginsList);

        this.texture = {
            tex:0
        };
    }

    combinefs(){
        return `#version ${this.glslv}\n`
            + `precision highp float;\n`
            + this.uniformstr()
            + filter.generate(this.pluginsList.filter)
            + main.generate(new PluginParams("fsrender"))
    }

    combinevs(){
        return `#version ${this.glslv}\n`
            + this.uniformstr()
            + main.generate(new PluginParams("vsrender"))
    }

    uniformstr(){return `uniform sampler2D tex;\n`}
}

/**
 * Created by eason on 17-3-21.
 */
class Tracer {
    constructor(){
        this.shader = new ShaderProgram(true);
        this.timeStart = new Date();

        this.objects_tex = {};
        this.params_tex = {};
    }

    update(scene){
        this.shader.setProgram(new TraceShader(scene.tracerConfig()));
        //序列化场景数据
        let objects = [],texparams = [];
        for(let object of scene.objects){
            objects.push(...object.gen(texparams.length/ShaderProgram.TEXPARAMS_LENGTH));
            texparams.push(...object.genTexparams());
        }

        let data_objects = new Float32Array(objects);//物体数据
        let data_texparams = new Float32Array(texparams);//材质参数

        let n = parseInt(objects.length/ShaderProgram.OBJECTS_LENGTH);
        let tn = parseInt(texparams.length/ShaderProgram.TEXPARAMS_LENGTH);

        this.objects_tex = WebglHelper.createTexture();
        this.params_tex = WebglHelper.createTexture();
        WebglHelper.setTexture(
            this.objects_tex,1,
            ShaderProgram.OBJECTS_LENGTH, n,
            gl.R32F,gl.RED,gl.FLOAT,data_objects,true
        );
        WebglHelper.setTexture(
            this.params_tex,2,
            ShaderProgram.TEXPARAMS_LENGTH, tn,
            gl.R32F,gl.RED,gl.FLOAT,data_texparams,true
        );

        this.shader.uniform.n.value = scene.obcount;
        this.shader.uniform.ln.value = scene.lgcount;
        this.shader.uniform.tn.value = tn;
    }

    render(modelviewProjection,eye,sampleCount){
        this.shader.uniform.eye.value = eye;
        this.shader.uniform.matrix.value = Matrix.Translation(
            new Vector([(Math.random() * 2 - 1), (Math.random() * 2 - 1), 0]).multiply(1/512)
        ).multiply(modelviewProjection).inverse();
        this.shader.uniform.textureWeight.value = sampleCount===0?0.0001:sampleCount / (sampleCount + 1);
        this.shader.uniform.timeSinceStart.value = (new Date() - this.timeStart) * 0.001;

        this.shader.render();
    }
}

/**
 * Created by eason on 17-3-21.
 */
class Renderer {
    constructor(canvas){
        WebglHelper.initWebgl(canvas);

        this.shader = new ShaderProgram();

        this.tracer = new Tracer();
    }

    update(scene){
        this.shader.setProgram(new RenderShader(scene.rendererConfig()));
        this.tracer.update(scene);
    }

    render(scene){
        WebglHelper.clearScreen();
        this.tracer.render(scene.mat,scene.eye,scene.sampleCount);
        this.shader.render();
        scene.sampleCount++;
    }
}

/**
 * Created by eason on 17-4-12.
 */
class Camera {
    constructor(eye, center, up=[0,1,0]){
        this.eye = new Vector(eye);
        this.center = new Vector(center);
        this.up = new Vector(up);

        this.makePerspective();
        this.makeLookAt();
    }

    makePerspective(fovy=55, aspect=1, znear=10, zfar=100){
        let top = znear * Math.tan(fovy * Math.PI / 360.0);
        let bottom = -top;
        let left = bottom * aspect;
        let right = top * aspect;

        let X = 2*znear/(right-left);
        let Y = 2*znear/(top-bottom);
        let A = (right+left)/(right-left);
        let B = (top+bottom)/(top-bottom);
        let C = -(zfar+znear)/(zfar-znear);
        let D = -2*zfar*znear/(zfar-znear);

        this.projection = new Matrix([
            [X, 0, A, 0],
            [0, Y, B, 0],
            [0, 0, C, D],
            [0, 0, -1, 0]
        ]);
    }

    makeLookAt(){
        let z = this.eye.subtract(this.center).toUnitVector();
        let x = this.up.cross(z).toUnitVector();
        let y = z.cross(x).toUnitVector();
        x = x.x(-1);

        let m = new Matrix([
            [x.e(1), x.e(2), x.e(3), 0],
            [y.e(1), y.e(2), y.e(3), 0],
            [z.e(1), z.e(2), z.e(3), 0],
            [0, 0, 0, 1]
        ]);

        let t = new Matrix([
            [1, 0, 0, -this.eye.e(1)],
            [0, 1, 0, -this.eye.e(2)],
            [0, 0, 1, -this.eye.e(3)],
            [0, 0, 0, 1]
        ]);

        this.modelview = m.x(t);
    }

    update(){
        this.makeLookAt();
    }
}

/**
 * Created by eason on 17-4-11.
 */
class Object$1{
    constructor(material,texture,emission=[0,0,0],reverseNormal=false){
        this.material = material;
        this.texture = texture;
        this.emission = new Vector(emission);
        this.reverseNormal = reverseNormal?1:0;

        this.light = !this.emission.eql(new Vector([0,0,0]));
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(data,texparamID){
        data.push(
            this.reverseNormal,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        );
        let l = data.length;
        data.length = ShaderProgram.OBJECTS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Cube extends Object$1{
    constructor(min,max,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.min = new Vector(min);
        this.max = new Vector(max);
    }

    get pluginName(){
        return "cube";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

class Sphere extends Object$1{
    constructor(c,r,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.c = new Vector(c);
        this.r = r;
        this.material = material;
    }

    get pluginName(){
        return "sphere";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),this.r
        ];
        return super.gen(tmp,texparamID);
    }
}

class Rectangle extends Object$1{
    constructor(min,max,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.min = new Vector(min);
        this.max = new Vector(max);
    }

    get pluginName(){
        return "rectangle";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            3,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cone extends Object$1{
    constructor(position,height,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.height = height;
        this.radius = radius;
    }

    get pluginName(){
        return "cone";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            4,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.height,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cylinder extends Object$1{
    constructor(position,height,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.height = height;
        this.radius = radius;
    }

    get pluginName(){
        return "cylinder";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            5,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.height,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Disk extends Object$1{
    constructor(position,radius,innerRadius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.radius = radius;
        this.innerRadius = innerRadius;
    }

    get pluginName(){
        return "disk";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            6,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.radius,this.innerRadius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Hyperboloid extends Object$1{
    constructor(position,p1,p2,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.p1 = new Vector(p1);
        this.p2 = new Vector(p2);
        let pp = this.p1;
        if(this.p2.e(3) === 0){
            this.p1 = this.p2;
            this.p2 = pp;
        }
        pp = this.p1;
        let xy1, xy2,n=0;
        do {
            pp = pp.add(this.p2.subtract(this.p1).x(2));
            xy1 = pp.e(1) * pp.e(1) + pp.e(2) * pp.e(2);
            xy2 = this.p2.e(1) * this.p2.e(1) + this.p2.e(2) * this.p2.e(2);
            this.ah = (1 / xy1 - (pp.e(3) * pp.e(3)) / (xy1 * this.p2.e(3) * this.p2.e(3))) /
            (1 - (xy2 * pp.e(3) * pp.e(3)) / (xy1 * this.p2.e(3) * this.p2.e(3)));
            this.ch = (this.ah * xy2 - 1) / (this.p2.e(3) * this.p2.e(3));
            n++;
        } while (!isFinite(this.ah)|| isNaN(this.ah) && n<20);

        if(!isFinite(this.ah)|| isNaN(this.ah)){
            throw "the p1,p2 of hyperboloid is illegal";
        }
    }

    get pluginName(){
        return "hyperboloid";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            7,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.p1.e(1),this.p1.e(2),this.p1.e(3),
            this.p2.e(1),this.p2.e(2),this.p2.e(3),
            this.ah,this.ch
        ];
        return super.gen(tmp,texparamID);
    }
}

class Paraboloid extends Object$1{
    constructor(position,z0,z1,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.z0 = z0;
        this.z1 = z1;
        this.radius = radius;
    }

    get pluginName(){
        return "paraboloid";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            8,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.z0,this.z1,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

/**
 * Created by eason on 17-4-12.
 */
class Scene {
    constructor(){
        this.camera = {};
        this.objects = [];
        this.sampleCount = 0;
        this.lgcount = 0;
        this.obcount = 0;
        this._trace = new PluginParams("pathtrace");
        this._filter = new PluginParams("none");
    }

    set filter(plugin){
        if(filter.query(plugin)) this._filter.name = plugin;
    }

    get filter(){
        return this._filter;
    }

    set trace(plugin){
        if(trace.query(plugin)) this._trace.name = plugin;
    }

    get trace(){
        return this._trace;
    }

    get mat(){
        return this.camera.projection.x(this.camera.modelview);
    }

    set mat(mat){}

    get eye(){
        return this.camera.eye;
    }

    set eye(eye){}

    add(something){
        if(something instanceof Camera){
            this.camera = something;
        }else if(something instanceof Object){
            if(something.light) {
                this.objects.unshift(something);
                this.lgcount++;
            }
            else {
                this.objects.push(something);
                this.obcount++;
            }
        }
    }

    update(){
        this.camera.update();
        scene.sampleCount = 0;
    }

    tracerConfig() {
        let pluginsList = {
            shape:[],
            material:[],
            texture:[],
            trace:this.trace
        };

        let tmp = {
            shape:[],
            material:[],
            texture:[]
        };

        for(let ob of this.objects){
            if(ob.pluginName &&
                !tmp.shape.includes(ob.pluginName)){
                pluginsList.shape.push(new PluginParams(ob.pluginName));
                tmp.shape.push(ob.pluginName);
            }
            if(ob.material.pluginName &&
                !tmp.material.includes(ob.material.pluginName)){
                pluginsList.material.push(new PluginParams(ob.material.pluginName));
                tmp.material.push(ob.material.pluginName);
            }
            if(ob.texture.pluginName &&
                !tmp.texture.includes(ob.texture.pluginName)){
                pluginsList.texture.push(new PluginParams(ob.texture.pluginName));
                tmp.texture.push(ob.texture.pluginName);
            }
        }
        return pluginsList;
    }

    rendererConfig(){
        return {
            filter:this.filter
        }
    }
}

/**
 * Created by eason on 17-5-12.
 */
class Texture{
    gen(data){
        let l = data.length;
        data.length = ShaderProgram.TEXPARAMS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class UniformColor extends Texture{
    constructor(color){
        super();

        this.color = new Vector(color);
    }

    get pluginName(){
        return undefined;
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            0,this.color.e(1),this.color.e(2),this.color.e(3)
        ];

        return super.gen(tmp);
    }
}

class Checkerboard extends Texture{
    constructor(size=0.3,lineWidth=0.03){
        super();

        if(size<=0) size=0.3;
        if(lineWidth<0) lineWidth=0.03;

        this.size = size;
        this.lineWidth = lineWidth;
    }

    get pluginName(){
        return "checkerboard";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            5,this.size,this.lineWidth
        ];

        return super.gen(tmp);
    }
}

class CornellBox extends Texture{
    constructor(min,max){
        super();

        this.min = new Vector(min);
        this.max = new Vector(max);
    }

    get pluginName(){
        return "cornellbox";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            6,this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];

        return super.gen(tmp);
    }
}

class Checkerboard2 extends Texture{
    constructor(color1=[1,1,1],color2=[0,0,0]){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
    }

    get pluginName(){
        return "checkerboard2";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            7,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3),
        ];

        return super.gen(tmp);
    }
}

class Bilerp extends Texture{
    constructor(color00,color01,color10,color11){
        super();

        this.color00 = new Vector(color00);
        this.color01 = new Vector(color01);
        this.color10 = new Vector(color10);
        this.color11 = new Vector(color11);
    }

    get pluginName(){
        return "bilerp";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            8,
            this.color00.e(1),this.color00.e(2),this.color00.e(3),
            this.color01.e(1),this.color01.e(2),this.color01.e(3),
            this.color10.e(1),this.color10.e(2),this.color10.e(3),
            this.color11.e(1),this.color11.e(2),this.color11.e(3)
        ];

        return super.gen(tmp);
    }
}

class Mix extends Texture{
    constructor(color1,color2,amount){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
        this.amount = amount;
    }

    get pluginName(){
        return "mixf";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            9,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3),
            this.amount
        ];

        return super.gen(tmp);
    }
}

class Scale extends Texture{
    constructor(color1,color2){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
    }

    get pluginName(){
        return "scale";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            10,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3)
        ];

        return super.gen(tmp);
    }
}

class UV extends Texture{
    constructor(){
        super();
    }

    get pluginName(){
        return "uvf";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            11
        ];

        return super.gen(tmp);
    }
}

/**
 * Created by eason on 2/4/18.
 */
class Color {
    static createTexture(color){
        if(color instanceof Array)
            return new UniformColor(color);

        return new UniformColor(color.flatten())
    }

    static get BLACK(){new Vector([0,0,0]);};
    static get WHITE(){new Vector([1,1,1]);};

    static XYZ2RGB(xyz){
        if(!xyz instanceof Vector) return Color.BLACK;
        return new Vector([
             3.240479 * xyz.e(1) - 1.537150 * xyz.e(2) - 0.498535 * xyz.e(3),
            -0.969256 * xyz.e(1) + 1.875991 * xyz.e(2) + 0.041556 * xyz.e(3),
             0.055648 * xyz.e(1) - 0.204043 * xyz.e(2) + 1.057311 * xyz.e(3)
        ]);
    }

    static RGB2XYZ(rgb){
        if(!rgb instanceof Vector) return Color.BLACK;
        return new Vector([
            0.412453 * rgb.e(1) - 0.357580 * rgb.e(2) - 0.180423 * rgb.e(3),
            -0.212671 * rgb.e(1) + 0.715160 * rgb.e(2) + 0.072169 * rgb.e(3),
            0.019334 * rgb.e(1) - 0.119193 * rgb.e(2) + 0.950227 * rgb.e(3)
        ]);
    }

    static interpolateSpectrumSamples(lambda, vals, n, l){
        if(l <= lambda[0]) return vals[0];
        if(l >= lambda[n - 1]) return vals[n - 1];

        let offset = 0;

        for(let i=0;i<n;i++){
            if(lambda[i] > l){
                offset = i-1;
                break;
            }
        }

        return vals[offset] + l - lambda[offset];
    }
    
    static fromSampled(lambda,v,n){
        let xyz = [0,0,0];
        let nCIESamples = CIE_X.length;
        let CIE_Y_integral = 106.856895;

        for (let i = 0; i < nCIESamples; ++i) {
            let val = Color.interpolateSpectrumSamples(lambda, v, n, CIE_lambda[i]);
            xyz[0] += val * CIE_X[i];
            xyz[1] += val * CIE_Y[i];
            xyz[2] += val * CIE_Z[i];
        }
        let scale = (CIE_lambda[nCIESamples - 1] - CIE_lambda[0]) /
            (CIE_Y_integral * nCIESamples);
        xyz[0] *= scale;
        xyz[1] *= scale;
        xyz[2] *= scale;
        return  Color.XYZ2RGB(new Vector(xyz));
    }
}

let CIE_X = [
    // CIE X unction values
    0.0001299000,   0.0001458470,   0.0001638021,   0.0001840037,
    0.0002066902,   0.0002321000,   0.0002607280,   0.0002930750,
    0.0003293880,   0.0003699140,   0.0004149000,   0.0004641587,
    0.0005189860,   0.0005818540,   0.0006552347,   0.0007416000,
    0.0008450296,   0.0009645268,   0.001094949,    0.001231154,
    0.001368000,    0.001502050,    0.001642328,    0.001802382,
    0.001995757,    0.002236000,    0.002535385,    0.002892603,
    0.003300829,    0.003753236,    0.004243000,    0.004762389,
    0.005330048,    0.005978712,    0.006741117,    0.007650000,
    0.008751373,    0.01002888,     0.01142170,     0.01286901,
    0.01431000,     0.01570443,     0.01714744,     0.01878122,
    0.02074801,     0.02319000,     0.02620736,     0.02978248,
    0.03388092,     0.03846824,     0.04351000,     0.04899560,
    0.05502260,     0.06171880,     0.06921200,     0.07763000,
    0.08695811,     0.09717672,     0.1084063,      0.1207672,
    0.1343800,      0.1493582,      0.1653957,      0.1819831,
    0.1986110,      0.2147700,      0.2301868,      0.2448797,
    0.2587773,      0.2718079,      0.2839000,      0.2949438,
    0.3048965,      0.3137873,      0.3216454,      0.3285000,
    0.3343513,      0.3392101,      0.3431213,      0.3461296,
    0.3482800,      0.3495999,      0.3501474,      0.3500130,
    0.3492870,      0.3480600,      0.3463733,      0.3442624,
    0.3418088,      0.3390941,      0.3362000,      0.3331977,
    0.3300411,      0.3266357,      0.3228868,      0.3187000,
    0.3140251,      0.3088840,      0.3032904,      0.2972579,
    0.2908000,      0.2839701,      0.2767214,      0.2689178,
    0.2604227,      0.2511000,      0.2408475,      0.2298512,
    0.2184072,      0.2068115,      0.1953600,      0.1842136,
    0.1733273,      0.1626881,      0.1522833,      0.1421000,
    0.1321786,      0.1225696,      0.1132752,      0.1042979,
    0.09564000,     0.08729955,     0.07930804,     0.07171776,
    0.06458099,     0.05795001,     0.05186211,     0.04628152,
    0.04115088,     0.03641283,     0.03201000,     0.02791720,
    0.02414440,     0.02068700,     0.01754040,     0.01470000,
    0.01216179,     0.009919960,    0.007967240,    0.006296346,
    0.004900000,    0.003777173,    0.002945320,    0.002424880,
    0.002236293,    0.002400000,    0.002925520,    0.003836560,
    0.005174840,    0.006982080,    0.009300000,    0.01214949,
    0.01553588,     0.01947752,     0.02399277,     0.02910000,
    0.03481485,     0.04112016,     0.04798504,     0.05537861,
    0.06327000,     0.07163501,     0.08046224,     0.08973996,
    0.09945645,     0.1096000,      0.1201674,      0.1311145,
    0.1423679,      0.1538542,      0.1655000,      0.1772571,
    0.1891400,      0.2011694,      0.2133658,      0.2257499,
    0.2383209,      0.2510668,      0.2639922,      0.2771017,
    0.2904000,      0.3038912,      0.3175726,      0.3314384,
    0.3454828,      0.3597000,      0.3740839,      0.3886396,
    0.4033784,      0.4183115,      0.4334499,      0.4487953,
    0.4643360,      0.4800640,      0.4959713,      0.5120501,
    0.5282959,      0.5446916,      0.5612094,      0.5778215,
    0.5945000,      0.6112209,      0.6279758,      0.6447602,
    0.6615697,      0.6784000,      0.6952392,      0.7120586,
    0.7288284,      0.7455188,      0.7621000,      0.7785432,
    0.7948256,      0.8109264,      0.8268248,      0.8425000,
    0.8579325,      0.8730816,      0.8878944,      0.9023181,
    0.9163000,      0.9297995,      0.9427984,      0.9552776,
    0.9672179,      0.9786000,      0.9893856,      0.9995488,
    1.0090892,      1.0180064,      1.0263000,      1.0339827,
    1.0409860,      1.0471880,      1.0524667,      1.0567000,
    1.0597944,      1.0617992,      1.0628068,      1.0629096,
    1.0622000,      1.0607352,      1.0584436,      1.0552244,
    1.0509768,      1.0456000,      1.0390369,      1.0313608,
    1.0226662,      1.0130477,      1.0026000,      0.9913675,
    0.9793314,      0.9664916,      0.9528479,      0.9384000,
    0.9231940,      0.9072440,      0.8905020,      0.8729200,
    0.8544499,      0.8350840,      0.8149460,      0.7941860,
    0.7729540,      0.7514000,      0.7295836,      0.7075888,
    0.6856022,      0.6638104,      0.6424000,      0.6215149,
    0.6011138,      0.5811052,      0.5613977,      0.5419000,
    0.5225995,      0.5035464,      0.4847436,      0.4661939,
    0.4479000,      0.4298613,      0.4120980,      0.3946440,
    0.3775333,      0.3608000,      0.3444563,      0.3285168,
    0.3130192,      0.2980011,      0.2835000,      0.2695448,
    0.2561184,      0.2431896,      0.2307272,      0.2187000,
    0.2070971,      0.1959232,      0.1851708,      0.1748323,
    0.1649000,      0.1553667,      0.1462300,      0.1374900,
    0.1291467,      0.1212000,      0.1136397,      0.1064650,
    0.09969044,     0.09333061,     0.08740000,     0.08190096,
    0.07680428,     0.07207712,     0.06768664,     0.06360000,
    0.05980685,     0.05628216,     0.05297104,     0.04981861,
    0.04677000,     0.04378405,     0.04087536,     0.03807264,
    0.03540461,     0.03290000,     0.03056419,     0.02838056,
    0.02634484,     0.02445275,     0.02270000,     0.02108429,
    0.01959988,     0.01823732,     0.01698717,     0.01584000,
    0.01479064,     0.01383132,     0.01294868,     0.01212920,
    0.01135916,     0.01062935,     0.009938846,    0.009288422,
    0.008678854,    0.008110916,    0.007582388,    0.007088746,
    0.006627313,    0.006195408,    0.005790346,    0.005409826,
    0.005052583,    0.004717512,    0.004403507,    0.004109457,
    0.003833913,    0.003575748,    0.003334342,    0.003109075,
    0.002899327,    0.002704348,    0.002523020,    0.002354168,
    0.002196616,    0.002049190,    0.001910960,    0.001781438,
    0.001660110,    0.001546459,    0.001439971,    0.001340042,
    0.001246275,    0.001158471,    0.001076430,    0.0009999493,
    0.0009287358,   0.0008624332,   0.0008007503,   0.0007433960,
    0.0006900786,   0.0006405156,   0.0005945021,   0.0005518646,
    0.0005124290,   0.0004760213,   0.0004424536,   0.0004115117,
    0.0003829814,   0.0003566491,   0.0003323011,   0.0003097586,
    0.0002888871,   0.0002695394,   0.0002515682,   0.0002348261,
    0.0002191710,   0.0002045258,   0.0001908405,   0.0001780654,
    0.0001661505,   0.0001550236,   0.0001446219,   0.0001349098,
    0.0001258520,   0.0001174130,   0.0001095515,   0.0001022245,
    0.00009539445,  0.00008902390,  0.00008307527,  0.00007751269,
    0.00007231304,  0.00006745778,  0.00006292844,  0.00005870652,
    0.00005477028,  0.00005109918,  0.00004767654,  0.00004448567,
    0.00004150994,  0.00003873324,  0.00003614203,  0.00003372352,
    0.00003146487,  0.00002935326,  0.00002737573,  0.00002552433,
    0.00002379376,  0.00002217870,  0.00002067383,  0.00001927226,
    0.00001796640,  0.00001674991,  0.00001561648,  0.00001455977,
    0.00001357387,  0.00001265436,  0.00001179723,  0.00001099844,
    0.00001025398,  0.000009559646, 0.000008912044, 0.000008308358,
    0.000007745769, 0.000007221456, 0.000006732475, 0.000006276423,
    0.000005851304, 0.000005455118, 0.000005085868, 0.000004741466,
    0.000004420236, 0.000004120783, 0.000003841716, 0.000003581652,
    0.000003339127, 0.000003112949, 0.000002902121, 0.000002705645,
    0.000002522525, 0.000002351726, 0.000002192415, 0.000002043902,
    0.000001905497, 0.000001776509, 0.000001656215, 0.000001544022,
    0.000001439440, 0.000001341977, 0.000001251141];

let CIE_Y = [
    // CIE Y unction values
    0.000003917000,  0.000004393581,  0.000004929604,  0.000005532136,
    0.000006208245,  0.000006965000,  0.000007813219,  0.000008767336,
    0.000009839844,  0.00001104323,   0.00001239000,   0.00001388641,
    0.00001555728,   0.00001744296,   0.00001958375,   0.00002202000,
    0.00002483965,   0.00002804126,   0.00003153104,   0.00003521521,
    0.00003900000,   0.00004282640,   0.00004691460,   0.00005158960,
    0.00005717640,   0.00006400000,   0.00007234421,   0.00008221224,
    0.00009350816,   0.0001061361,    0.0001200000,    0.0001349840,
    0.0001514920,    0.0001702080,    0.0001918160,    0.0002170000,
    0.0002469067,    0.0002812400,    0.0003185200,    0.0003572667,
    0.0003960000,    0.0004337147,    0.0004730240,    0.0005178760,
    0.0005722187,    0.0006400000,    0.0007245600,    0.0008255000,
    0.0009411600,    0.001069880,     0.001210000,     0.001362091,
    0.001530752,     0.001720368,     0.001935323,     0.002180000,
    0.002454800,     0.002764000,     0.003117800,     0.003526400,
    0.004000000,     0.004546240,     0.005159320,     0.005829280,
    0.006546160,     0.007300000,     0.008086507,     0.008908720,
    0.009767680,     0.01066443,      0.01160000,      0.01257317,
    0.01358272,      0.01462968,      0.01571509,      0.01684000,
    0.01800736,      0.01921448,      0.02045392,      0.02171824,
    0.02300000,      0.02429461,      0.02561024,      0.02695857,
    0.02835125,      0.02980000,      0.03131083,      0.03288368,
    0.03452112,      0.03622571,      0.03800000,      0.03984667,
    0.04176800,      0.04376600,      0.04584267,      0.04800000,
    0.05024368,      0.05257304,      0.05498056,      0.05745872,
    0.06000000,      0.06260197,      0.06527752,      0.06804208,
    0.07091109,      0.07390000,      0.07701600,      0.08026640,
    0.08366680,      0.08723280,      0.09098000,      0.09491755,
    0.09904584,      0.1033674,       0.1078846,       0.1126000,
    0.1175320,       0.1226744,       0.1279928,       0.1334528,
    0.1390200,       0.1446764,       0.1504693,       0.1564619,
    0.1627177,       0.1693000,       0.1762431,       0.1835581,
    0.1912735,       0.1994180,       0.2080200,       0.2171199,
    0.2267345,       0.2368571,       0.2474812,       0.2586000,
    0.2701849,       0.2822939,       0.2950505,       0.3085780,
    0.3230000,       0.3384021,       0.3546858,       0.3716986,
    0.3892875,       0.4073000,       0.4256299,       0.4443096,
    0.4633944,       0.4829395,       0.5030000,       0.5235693,
    0.5445120,       0.5656900,       0.5869653,       0.6082000,
    0.6293456,       0.6503068,       0.6708752,       0.6908424,
    0.7100000,       0.7281852,       0.7454636,       0.7619694,
    0.7778368,       0.7932000,       0.8081104,       0.8224962,
    0.8363068,       0.8494916,       0.8620000,       0.8738108,
    0.8849624,       0.8954936,       0.9054432,       0.9148501,
    0.9237348,       0.9320924,       0.9399226,       0.9472252,
    0.9540000,       0.9602561,       0.9660074,       0.9712606,
    0.9760225,       0.9803000,       0.9840924,       0.9874812,
    0.9903128,       0.9928116,       0.9949501,       0.9967108,
    0.9980983,       0.9991120,       0.9997482,       1.0000000,
    0.9998567,       0.9993046,       0.9983255,       0.9968987,
    0.9950000,       0.9926005,       0.9897426,       0.9864444,
    0.9827241,       0.9786000,       0.9740837,       0.9691712,
    0.9638568,       0.9581349,       0.9520000,       0.9454504,
    0.9384992,       0.9311628,       0.9234576,       0.9154000,
    0.9070064,       0.8982772,       0.8892048,       0.8797816,
    0.8700000,       0.8598613,       0.8493920,       0.8386220,
    0.8275813,       0.8163000,       0.8047947,       0.7930820,
    0.7811920,       0.7691547,       0.7570000,       0.7447541,
    0.7324224,       0.7200036,       0.7074965,       0.6949000,
    0.6822192,       0.6694716,       0.6566744,       0.6438448,
    0.6310000,       0.6181555,       0.6053144,       0.5924756,
    0.5796379,       0.5668000,       0.5539611,       0.5411372,
    0.5283528,       0.5156323,       0.5030000,       0.4904688,
    0.4780304,       0.4656776,       0.4534032,       0.4412000,
    0.4290800,       0.4170360,       0.4050320,       0.3930320,
    0.3810000,       0.3689184,       0.3568272,       0.3447768,
    0.3328176,       0.3210000,       0.3093381,       0.2978504,
    0.2865936,       0.2756245,       0.2650000,       0.2547632,
    0.2448896,       0.2353344,       0.2260528,       0.2170000,
    0.2081616,       0.1995488,       0.1911552,       0.1829744,
    0.1750000,       0.1672235,       0.1596464,       0.1522776,
    0.1451259,       0.1382000,       0.1315003,       0.1250248,
    0.1187792,       0.1127691,       0.1070000,       0.1014762,
    0.09618864,      0.09112296,      0.08626485,      0.08160000,
    0.07712064,      0.07282552,      0.06871008,      0.06476976,
    0.06100000,      0.05739621,      0.05395504,      0.05067376,
    0.04754965,      0.04458000,      0.04175872,      0.03908496,
    0.03656384,      0.03420048,      0.03200000,      0.02996261,
    0.02807664,      0.02632936,      0.02470805,      0.02320000,
    0.02180077,      0.02050112,      0.01928108,      0.01812069,
    0.01700000,      0.01590379,      0.01483718,      0.01381068,
    0.01283478,      0.01192000,      0.01106831,      0.01027339,
    0.009533311,     0.008846157,     0.008210000,     0.007623781,
    0.007085424,     0.006591476,     0.006138485,     0.005723000,
    0.005343059,     0.004995796,     0.004676404,     0.004380075,
    0.004102000,     0.003838453,     0.003589099,     0.003354219,
    0.003134093,     0.002929000,     0.002738139,     0.002559876,
    0.002393244,     0.002237275,     0.002091000,     0.001953587,
    0.001824580,     0.001703580,     0.001590187,     0.001484000,
    0.001384496,     0.001291268,     0.001204092,     0.001122744,
    0.001047000,     0.0009765896,    0.0009111088,    0.0008501332,
    0.0007932384,    0.0007400000,    0.0006900827,    0.0006433100,
    0.0005994960,    0.0005584547,    0.0005200000,    0.0004839136,
    0.0004500528,    0.0004183452,    0.0003887184,    0.0003611000,
    0.0003353835,    0.0003114404,    0.0002891656,    0.0002684539,
    0.0002492000,    0.0002313019,    0.0002146856,    0.0001992884,
    0.0001850475,    0.0001719000,    0.0001597781,    0.0001486044,
    0.0001383016,    0.0001287925,    0.0001200000,    0.0001118595,
    0.0001043224,    0.00009733560,   0.00009084587,   0.00008480000,
    0.00007914667,   0.00007385800,   0.00006891600,   0.00006430267,
    0.00006000000,   0.00005598187,   0.00005222560,   0.00004871840,
    0.00004544747,   0.00004240000,   0.00003956104,   0.00003691512,
    0.00003444868,   0.00003214816,   0.00003000000,   0.00002799125,
    0.00002611356,   0.00002436024,   0.00002272461,   0.00002120000,
    0.00001977855,   0.00001845285,   0.00001721687,   0.00001606459,
    0.00001499000,   0.00001398728,   0.00001305155,   0.00001217818,
    0.00001136254,   0.00001060000,   0.000009885877,  0.000009217304,
    0.000008592362,  0.000008009133,  0.000007465700,  0.000006959567,
    0.000006487995,  0.000006048699,  0.000005639396,  0.000005257800,
    0.000004901771,  0.000004569720,  0.000004260194,  0.000003971739,
    0.000003702900,  0.000003452163,  0.000003218302,  0.000003000300,
    0.000002797139,  0.000002607800,  0.000002431220,  0.000002266531,
    0.000002113013,  0.000001969943,  0.000001836600,  0.000001712230,
    0.000001596228,  0.000001488090,  0.000001387314,  0.000001293400,
    0.000001205820,  0.000001124143,  0.000001048009,  0.0000009770578,
    0.0000009109300, 0.0000008492513, 0.0000007917212, 0.0000007380904,
    0.0000006881098, 0.0000006415300, 0.0000005980895, 0.0000005575746,
    0.0000005198080, 0.0000004846123, 0.0000004518100];

let CIE_Z = [
    // CIE Z unction values
    0.0006061000,0.0006808792,0.0007651456,0.0008600124,0.0009665928,
    0.001086000,0.001220586,0.001372729,0.001543579,0.001734286,
    0.001946000,0.002177777,0.002435809,0.002731953,0.003078064,
    0.003486000,0.003975227,0.004540880,0.005158320,0.005802907,
    0.006450001,0.007083216,0.007745488,0.008501152,0.009414544,
    0.01054999,0.01196580,0.01365587,0.01558805,0.01773015,
    0.02005001,0.02251136,0.02520288,0.02827972,0.03189704,
    0.03621000,0.04143771,0.04750372,0.05411988,0.06099803,
    0.06785001,
    0.07448632,
    0.08136156,
    0.08915364,
    0.09854048,
    0.1102000,
    0.1246133,
    0.1417017,
    0.1613035,
    0.1832568,
    0.2074000,
    0.2336921,
    0.2626114,
    0.2947746,
    0.3307985,
    0.3713000,
    0.4162091,
    0.4654642,
    0.5196948,
    0.5795303,
    0.6456000,
    0.7184838,
    0.7967133,
    0.8778459,
    0.9594390,
    1.0390501,
    1.1153673,
    1.1884971,
    1.2581233,
    1.3239296,
    1.3856000,
    1.4426352,
    1.4948035,
    1.5421903,
    1.5848807,
    1.6229600,
    1.6564048,
    1.6852959,
    1.7098745,
    1.7303821,
    1.7470600,
    1.7600446,
    1.7696233,
    1.7762637,
    1.7804334,
    1.7826000,
    1.7829682,
    1.7816998,
    1.7791982,
    1.7758671,
    1.7721100,
    1.7682589,
    1.7640390,
    1.7589438,
    1.7524663,
    1.7441000,
    1.7335595,
    1.7208581,
    1.7059369,
    1.6887372,
    1.6692000,
    1.6475287,
    1.6234127,
    1.5960223,
    1.5645280,
    1.5281000,
    1.4861114,
    1.4395215,
    1.3898799,
    1.3387362,
    1.2876400,
    1.2374223,
    1.1878243,
    1.1387611,
    1.0901480,
    1.0419000,
    0.9941976,
    0.9473473,
    0.9014531,
    0.8566193,
    0.8129501,
    0.7705173,
    0.7294448,
    0.6899136,
    0.6521049,
    0.6162000,
    0.5823286,
    0.5504162,
    0.5203376,
    0.4919673,
    0.4651800,
    0.4399246,
    0.4161836,
    0.3938822,
    0.3729459,
    0.3533000,
    0.3348578,
    0.3175521,
    0.3013375,
    0.2861686,
    0.2720000,
    0.2588171,
    0.2464838,
    0.2347718,
    0.2234533,
    0.2123000,
    0.2011692,
    0.1901196,
    0.1792254,
    0.1685608,
    0.1582000,
    0.1481383,
    0.1383758,
    0.1289942,
    0.1200751,
    0.1117000,
    0.1039048,
    0.09666748,
    0.08998272,
    0.08384531,
    0.07824999,
    0.07320899,
    0.06867816,
    0.06456784,
    0.06078835,
    0.05725001,
    0.05390435,
    0.05074664,
    0.04775276,
    0.04489859,
    0.04216000,
    0.03950728,
    0.03693564,
    0.03445836,
    0.03208872,
    0.02984000,
    0.02771181,
    0.02569444,
    0.02378716,
    0.02198925,
    0.02030000,
    0.01871805,
    0.01724036,
    0.01586364,
    0.01458461,
    0.01340000,
    0.01230723,
    0.01130188,
    0.01037792,
    0.009529306,
    0.008749999,
    0.008035200,
    0.007381600,
    0.006785400,
    0.006242800,
    0.005749999,
    0.005303600,
    0.004899800,
    0.004534200,
    0.004202400,
    0.003900000,
    0.003623200,
    0.003370600,
    0.003141400,
    0.002934800,
    0.002749999,
    0.002585200,
    0.002438600,
    0.002309400,
    0.002196800,
    0.002100000,
    0.002017733,
    0.001948200,
    0.001889800,
    0.001840933,
    0.001800000,
    0.001766267,
    0.001737800,
    0.001711200,
    0.001683067,
    0.001650001,
    0.001610133,
    0.001564400,
    0.001513600,
    0.001458533,
    0.001400000,
    0.001336667,
    0.001270000,
    0.001205000,
    0.001146667,
    0.001100000,
    0.001068800,
    0.001049400,
    0.001035600,
    0.001021200,
    0.001000000,
    0.0009686400,
    0.0009299200,
    0.0008868800,
    0.0008425600,
    0.0008000000,
    0.0007609600,
    0.0007236800,
    0.0006859200,
    0.0006454400,
    0.0006000000,
    0.0005478667,
    0.0004916000,
    0.0004354000,
    0.0003834667,
    0.0003400000,
    0.0003072533,
    0.0002831600,
    0.0002654400,
    0.0002518133,
    0.0002400000,
    0.0002295467,
    0.0002206400,
    0.0002119600,
    0.0002021867,
    0.0001900000,
    0.0001742133,
    0.0001556400,
    0.0001359600,
    0.0001168533,
    0.0001000000,
    0.00008613333,
    0.00007460000,
    0.00006500000,
    0.00005693333,
    0.00004999999,
    0.00004416000,
    0.00003948000,
    0.00003572000,
    0.00003264000,
    0.00003000000,
    0.00002765333,
    0.00002556000,
    0.00002364000,
    0.00002181333,
    0.00002000000,
    0.00001813333,
    0.00001620000,
    0.00001420000,
    0.00001213333,
    0.00001000000,
    0.000007733333,
    0.000005400000,
    0.000003200000,
    0.000001333333,
    0.000000000000,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0];

let CIE_lambda = [
    360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374,
    375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389,
    390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404,
    405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419,
    420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434,
    435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449,
    450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464,
    465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
    495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509,
    510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524,
    525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539,
    540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554,
    555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569,
    570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584,
    585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599,
    600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614,
    615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629,
    630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644,
    645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659,
    660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674,
    675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689,
    690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704,
    705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719,
    720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734,
    735, 736, 737, 738, 739, 740, 741, 742, 743, 744, 745, 746, 747, 748, 749,
    750, 751, 752, 753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764,
    765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779,
    780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794,
    795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
    810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824,
    825, 826, 827, 828, 829, 830];

/**
 * Created by eason on 17-5-12.
 */
class Material{
    gen(data){
        let l = data.length;
        data.length = ShaderProgram.TEXPARAMS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Matte extends Material{
    constructor(kd=1,sigma=0){
        super();

        if(kd<=0) kd=1;
        this.kd = kd;
        this.sigma = sigma;
        this.A = 0;
        this.B =0;

        if(this.sigma!==0){
            sigma = sigma*Math.PI/180;
            let sigma2 = sigma * sigma;
            this.A = 1.0 - (sigma2 / (2.0 * (sigma2 + 0.33)));
            this.B = 0.45 * sigma2 / (sigma2 + 0.09);
        }
    }

    get pluginName(){
        return "matte";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            1,this.kd,this.sigma,this.A,this.B
        ];

        return super.gen(tmp);
    }
}

class Mirror extends Material{
    constructor(kr=1.0){
        super();

        if(kr<=0) kr=0.5;
        this.kr = kr;
    }

    get pluginName(){
        return "mirror";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            2,this.kr
        ];

        return super.gen(tmp);
    }
}

let copperWavelengths = [
    298.7570554, 302.4004341, 306.1337728, 309.960445,  313.8839949,
    317.9081487, 322.036826,  326.2741526, 330.6244747, 335.092373,
    339.6826795, 344.4004944, 349.2512056, 354.2405086, 359.374429,
    364.6593471, 370.1020239, 375.7096303, 381.4897785, 387.4505563,
    393.6005651, 399.9489613, 406.5055016, 413.2805933, 420.2853492,
    427.5316483, 435.0322035, 442.8006357, 450.8515564, 459.2006593,
    467.8648226, 476.8622231, 486.2124627, 495.936712,  506.0578694,
    516.6007417, 527.5922468, 539.0616435, 551.0407911, 563.5644455,
    576.6705953, 590.4008476, 604.8008683, 619.92089,   635.8162974,
    652.5483053, 670.1847459, 688.8009889, 708.4810171, 729.3186941,
    751.4192606, 774.9011125, 799.8979226, 826.5611867, 855.0632966,
    885.6012714];

let copperN = [
    1.400313, 1.38,  1.358438, 1.34,  1.329063, 1.325, 1.3325,   1.34,
    1.334375, 1.325, 1.317812, 1.31,  1.300313, 1.29,  1.281563, 1.27,
    1.249062, 1.225, 1.2,      1.18,  1.174375, 1.175, 1.1775,   1.18,
    1.178125, 1.175, 1.172812, 1.17,  1.165312, 1.16,  1.155312, 1.15,
    1.142812, 1.135, 1.131562, 1.12,  1.092437, 1.04,  0.950375, 0.826,
    0.645875, 0.468, 0.35125,  0.272, 0.230813, 0.214, 0.20925,  0.213,
    0.21625,  0.223, 0.2365,   0.25,  0.254188, 0.26,  0.28,     0.3];

let copperK = [
    1.662125, 1.687, 1.703313, 1.72,  1.744563, 1.77,  1.791625, 1.81,
    1.822125, 1.834, 1.85175,  1.872, 1.89425,  1.916, 1.931688, 1.95,
    1.972438, 2.015, 2.121562, 2.21,  2.177188, 2.13,  2.160063, 2.21,
    2.249938, 2.289, 2.326,    2.362, 2.397625, 2.433, 2.469187, 2.504,
    2.535875, 2.564, 2.589625, 2.605, 2.595562, 2.583, 2.5765,   2.599,
    2.678062, 2.809, 3.01075,  3.24,  3.458187, 3.67,  3.863125, 4.05,
    4.239563, 4.43,  4.619563, 4.817, 5.034125, 5.26,  5.485625, 5.717];

class Metal extends Material{
    constructor(roughness=0.01,uroughness=0,vroughness=0,eta,k){
        super();

        this.uroughness = uroughness===0?roughness:uroughness;
        this.vroughness = vroughness===0?roughness:vroughness;

        this.eta = eta?eta:Color.fromSampled(copperWavelengths,copperN,copperN.length);
        this.k = k?k:Color.fromSampled(copperWavelengths,copperK,copperK.length);
    }

    get pluginName(){
        return "metal";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            3,this.uroughness,this.vroughness,
            this.eta.e(1),this.eta.e(2),this.eta.e(3),
            this.k.e(1),this.k.e(2),this.k.e(3)
        ];

        return super.gen(tmp);
    }
}

class Glass extends Material{
    constructor(kr=1,kt=1,eta,uroughness=0,vroughness=0){
        super();

        this.kr = kr;
        this.kt = kt;
        this.eta = eta;
        this.uroughness = uroughness===0?uroughness:uroughness;
        this.vroughness = vroughness===0?vroughness:vroughness;
    }

    get pluginName(){
        return "glass";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            4,this.kr,this.kt,this.eta,this.uroughness,this.vroughness
        ];

        return super.gen(tmp);
    }
}

/**
 * Created by eason on 17-4-26.
 */
function addEvent(obj,xEvent,fn) {
    if(obj.attachEvent){
        obj.attachEvent('on'+xEvent,fn);
    }else{
        obj.addEventListener(xEvent,fn,false);
    }
}

function elementPos(element) {
    let x = 0, y = 0;
    while(element.offsetParent) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
    }
    return { x: x, y: y };
}

function eventPos(event) {
    return {
        x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
    };
}

function canvasMousePos(event,canvas) {
    let mousePos = eventPos(event);
    let canvasPos = elementPos(canvas);
    return {
        x: mousePos.x - canvasPos.x,
        y: mousePos.y - canvasPos.y
    };
}

class Control{
    constructor(canvas,scene){
        this.scene = scene;
        this.canvas = canvas;

        this.mouseDown = false;
        this.R = this.scene.camera.eye.distanceFrom(this.scene.camera.center);
        this.angleX = Math.asin((this.scene.camera.eye.e(2)-this.scene.camera.center.e(2))/this.R);
        this.angleY = Math.acos((this.scene.camera.eye.e(3)-this.scene.camera.center.e(3))/(this.R*Math.cos(this.angleX)));
        if(this.scene.camera.eye.e(1)-this.scene.camera.center.e(1)<0) this.angleY = -this.angleY;

        this.onmousedown();
        this.onmousemove();
        this.onmouseup();
        this.onmousewheel();
    }

    __onmousedown(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,this.canvas);
            this.oldX = mouse.x;
            this.oldY = mouse.y;
            if(mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
                this.mouseDown = true;
                fn();
            }

            return true;
        };
    }

    __onmousemove(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,this.canvas);
            if(this.mouseDown) {
                this.angleY += -(this.oldX-mouse.x) * 0.01;
                this.angleX += -(this.oldY-mouse.y) * 0.01;

                this.angleX = Math.max(this.angleX, -Math.PI / 2 + 0.01);
                this.angleX = Math.min(this.angleX, Math.PI / 2 - 0.01);

                this.scene.camera.eye = new Vector([
                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
                    this.R * Math.sin(this.angleX),
                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
                ]).add(this.scene.camera.center);

                this.oldX = mouse.x;
                this.oldY = mouse.y;

                fn();
                this.scene.update();
            }
        };
    }

    __onmouseup(fn){
        return (event)=>{
            this.mouseDown = false;
            fn();
        }
    }

    __onmousewheel(fn){
        return (event)=>{
            let ev = event || window.event;
            let down = true;
            down = ev.wheelDelta?ev.wheelDelta<0:ev.detail>0;
            if(!down){
                this.R*=0.9;
                this.scene.camera.eye = new Vector([
                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
                    this.R * Math.sin(this.angleX),
                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
                ]).add(this.scene.camera.center);
            }else{
                this.R*=1.1;
                this.scene.camera.eye = new Vector([
                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
                    this.R * Math.sin(this.angleX),
                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
                ]).add(this.scene.camera.center);
            }
            fn();
            this.scene.update();
            if(ev.preventDefault){
                ev.preventDefault();
            }
            return false;
        }
    }

    onmousedown(fn=()=>{}){
        addEvent(document,'mousedown',this.__onmousedown(fn));
    }

    onmousemove(fn=()=>{}){
        addEvent(document,'mousemove',this.__onmousemove(fn));
    }

    onmouseup(fn=()=>{}){
        addEvent(document,'mouseup',this.__onmouseup(fn));
    }

    onmousewheel(fn=()=>{}){
        addEvent(this.canvas,'mousewheel',this.__onmousewheel(fn));
        addEvent(this.canvas,'DOMMouseScroll',this.__onmousewheel(fn));
    }
}

/**
 * Created by eason on 17-4-12.
 */
window.Sail = {
    Renderer:Renderer,
    Scene:Scene,
    Cube:Cube,
    Sphere:Sphere,
    Rectangle:Rectangle,
    Cone:Cone,
    Cylinder:Cylinder,
    Disk:Disk,
    Hyperboloid:Hyperboloid,
    Paraboloid:Paraboloid,
    Camera:Camera,
    Control:Control,
    Matte:Matte,
    Mirror:Mirror,
    Metal:Metal,
    Glass:Glass,
    UniformColor:UniformColor,
    Checkerboard:Checkerboard,
    Checkerboard2:Checkerboard2,
    Bilerp:Bilerp,
    Mix:Mix,
    Scale:Scale,
    UV:UV,
    Color:Color,
    CornellBox:CornellBox,
    Matrix:Matrix,
    Vector:Vector
};

window.$V = Matrix;
window.$M = Vector;
