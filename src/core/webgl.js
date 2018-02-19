/**
 * Created by eason on 17-3-15.
 */
class ShaderProgram {
    constructor(frameBufferNum) {
        this.frameBufferNum = frameBufferNum;
        this.run = false;

        this.vbo = [];
        this.indexl = 0;

        if(frameBufferNum){
            this.framebuffer = gl.createFramebuffer();

            if(!ShaderProgram.frameCache) {
                ShaderProgram.frameCache = [];

                let type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;

                for(let i = 0; i <= frameBufferNum; i++) {
                    ShaderProgram.frameCache.push(WebglHelper.createTexture());
                    WebglHelper.setTexture(
                        ShaderProgram.frameCache[i],
                        512,512,gl.RGB,gl.RGB,type,null
                    )
                }
            }
        }
    }

    addVBO(type,data){
        let buffer = gl.createBuffer();
        gl.bindBuffer(type,buffer);
        gl.bufferData(type,data,gl.STATIC_DRAW);
        this.vbo.push({name:buffer,type:type});
        if(type===gl.ELEMENT_ARRAY_BUFFER) this.indexl = data.length;
    }

    setProgram(shader){
        this.shader = shader;

        this.program = WebglHelper.createProgram(shader.combinevs(), shader.combinefs());
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        gl.enableVertexAttribArray(this.vertexAttribute);
    }

    switch(){
        gl.useProgram(this.program);
    }

    render(type='triangle',uniforms=true,textures=true){
        if(!this.program||!this.shader) return;

        gl.useProgram(this.program);

        if(!this.run) {
            this._updateUniforms();
            this._updateTextures();
            this.run = true;
        }else{
            if(uniforms) this._updateUniforms();
            if(textures) this._updateTextures();
        }

        if(this.frameBufferNum){
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.framebuffer);
            let bufferArray = [];
            for(let i=0;i<this.frameBufferNum;i++){
                gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0+i, gl.TEXTURE_2D, ShaderProgram.frameCache[1+i], 0);
                bufferArray.push(gl.COLOR_ATTACHMENT0+i);
            }
            gl.drawBuffers(bufferArray);
        }

        for(let buffer of this.vbo){
            gl.bindBuffer(buffer.type,buffer.name);
        }
        if(type==='line'){
            gl.vertexAttribPointer(this.vertexAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawElements(gl.LINES,this.indexl, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.vertexAttribPointer(this.vertexAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

        if(this.frameBufferNum){
            let tmp = ShaderProgram.frameCache[0];
            ShaderProgram.frameCache[0] = ShaderProgram.frameCache[1];
            ShaderProgram.frameCache[1] = tmp;
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
            gl.activeTexture(gl.TEXTURE0+entry[1].unit);

            if(typeof entry[1].value === "number")
                gl.bindTexture(gl.TEXTURE_2D, ShaderProgram.frameCache[entry[1].value]);
            else
                gl.bindTexture(gl.TEXTURE_2D, entry[1].value);

            let location = gl.getUniformLocation(this.program, entry[0]);
            if(location == null) continue;
            gl.uniform1i(location,entry[1].unit);
        }
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

    static setTexture(texture,width,height,internalFormat,format,type,data,npot){
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

export {ShaderProgram,WebglHelper}
