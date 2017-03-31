(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var vs_render = "attribute vec3 vertex;\nvarying vec2 texCoord;\nvoid main() {\n    texCoord = vertex.xy * 0.5 + 0.5;\n    gl_Position = vec4(vertex, 1.0);\n}";

	var fs_render = "precision highp float;\nvarying vec2 texCoord;\nuniform sampler2D texture;\nvoid main() {\n    gl_FragColor = texture2D(texture, texCoord);\n}";

	var vs_trace = "vec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nattribute vec3 vertex;\nuniform vec3 eye;\nuniform vec3 test;\nuniform mat4 matrix;\nvarying vec3 ray;\nvoid main() {\n    gl_Position = vec4(vertex, 1.0);\n    light = ensure3byW(matrix*gl_Position)-eye;\n}";

	var fs_trace = "struct Ray{\n    vec3 origin;\n    vec3 dir;\n};\nstruct Face {\n    vec3 vecs[3];\n    vec3 color;\n    int material;\n};\nFace parse(sampler2D data,int i){\n    Face face;\n    for(int t=0;t<3;t++){\n        face.vecs[t] = texture2D(data,vec2(i,t));\n    }\n    return face;\n}\nfloat intersect(Ray ray,Face face){\n    return 0;\n}\nprecision highp float;\nvarying vec3 ray;\nuniform sampler2D texture;\nuniform sampler2D vecs;\nvoid main() {\n    gl_FragColor = vec4(mix(vec3(1,1,1),ray,0.99), 1.0);\n}";

	/**
	 * Created by eason on 17-3-21.
	 */

	/**
	 * Created by eason on 17-3-15.
	 */
	class ShaderProgram {
	    constructor(vshader,fshader,hasFrameBuffer=false) {
	        this.uniforms = {};
	        this.buffer = {};
	        this.hasFrameBuffer = hasFrameBuffer;
	        this.textures = {};
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
	                        512,512,gl.RGB,type,null
	                    );
	                }
	            }
	        }

	        this.program = WebglHelper.createProgram(vshader, fshader);

	        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
	        gl.enableVertexAttribArray(this.vertexAttribute);
	    }

	    render(uniforms=true,textures=true){
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
	        for(let entry of Object.entries(this.uniforms)) {
	            let location = gl.getUniformLocation(this.program, entry[0]);
	            if(location == null) continue;
	            if(entry[1] instanceof Vector) {
	                gl.uniform3fv(location, new Float32Array([entry[1].elements[0], entry[1].elements[1], entry[1].elements[2]]));
	            } else if(entry[1] instanceof Matrix) {
	                gl.uniformMatrix4fv(location, false, new Float32Array(entry[1].flatten()));
	            } else if(entry[1][0]=='int'){
	                gl.uniform1i(location, entry[1][1]);
	            } else if(entry[1][0]=='float'){
	                gl.uniform1f(location, entry[1][1]);
	            } else {
	                gl.uniform1f(location, entry[1]);
	            }
	        }
	    }

	    _updateTextures(){
	        for(let entry of Object.entries(this.textures)) {
	            let location = gl.getUniformLocation(this.program, entry[0]);
	            if(location == null) continue;

	            gl.uniform1i(location,entry[1]);
	        }
	    }

	    _updateVBO(){
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	        gl.vertexAttribPointer(this.vertexAttribute, 2, gl.FLOAT, false, 0, 0);
	    }
	}

	class WebglHelper {
	    static createTexture(){
	        return gl.createTexture();
	    }

	    static setTexture(texture,unitID,width,height,format,type,data){
	        gl.activeTexture(gl.TEXTURE0+unitID);

	        gl.bindTexture(gl.TEXTURE_2D, texture);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, data);
	    }

	    static clearScreen(){
	        gl.clearColor(0.0,0.0,1.0,1.0);
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
	            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	        }
	        catch(e) {}
	        if (!gl) {
	            alert("WebGL初始化失败，可能是因为您的浏览器不支持。");
	            gl = null;
	        }
	        return gl;
	    }
	}

	/**
	 * Created by eason on 17-3-21.
	 */
	class Tracer {
	    constructor(){
	        this.shader = new ShaderProgram(vs_trace,fs_trace,true);

	        this.shader.textures.texture = 0;
	        this.shader.textures.vecs = 1;

	        this.source_texture = {};
	    }

	    update(source,modelviewProjection,eye){
	        let data = new Float32Array(source);

	        this.source_texture = WebglHelper.createTexture();
	        WebglHelper.setTexture(
	            this.source_texture,1,
	            3, source.length/3,gl.LUMINANCE,gl.FLOAT,data
	        );
	        this.shader.uniforms.eye = eye;
	        this.shader.uniforms.matrix = Matrix.Translation(
	            Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]
	        ).multiply(1 / 512)).multiply(modelviewProjection).inverse();
	    }

	    render(){
	        this.shader.render();
	    }
	}

	/**
	 * Created by eason on 17-3-21.
	 */
	class Renderer {
	    constructor(canvas){
	        WebglHelper.initWebgl(canvas);
	        WebglHelper.clearScreen();

	        this.shader = new ShaderProgram(vs_render,fs_render);

	        this.tracer = new Tracer();

	        this.eye = $V([0,0,1]);
	        this.modelview = makeLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 0, 0, 0, 0, 1, 0);
	        this.projection = makePerspective(55, 1, 0.1, 100);

	        this.tracer.update([1,0,0,0,1,0,0,0,1],
	            this.projection.multiply(this.modelview),this.eye);
	    }

	    render(){
	        this.tracer.render();
	        this.shader.render();
	    }
	}

	/**
	 * Created by eason on 17-2-16.
	 */
	let canvas = document.getElementById('canvas');

	let renderer = new Renderer(canvas);

	function tick(){
	    requestAnimationFrame(tick);
	    renderer.render();
	}

	tick();

})));
