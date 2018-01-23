(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

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

	ShaderProgram.OBJECTS_LENGTH = 12;
	ShaderProgram.TEXPARAMS_LENGTH = 7;

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
	        this.name = name;
	        this.exports = exports;
	        this.head = head;
	        this.tail = tail;
	    }

	    generate(...names){
	        let result = this.head + '\n';
	        for(let name of names){
	            result += this.plugins[name].fn + '\n';
	        }
	        for(let e of this.exports){
	            result += e.head;
	            for(let name of names){
	                result += e.condition(this.plugins[name].defineName());
	                result += `{${e.callfn(this.plugins[name])}}`;
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

	var define = "#define OBJECTS_LENGTH 11.0\n#define TEX_PARAMS_LENGTH 6.0\n#define MAX_DISTANCE 1e5\n#define MAXBOUNCES 5\n#define EPSILON 1e-4\n#define PI 3.141592653589793\n#define INVPI 0.3183098861837907\n#define CUBE 1\n#define SPHERE 2\n#define PLANE 3\n#define MATTE 1\n#define MIRROR 2\n#define METAL 3\n#define TRANSMISSION 4\n#define UNIFORM_COLOR 0\n#define CHECKERBOARD 5\n#define CORNELLBOX 6\n#define BLACK vec3(0.0,0.0,0.0)\n#define WHITE vec3(1.0,1.0,1.0)\n#define GREY vec3(0.5,0.5,0.5)\n#define RED vec3(0.75,0.25,0.25)\n#define BLUE vec3(0.1, 0.5, 1.0)\n#define YELLOW vec3(1.0, 0.9, 0.1)\n#define NC 1.0";

	var struct = "struct Intersect{\n    float d;\n    vec3 hit;\n    vec3 normal;\n    vec3 ns;\n    vec3 dpdu,dpdv;\n    float matIndex;    vec3 sc;    vec3 emission;\n    float seed;    int index;\n    int matCategory;\n};\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};";

	/**
	 * Created by eason on 1/20/18.
	 */
	var c = new Generator("const",define,struct);

	var gamma = "float gamma(float x) {\n    return pow(clamp(x,0.0,1.0), 1.0/2.2) + 0.5/255.0;\n}\nvec4 pixelFilter(vec2 texCoord){\n    vec3 color = texture(tex, texCoord).rgb;\n    return vec4(gamma(color.r),gamma(color.g),gamma(color.b),1.0);\n}";

	/**
	 * Created by eason on 1/23/18.
	 */
	let plugins = {
	    "gamma":new Plugin("gamma",gamma)
	};

	var filter = new Generator("filter","","",plugins);

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

	var main = new Generator("main","","",plugins$1);

	var bsdfs = "\nstruct Lambertian{\n    float kd;\n    vec3 cd;\n};\nvec3 lambertian_f(Lambertian l,const vec3 wi,const vec3 wo){\n    return l.kd * l.cd * INVPI;\n}\nvec3 lambertian_sample_f(Lambertian l,float seed,out vec3 wi, vec3 wo, out float pdf){\n\twi = cosWeightHemisphere(seed);\n\tpdf = INVPI;\n\treturn lambertian_f(l,wi,wo);\n}\nstruct Reflective{\n    float kr;\n    vec3 cr;\n};\nvec3 reflective_f(Reflective r,const vec3 wi,const vec3 wo){\n    return r.cr;\n}\nvec3 reflective_sample_f(Reflective r,float seed,out vec3 wi, vec3 wo, out float pdf){\n\twi = vec3(-wo.x,-wo.y,wo.z) + uniformlyRandomVector(seed) * (1.0-r.kr);\n\tpdf = 1.0;\n\treturn reflective_f(r,wi,wo);\n}\nstruct Ward{\n    float ax, ay;\n    float invax2, invay2;\n    float const2;\n    vec3 rs;\n};\nvec3 ward_f(Ward w,const vec3 wi,const vec3 wo){\n    return w.rs;\n}\nvec3 ward_sample_f(Ward w,float seed,out vec3 wi, vec3 wo, out float pdf){\n    vec3 h;\n    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat phi = atan(w.ay*tan(2.0*PI*u2),w.ax);\n\tfloat cosPhi = cos(phi);\n\tfloat sinPhi = sqrt(1.0-cosPhi*cosPhi);\n\tfloat theta = atan(sqrt(-log(u1)/(cosPhi*cosPhi*w.invax2 + sinPhi*sinPhi*w.invay2)));\n\th.z = cos(theta);\n\tfloat cosTheta2 = h.z*h.z;\n\tfloat sinTheta = sqrt(1.0-cosTheta2);\n\tfloat tanTheta2 = (1.0-cosTheta2)/cosTheta2;\n\th.x = cosPhi*sinTheta;\n\th.y = sinPhi*sinTheta;\n\tif(dot(wo,h)<-EPSILON) h=-h;\n\twi = -wo + 2.f * dot(wo, h) * h;\n\tpdf = 1.0;\treturn ward_f(w,wi,wo);\n}\nstruct Refractive{\n    vec3 rc;\n    float F0;\n    float nt;\n};\nvec3 refractive_sample_f(Refractive r,float seed,bool into,out vec3 wi, vec3 wo, out float pdf){\n    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n    vec3 n = vec3(0.0,0.0,1.0);\n    float nnt = into ? NC / r.nt : r.nt / NC;\n    float ddn = dot(-wo,n);\n\tfloat cos2t = 1.0-nnt*nnt*(1.0-ddn*ddn);\n\tif (cos2t < 0.0){\n\t    pdf = 1.0;\n\t    wi = vec3(-wo.x,-wo.y,wo.z);\n\t    return r.rc;\n\t}\n\tvec3 refr = normalize(-wo*nnt - n*(ddn*nnt+sqrt(cos2t)));\n\tfloat c = 1.0-(into?-ddn:dot(-n,refr));\n    float Fe = r.F0 + (1.0 - r.F0) * c * c * c * c * c;\n    float Fr = 1.0 - Fe;\n    pdf = 0.25 + 0.5 * Fe;\n    if (u < pdf){\n        wi = vec3(-wo.x,-wo.y,wo.z);\n        return r.rc * Fe;\n    }\n    else{\n        wi = refr;\n        pdf = 1.0-pdf;\n        return r.rc * Fr;\n    }\n}\n";

	var metal = "void metal_attr(float matIndex,out Ward w){\n    w.ax = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    w.ay = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n    w.invax2 = readFloat(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);\n    w.invay2 = readFloat(texParams,vec2(4.0,matIndex),TEX_PARAMS_LENGTH);\n    w.const2 = readFloat(texParams,vec2(5.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 metal(float seed,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    Ward ward_brdf;\n    metal_attr(matIndex,ward_brdf);\n    ward_brdf.rs = sc;\n    f = ward_sample_f(ward_brdf,seed,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 metal_f(float matIndex,vec3 sc,vec3 wo,vec3 wi){\n    Ward ward_brdf;\n    metal_attr(matIndex,ward_brdf);\n    ward_brdf.rs = sc;\n    return ward_f(ward_brdf,wi,wo);\n}";

	var matte = "void matte_attr(float matIndex,out Lambertian l){\n    l.kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 matte(float seed,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    Lambertian diffuse_brdf;\n    matte_attr(matIndex,diffuse_brdf);\n    diffuse_brdf.cd = sc;\n    f = lambertian_sample_f(diffuse_brdf,seed,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 matte_f(float matIndex,vec3 sc,vec3 wo,vec3 wi){\n    Lambertian diffuse_brdf;\n    matte_attr(matIndex,diffuse_brdf);\n    diffuse_brdf.cd = sc;\n    return lambertian_f(diffuse_brdf,wi,wo);\n}";

	var mirror = "void mirror_attr(float matIndex,out Reflective r){\n    r.kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 mirror(float seed,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    Reflective specular_brdf;\n    mirror_attr(matIndex,specular_brdf);\n    specular_brdf.cr = sc;\n    f = reflective_sample_f(specular_brdf,seed,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 mirror_f(float matIndex,vec3 sc,vec3 wo,vec3 wi){\n    return BLACK;\n}";

	var transmission = "void transmission_attr(float matIndex,out Refractive r){\n    r.nt = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    r.F0 = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 transmission(float seed,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){\n    vec3 f;\n    float pdf;\n    Refractive refractive_brdf;\n    transmission_attr(matIndex,refractive_brdf);\n    refractive_brdf.rc = sc;\n    f = refractive_sample_f(refractive_brdf,seed,into,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 transmission_f(float matIndex,vec3 sc,vec3 wo,vec3 wi){\n    return BLACK;\n}";

	/**
	 * Created by eason on 1/20/18.
	 */
	let plugins$2 = {
	    "metal":new Plugin("metal",metal),
	    "matte":new Plugin("matte",matte),
	    "mirror":new Plugin("mirror",mirror),
	    "transmission":new Plugin("transmission",transmission)
	};

	let head = `vec3 material(float seed,int matCategory,float matIndex,vec3 sc,bool into,vec3 wo,out vec3 wi,out vec3 f){
    f = BLACK;
    vec3 fpdf;if(false){}`;
	let tail = `return fpdf;}`;

	let ep = new Export("material",head,tail,"matCategory",function(plugin){
	    return `fpdf = ${plugin.name}(seed,matIndex,sc,wo,wi,into);
        f = ${plugin.name}_f(matIndex,sc,wo,wi);`
	});

	var material = new Generator("material",bsdfs,"",plugins$2,ep);

	var shade$1 = "vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){\n    vec3 f,direct = BLACK,_fpdf;\n    bool into = dot(ins.normal,-wo) < 0.0;\n    if(!into) {ins.normal = -ins.normal;}\n    wo = worldToLocal(wo,ins.normal,ins.dpdu,ins.dpdv);\n    fpdf = material(ins.seed,ins.matCategory,ins.matIndex,ins.sc,into,wo,wi,f);\n    wi = localToWorld(wi,ins.normal,ins.dpdu,ins.dpdv);\n    if(ins.index>=ln&&ins.matCategory==MATTE)\n        for(int i=0;i<ln;i++){\n            vec3 light = sampleGeometry(ins,i,_fpdf);\n            vec3 toLight = light - ins.hit;\n            float d = length(toLight);\n            if(!testShadow(Ray(ins.hit + ins.normal * 0.0001, toLight)))\n                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);\n        }\n    return ins.emission+direct;\n}";

	/**
	 * Created by eason on 1/21/18.
	 */
	var shade = new Generator("shade",shade$1,"");

	var cube = "struct Cube{\n    vec3 lb;\n    vec3 rt;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n};\nCube parseCube(float index){\n    Cube cube;\n    cube.lb = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    cube.rt = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    cube.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);\n    return cube;\n}\nvec3 normalForCube( vec3 hit, Cube cube){\n\tif ( hit.x < cube.lb.x + 0.0001 )\n\t\treturn vec3( -1.0, 0.0, 0.0 );\n\telse if ( hit.x > cube.rt.x - 0.0001 )\n\t\treturn vec3( 1.0, 0.0, 0.0 );\n\telse if ( hit.y < cube.lb.y + 0.0001 )\n\t\treturn vec3( 0.0, -1.0, 0.0 );\n\telse if ( hit.y > cube.rt.y - 0.0001 )\n\t\treturn vec3( 0.0, 1.0, 0.0 );\n\telse if ( hit.z < cube.lb.z + 0.0001 )\n\t\treturn vec3( 0.0, 0.0, -1.0 );\n\telse return vec3( 0.0, 0.0, 1.0 );\n}\nvoid computeDpDForCube( vec3 normal,out vec3 dpdu,out vec3 dpdv){\n    if (abs(normal.x)<0.5) {\n        dpdu = cross(normal, vec3(1,0,0));\n    }else {\n        dpdu = cross(normal, vec3(0,1,0));\n    }\n    dpdv = cross(normal,dpdu);\n}\nvec3 sampleCube(Intersect ins,Cube cube,out float pdf){\n    vec3 x = vec3(cube.rt.x-cube.lb.x,0.0,0.0);\n    vec3 y = vec3(0.0,0.0,cube.rt.z-cube.lb.z);\n    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );\n    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );\n    pdf = 1.0/(length(x)*length(y));\n    return cube.lb+u1*x+u2*y;\n}\nIntersect intersectCube(Ray ray,Cube cube){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 tMin = (cube.lb - ray.origin) / ray.dir;\n    vec3 tMax = (cube.rt- ray.origin) / ray.dir;\n    vec3 t1 = min( tMin, tMax );\n    vec3 t2 = max( tMin, tMax );\n    float tNear = max( max( t1.x, t1.y ), t1.z );\n    float tFar = min( min( t2.x, t2.y ), t2.z );\n    float t=-1.0,f;\n    if(tNear>EPSILON&&tNear<tFar) t = tNear;\n    else if(tNear<tFar) t = tFar;\n    if(t > EPSILON){\n        result.d = t;\n        result.hit = ray.origin+t*ray.dir;\n        result.normal = normalForCube(ray.origin+t*ray.dir,cube);\n        computeDpDForCube(result.normal,result.dpdu,result.dpdv);\n        result.matIndex = cube.matIndex;\n        result.sc = getSurfaceColor(result.hit,cube.texIndex);\n        result.emission = cube.emission;\n        result.matCategory = readInt(texParams,vec2(0.0,cube.matIndex),TEX_PARAMS_LENGTH);\n    }\n    return result;\n}";

	var sphere = "struct Sphere{\n    vec3 c;\n    float r;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n};\nSphere parseSphere(float index){\n    Sphere sphere;\n    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    sphere.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.emission = readVec3(objects,vec2(7.0,index),OBJECTS_LENGTH);\n    return sphere;\n}\nvec3 normalForSphere( vec3 hit, Sphere sphere ){\n\treturn (hit - sphere.c) / sphere.r;\n}\nvoid computeDpDForSphere(vec3 normal,out vec3 dpdu,out vec3 dpdv){\n    dpdu = normalize(vec3(-2.0*PI * normal.y, 2.0*PI * normal.x, 0.0));\n    dpdv = cross(normal,dpdu);\n}\nIntersect intersectSphere(Ray ray,Sphere sphere){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 toSphere = ray.origin - sphere.c;\n\tfloat a = dot( ray.dir, ray.dir );\n\tfloat b = 2.0 * dot( toSphere, ray.dir );\n\tfloat c = dot( toSphere, toSphere ) - sphere.r * sphere.r;\n\tfloat det = b * b - 4.0 * a * c;\n\tif ( det > EPSILON ){\n\t    det = sqrt( det );\n\t\tfloat t = (-b - det);\n\t\tif(t < EPSILON) t = (-b + det);\n\t\tt /= 2.0*a;\n\t\tif(t > EPSILON){\n\t        result.d = t;\n    \t\tresult.hit = ray.origin+t*ray.dir;\n    \t\tresult.normal = normalForSphere(ray.origin+t*ray.dir,sphere);\n    \t\tcomputeDpDForSphere(result.normal,result.dpdu,result.dpdv);\n    \t\tresult.matIndex = sphere.matIndex;\n    \t\tresult.sc = getSurfaceColor(result.hit,sphere.texIndex);\n    \t\tresult.emission = sphere.emission;\n    \t\tresult.matCategory = readInt(texParams,vec2(0.0,sphere.matIndex),TEX_PARAMS_LENGTH);\n\t\t}\n\t}\n    return result;\n}\nvec3 sampleSphere(Intersect ins,Sphere sphere,out float pdf){\n    return BLACK;\n}";

	var plane = "struct Plane{\n    vec3 normal;\n    float offset;\n    bool dface;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n};\nPlane parsePlane(float index){\n    Plane plane;\n    plane.normal = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    plane.offset = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    plane.dface = readBool(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    plane.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    plane.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    plane.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);\n    return plane;\n}\nvoid computeDpDForPlane( vec3 normal,out vec3 dpdu,out vec3 dpdv){\n    if (abs(normal.x)<0.5) {\n        dpdu = cross(normal, vec3(1,0,0));\n    }else {\n        dpdu = cross(normal, vec3(0,1,0));\n    }\n    dpdv = cross(normal,dpdu);\n}\nIntersect intersectPlane(Ray ray,Plane plane){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float DN = dot(ray.dir,plane.normal);\n    if(DN==0.0||(!plane.dface&&DN>EPSILON)) return result;\n    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;\n    if(t<EPSILON) return result;\n    result.d = t;\n    result.normal = plane.normal;\n    result.hit = ray.origin+result.d*ray.dir;\n    computeDpDForPlane(result.normal,result.dpdu,result.dpdv);\n    result.matIndex = plane.matIndex;\n    result.sc = getSurfaceColor(result.hit,plane.texIndex);\n    result.emission = plane.emission;\n    result.matCategory = readInt(texParams,vec2(0.0,plane.matIndex),TEX_PARAMS_LENGTH);\n    return result;\n}\nvec3 samplePlane(Intersect ins,Plane plane,out float pdf){\n    return BLACK;\n}";

	/**
	 * Created by eason on 1/21/18.
	 */
	let plugins$3 = {
	    "cube":new Plugin("cube",cube),
	    "sphere":new Plugin("sphere",sphere),
	    "plane":new Plugin("plane",plane)
	};

	let intersectHead = `Intersect intersectObjects(Ray ray){
    Intersect ins;
    ins.d = MAX_DISTANCE;
    for(int i=0;i<ln+n;i++){
        Intersect tmp;
        tmp.d = MAX_DISTANCE;
        int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
        if(false) {}`;
	let intersectTail = `if(tmp.d<ins.d) ins = tmp;}return ins;}`;

	let intersect = new Export("intersect",intersectHead,intersectTail,"category",function(plugin){
	    return `${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
    tmp = intersect${plugin.capitalName()}(ray,${plugin.name});
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
        result = sample${plugin.capitalName()}(ins,${plugin.name},pdf);
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
	var shape = new Generator("shape","",testShadow,plugins$3,intersect,sample);

	var checkerboard = "void checkerboard_attr(float texIndex,out float size,out float lineWidth){\n    size = readFloat(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    lineWidth = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 checkerboard(vec3 hit,float texIndex){\n    float size,lineWidth;\n    checkerboard_attr(texIndex,size,lineWidth);\n    float width = 0.5 * lineWidth / size;\n    float fx = hit.x/size-floor(hit.x/size),\n    fy = hit.y/size-floor(hit.y/size),\n    fz = hit.z/size-floor(hit.z/size);\n    bool in_outline = (fx<width||fx>1.0-width)||(fy<width||fy>1.0-width)||(fz<width||fz>1.0-width);\n    if (!in_outline) {\n        return WHITE;\n    } else {\n        return GREY;\n    }\n}";

	var cornellbox = "void cornellbox_attr(float texIndex,out vec3 min,out vec3 max){\n    min = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    max = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 cornellbox(vec3 hit,float texIndex){\n    vec3 min,max;\n    cornellbox_attr(texIndex,min,max);\n    if ( hit.x < min.x + 0.0001 )\n    \treturn YELLOW*0.8;\n    else if ( hit.x > max.x - 0.0001 )\n    \treturn BLUE*0.8;\n    else if ( hit.y < min.y + 0.0001 )\n    \treturn WHITE;\n    else if ( hit.y > max.y - 0.0001 )\n    \treturn WHITE;\n    else if ( hit.z > min.z - 0.0001 )\n    \treturn WHITE;\n    return BLACK;\n}";

	/**
	 * Created by eason on 1/20/18.
	 */
	let plugins$4 = {
	    "checkerboard":new Plugin("checkerboard",checkerboard),
	    "cornellbox":new Plugin("cornellbox",cornellbox)
	};

	let head$1 = `vec3 getSurfaceColor(vec3 hit,float texIndex){
    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);
    if(texCategory==UNIFORM_COLOR) return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);`;
	let tail$1 = `return BLACK;}`;

	let ep$1 = new Export("getSurfaceColor",head$1,tail$1,"texCategory",function(plugin){
	    return `return ${plugin.name}(hit,texIndex);`
	});

	var texture = new Generator("texture","","",plugins$4,ep$1);

	var pathtrace = "void trace(Ray ray,out vec3 e,int maxDeepth){\n    vec3 fpdf = WHITE;e = BLACK;\n    int deepth=1;\n    while(++deepth<=maxDeepth){\n        Intersect ins = intersectObjects(ray);\n        ins.seed = timeSinceStart + float(deepth);\n        if(ins.d==MAX_DISTANCE) break;\n        vec3 wi;\n        vec3 _fpdf;\n        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;\n        fpdf *= _fpdf;\n        ray.origin = ins.hit;\n        ray.dir = wi;\n    }\n}";

	/**
	 * Created by eason on 1/21/18.
	 */
	let plugins$5 = {
	    "pathtrace":new Plugin("pathtrace",pathtrace)
	};

	var trace = new Generator("trace","","",plugins$5);

	var random = "float random( vec3 scale, float seed ){\n\treturn(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );\n}\nvec2 random2(float seed){\n\treturn vec2(fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453 + seed),\n\t\tfract(cos(dot(gl_FragCoord.xy ,vec2(4.898,7.23))) * 23421.631 + seed));\n}";

	var sampler = "vec3 uniformlyRandomDirection( float seed ){\n\tfloat u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3( r * cos( angle ), r * sin( angle ), z );\n}\nvec3 uniformlyRandomVector( float seed ){\n\treturn uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));\n}\nvec3 cosWeightHemisphere(float seed){\n    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat r = sqrt(u);\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3(r*cos(angle),r*sin(angle),sqrt(1.-u));\n}\nvec3 cosWeightHemisphere2(float seed){\n    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3(u*cos(angle),u*sin(angle),cos(asin(u)));\n}";

	var texhelper = "vec2 convert(vec2 pos,float width){\n    pos.x = pos.x/width;\n    return pos;\n}\nint readInt(sampler2D tex,vec2 pos,float width){\n    return int(texture(tex,convert(pos,width)).r);\n}\nfloat readFloat(sampler2D tex,vec2 pos,float width){\n    return texture(tex,convert(pos,width)).r;\n}\nbool readBool(sampler2D tex,vec2 pos,float width){\n    return readInt(tex,pos,width)==1;\n}\nvec2 readVec2(sampler2D tex,vec2 pos,float width){\n    vec2 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    return result;\n}\nvec3 readVec3(sampler2D tex,vec2 pos,float width){\n    vec3 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.z = texture(tex,pos).r;\n    return result;\n}";

	var utility = "vec3 worldToLocal(vec3 v,vec3 ns,vec3 ss,vec3 ts){\n    return vec3(dot(v,ss),dot(v,ts),dot(v,ns));\n}\nvec3 localToWorld(vec3 v,vec3 ns,vec3 ss,vec3 ts){\n    return vec3(ss.x * v.x + ts.x * v.y + ns.x * v.z,\n        ss.y * v.x + ts.y * v.y + ns.y * v.z,\n        ss.z * v.x + ts.z * v.y + ns.z * v.z);\n}\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nvec3 ortho(vec3 d) {\n\tif (abs(d.x)>0.00001 || abs(d.y)>0.00001) {\n\t\treturn vec3(d.y,-d.x,0.0);\n\t} else  {\n\t\treturn vec3(0.0,d.z,-d.y);\n\t}\n}\nfloat maxComponent(vec3 v){\n    return max(max(v.x,v.y),v.z);\n}\nvoid swap(inout float f1,inout float f2){\n    float tmp = f1;\n    f1 = f2;\n    f2 = tmp;\n}";

	/**
	 * Created by eason on 1/20/18.
	 */
	let plugins$6 = {
	    "random":new Plugin("random",random),
	    "sampler":new Plugin("sampler",sampler),
	    "texhelper":new Plugin("texhelper",texhelper),
	    "utility":new Plugin("utility",utility)
	};

	var util = new Generator("util","","",plugins$6);

	/**
	 * Created by eason on 1/20/18.
	 */
	class TraceShader{
	    constructor(pluginsList = {shape:[],texture:[],material:[],trace:"pathtrace"}){
	        this.uniform = {
	            n:{type:'int',value:0},
	            ln:{type:'int',value:0},
	            tn:{type:'int',value:0},
	            textureWeight:{type:'float',value:0},
	            timeSinceStart:{type:'float',value:0},
	            matrix:{type:'mat4',value:Matrix.I(4)},
	            eye:{type:'vec3',value:Vector.Zero(3)}
	        };
	        this.texture = {
	            cache:0,
	            objects:1,
	            texParams:2
	        };

	        this.glslv = "300 es";
	        this.pluginsList = pluginsList;
	    }

	    combinefs(){
	        return `#version ${this.glslv}\n`
	            + `precision highp float;
               precision highp int;\n`
	            + this.uniformstr()
	            + c.generate()
	            + util.generate("random","sampler","texhelper","utility")
	            + texture.generate(...this.pluginsList.texture)
	            + material.generate(...this.pluginsList.material)
	            + shape.generate(...this.pluginsList.shape)
	            + shade.generate()
	            + trace.generate(this.pluginsList.trace)
	            + main.generate("fstrace")
	    }

	    combinevs(){
	        return `#version ${this.glslv}\n`
	            + `precision highp float;
               precision highp int;\n`
	            + this.uniformstr()
	            + util.generate("utility")
	            + main.generate("vstrace")
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


	class RenderShader{
	    constructor(pluginsList={filter:"gamma"}){
	        this.texture = {
	            tex:0
	        };
	        this.glslv = "300 es";
	        this.pluginsList = pluginsList;
	    }

	    combinefs(){
	        return `#version ${this.glslv}\n`
	            + `precision highp float;\n`
	            + this.uniformstr()
	            + filter.generate(this.pluginsList.filter)
	            + main.generate("fsrender")
	    }

	    combinevs(){
	        return `#version ${this.glslv}\n`
	            + this.uniformstr()
	            + main.generate("vsrender")
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
	class Cube{
	    constructor(min,max,material,texture,emission=[0,0,0]){
	        this.min = new Vector(min);
	        this.max = new Vector(max);
	        this.material = material;
	        this.texture = texture;
	        this.emission = new Vector(emission);

	        this.light = !this.emission.eql(new Vector([0,0,0]));
	    }

	    get pluginName(){
	        return "cube";
	    }

	    set pluginName(name){}

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp = [
	            1,
	            this.min.e(1),this.min.e(2),this.min.e(3),
	            this.max.e(1),this.max.e(2),this.max.e(3),
	            texparamID,texparamID+1,
	            this.emission.e(1),this.emission.e(2),this.emission.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Sphere{
	    constructor(c,r,material,texture,emission=[0,0,0]){
	        this.c = new Vector(c);
	        this.r = r;
	        this.material = material;
	        this.texture = texture;
	        this.emission = new Vector(emission);

	        this.light = !this.emission.eql(new Vector([0,0,0]));
	    }

	    get pluginName(){
	        return "sphere";
	    }

	    set pluginName(name){}

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp = [
	            2,
	            this.c.e(1),this.c.e(2),this.c.e(3),
	            this.r,texparamID,texparamID+1,
	            this.emission.e(1),this.emission.e(2),this.emission.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Plane{
	    constructor(normal,offset,dface=false,material,texture,emission=[0,0,0]){
	        this.normal = new Vector(normal).toUnitVector();
	        this.offset = offset;
	        this.dface = dface?1:0;
	        this.material = material;
	        this.texture = texture;
	        this.emission = new Vector(emission);

	        this.light = !this.emission.eql(new Vector([0,0,0]));
	    }

	    get pluginName(){
	        return "plane";
	    }

	    set pluginName(name){}

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp = [
	            3,
	            this.normal.e(1),this.normal.e(2),this.normal.e(3),
	            this.offset,this.dface,texparamID,texparamID+1,
	            this.emission.e(1),this.emission.e(2),this.emission.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
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
	        this._trace = "pathtrace";
	        this._filter = "gamma";
	    }

	    set filter(plugin){
	        if(filter.query(plugin)) this._filter = plugin;
	    }

	    get filter(){
	        return this._filter;
	    }

	    set trace(plugin){
	        if(trace.query(plugin)) this._trace = plugin;
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
	        }else if(something instanceof Cube||
	            something instanceof Sphere||
	            something instanceof Plane){
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

	        for(let ob of this.objects){
	            if(ob.pluginName &&
	                !pluginsList.shape.includes(ob.pluginName))
	                pluginsList.shape.push(ob.pluginName);
	            if(ob.material.pluginName &&
	                !pluginsList.material.includes(ob.material.pluginName))
	                pluginsList.material.push(ob.material.pluginName);
	            if(ob.texture.pluginName &&
	                !pluginsList.texture.includes(ob.texture.pluginName))
	                pluginsList.texture.push(ob.texture.pluginName);
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
	class Matte{
	    constructor(kd=1){
	        if(kd<=0) kd=1;
	        this.kd = kd;
	    }

	    get pluginName(){
	        return "matte";
	    }

	    set pluginName(name){}

	    gen(){
	        let tmp = [
	            1,this.kd
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Mirror{
	    constructor(kr=1.0){
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
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Metal{
	    constructor(ax=1,ay=1){
	        this.ax = ax;
	        this.ay = ay;
	        this.invax2 = 1/(ax*ax);
	        this.invay2 = 1/(ay*ay);
	        this.const2 = 4*Math.PI*ax*ay;
	    }

	    get pluginName(){
	        return "metal";
	    }

	    set pluginName(name){}

	    gen(){
	        let tmp = [
	            3,this.ax,this.ay,this.invax2,this.invay2,this.const2
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Transmission{
	    constructor(nt){
	        this.nt = nt;
	        this.F0 = (1.0 - nt) * (1.0 - nt) / ((1.0 + nt) * (1.0 + nt));
	    }

	    get pluginName(){
	        return "transmission";
	    }

	    set pluginName(name){}

	    gen(){
	        let tmp = [
	            4,this.nt,this.F0
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	/**
	 * Created by eason on 17-5-12.
	 */
	class Color{
	    static create(color){
	        return new UniformColor(color);
	    }
	}

	class UniformColor{
	    constructor(color){
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
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Checkerboard{
	    constructor(size=0.3,lineWidth=0.03){
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
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class CornellBox{
	    constructor(min,max){
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
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
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
	    Plane:Plane,
	    Camera:Camera,
	    Control:Control,
	    Matte:Matte,
	    Mirror:Mirror,
	    Metal:Metal,
	    Transmission:Transmission,
	    Color:Color,
	    Checkerboard:Checkerboard,
	    CornellBox:CornellBox,
	    Matrix:Matrix,
	    Vector:Vector
	};

	window.$V = Matrix;
	window.$M = Vector;

})));
