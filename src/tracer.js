/**
 * Created by eason on 17-3-21.
 */
import {vs_trace,fs_trace} from './shader/shader.program';
import {ShaderProgram,WebglHelper} from './webgl';

class Tracer {
    constructor(){
        this.shader = new ShaderProgram(vs_trace,fs_trace,true);
        this.sampleCount = 0;
        this.timeStart = new Date();

        this.shader.textures.tex = 0;
        this.shader.textures.objects = 1;
        this.shader.textures.lights = 2;

        this.data_objects_tex = {};
        this.data_lights_tex = {};
    }

    update(objects,lights,modelviewProjection,eye){
        this.sampleCount++;

        let data_objects = new Float32Array(objects);
        let data_lights = new Float32Array(lights);

        let on = parseInt(objects.length/ShaderProgram.DATA_LENGTH);
        let ln = parseInt(lights.length/ShaderProgram.LIGHT_LENGTH);

        this.data_objects_tex = WebglHelper.createTexture();
        this.data_lights_tex = WebglHelper.createTexture();
        WebglHelper.setTexture(
            this.data_objects_tex,1,
            ShaderProgram.DATA_LENGTH, on,
            gl.R32F,gl.RED,gl.FLOAT,data_objects,true
        );
        WebglHelper.setTexture(
            this.data_lights_tex,2,
            ShaderProgram.LIGHT_LENGTH, ln,
            gl.R32F,gl.RED,gl.FLOAT,data_lights,true
        );

        this.shader.uniforms.eye = eye;
        this.shader.uniforms.matrix = Matrix.Translation(
            Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]
        ).multiply(1 / 512)).multiply(modelviewProjection).inverse();
        this.shader.uniforms.on = ['int',on];
        this.shader.uniforms.ln = ['int',ln];
        this.shader.uniforms.textureWeight = this.sampleCount / (this.sampleCount + 1);
        this.shader.uniforms.timeSinceStart = (new Date() - this.timeStart) * 0.001;
    }

    render(){
        this.shader.render();
    }
}

export {Tracer}