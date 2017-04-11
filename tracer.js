/**
 * Created by eason on 17-3-21.
 */
import {vs_trace,fs_trace} from './shader/shader.program';
import {ShaderProgram,WebglHelper} from './webgl';

class Tracer {
    constructor(){
        this.shader = new ShaderProgram(vs_trace,fs_trace,true);

        this.shader.textures.texture = 0;
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
            gl.LUMINANCE,gl.FLOAT,data,true
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

export {Tracer}