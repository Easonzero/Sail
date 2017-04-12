(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var vs_render = "#version 300 es\nin vec3 vertex;\nout vec2 texCoord;\nvoid main() {\n    texCoord = vertex.xy * 0.5 + 0.5;\n    gl_Position = vec4(vertex, 1.0);\n}";

	var fs_render = "#version 300 es\nprecision highp float;\nuniform sampler2D tex;\nin vec2 texCoord;\nout vec4 color;\nvoid main() {\n    color = texture(tex, texCoord);\n}";

	var vs_trace = "#version 300 es\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\nin vec3 vertex;\nuniform vec3 eye;\nuniform vec3 test;\nuniform mat4 matrix;\nout vec3 rayd;\nvoid main() {\n    gl_Position = vec4(vertex, 1.0);\n    rayd = normalize(ensure3byW(matrix*gl_Position)-eye);\n}";

	var fs_trace = "#version 300 es\nprecision highp float;\n#define DATA_LENGTH 13.0\n#define MAX_DISTANCE 100000.0\nstruct Face {\n    vec3 vec_1;\n    vec3 vec_2;\n    vec3 vec_3;\n    vec3 normal;\n    int material;\n};\nFace parseFace(sampler2D data,int index){\n    Face face;\n    for(int i=0;i<3;i++){\n        face.vec_1[i] = texture(data,vec2(float(1+i)/DATA_LENGTH,index)).r;\n        face.vec_2[i] = texture(data,vec2(float(4+i)/DATA_LENGTH,index)).r;\n        face.vec_3[i] = texture(data,vec2(float(7+i)/DATA_LENGTH,index)).r;\n        face.normal[i] = texture(data,vec2(float(10+i)/DATA_LENGTH,index)).r;\n    }\n    face.material = int(texture(data,vec2(float(13)/DATA_LENGTH,index)).r);\n    return face;\n}\nstruct Cube{\n    vec3 lb;\n    vec3 rt;\n    int material;\n};\nCube parseCube(sampler2D data,int index){\n    Cube cube;\n    for(int i=0;i<3;i++){\n        cube.lb[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;\n        cube.rt[i] = texture(data,vec2(float(i+4)/DATA_LENGTH,index)).r;\n    }\n    cube.material = int(texture(data,vec2(float(7)/DATA_LENGTH,index)).r);\n    return cube;\n}\nstruct Sphere{\n    vec3 c;\n    float r;\n    int material;\n};\nSphere parseSphere(sampler2D data,int index){\n    Sphere sphere;\n    for(int i=0;i<3;i++){\n        sphere.c[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;\n    }\n    sphere.r = texture(data,vec2(float(4)/DATA_LENGTH,index)).r;\n    sphere.material = int(texture(data,vec2(float(5)/DATA_LENGTH,index)).r);\n    return sphere;\n}\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nstruct Intersect{\n    float d;\n    vec3 point;\n};\nIntersect intersectFace(Ray ray,Face face){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float Amod = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ));\n    float t = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z\n    ))/Amod;\n    if(t<0.0||t>=MAX_DISTANCE) return result;\n    float c = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ))/Amod;\n    if(c>1.0||c<0.0) return result;\n    float b = modMatrix(mat3(\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ))/Amod;\n    if(c+b>1.0||b<0.0) return result;\n    result.d = t;\n    result.point = (1.0-b-c)*face.vec_1+b*face.vec_2+c*face.vec_3;\n    return result;\n}\nIntersect intersectCube(Ray ray,Cube cube){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 tMin = (cube.lb - ray.origin) / ray.dir;\n    vec3 tMax = (cube.rt- ray.origin) / ray.dir;\n    vec3 t1 = min( tMin, tMax );\n    vec3 t2 = max( tMin, tMax );\n    float tNear = max( max( t1.x, t1.y ), t1.z );\n    float tFar = min( min( t2.x, t2.y ), t2.z );\n    if(tNear>0.0&&tNear<tFar) result.d = tNear;\n    return result;\n}\nIntersect intersectSphere(Ray ray,Sphere sphere){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 toSphere = ray.origin - sphere.c;\n\tfloat a = dot( ray.dir, ray.dir );\n\tfloat b = 2.0 * dot( toSphere, ray.dir );\n\tfloat c = dot( toSphere, toSphere ) - sphere.r * sphere.r;\n\tfloat discriminant = b * b - 4.0 * a * c;\n\tif ( discriminant > 0.0 ){\n\t\tfloat t = (-b - sqrt( discriminant ) ) / (2.0 * a);\n\t\tif ( t > 0.0 )\n\t\t    result.d = t;\n\t}\n    return result;\n}\nuniform vec3 eye;\nuniform int n;\nuniform sampler2D tex;\nuniform sampler2D vecs;\nin vec3 rayd;\nout vec4 color;\nvoid main() {\n    Ray ray = Ray(eye,rayd);\n    Intersect intersect;\n    intersect.d = MAX_DISTANCE;\n    for(int i=0;i<n;i++){\n        int category = int(texture(vecs,vec2(0.0,i)).r);\n        Intersect tmp;\n        if(category==0){\n            Face face = parseFace(vecs,i);\n            tmp = intersectFace(ray,face);\n        }else if(category==1){\n            Cube cube = parseCube(vecs,i);\n            tmp = intersectCube(ray,cube);\n        }else if(category==2){\n            Sphere sphere = parseSphere(vecs,i);\n            tmp = intersectSphere(ray,sphere);\n        }\n        if(tmp.d<intersect.d){\n            intersect = tmp;\n        }\n    }\n    if(intersect.d==MAX_DISTANCE)\n        color = vec4(0.0,0.0,0.0,1.0);\n    else\n        color = vec4(0.0,0.0,1.0,1.0);\n}";

	/**
	 * Created by eason on 17-3-21.
	 */

	/**
	 * Created by eason on 17-3-15.
	 */
	class ShaderProgram {
	    constructor(vshader,fshader,hasFrameBuffer=false) {
	        this.uniforms = {};
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
	                        512,512,gl.RGB,gl.RGB,type,null
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

	ShaderProgram.DATA_LENGTH = 14;

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
	 * Created by eason on 17-3-21.
	 */
	class Tracer {
	    constructor(){
	        this.shader = new ShaderProgram(vs_trace,fs_trace,true);

	        this.shader.textures.tex = 0;
	        this.shader.textures.vecs = 1;

	        this.source_texture = {};
	    }

	    update(source,modelviewProjection,eye){
	        let data = new Float32Array(source);

	        let n = parseInt(source.length/ShaderProgram.DATA_LENGTH);

	        this.source_texture = WebglHelper.createTexture();
	        WebglHelper.setTexture(
	            this.source_texture,1,
	            ShaderProgram.DATA_LENGTH, n,
	            gl.R32F,gl.RED,gl.FLOAT,data,true
	        );

	        this.shader.uniforms.eye = eye;
	        this.shader.uniforms.matrix = Matrix.Translation(
	            Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]
	        ).multiply(1 / 512)).multiply(modelviewProjection).inverse();
	        this.shader.uniforms.n = ['int',n];
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

	        this.shader = new ShaderProgram(vs_render,fs_render);

	        this.tracer = new Tracer();

	        this.eye = $V([0,0,10]);
	        this.modelview = makeLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 0, 0, 0, 0, 1, 0);
	        this.projection = makePerspective(55, 1, 0.1, 100);

	        this.tracer.update([1,-1,-1,-1,1,1,1,0,0,0,0,0,0,0],
	            this.projection.multiply(this.modelview),this.eye);
	    }

	    render(){
	        WebglHelper.clearScreen();
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
