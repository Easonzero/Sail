/**
 * Created by eason on 17-3-21.
 */
import {vs_trace,fs_trace} from '../shader/shader.program';
import {ShaderProgram,WebglHelper} from './webgl';

class Tracer {
    constructor(){
        this.shader = new ShaderProgram(vs_trace,fs_trace,true);
        this.timeStart = new Date();

        this.shader.textures.cCache = 0;
        this.shader.textures.objects = 1;
        this.shader.textures.texParams = 2;

        this.objects_tex = {};
        this.params_tex = {};
        this.pcache_tex = {};
    }

    update(data){
        let data_objects = new Float32Array(data.objects);
        let data_texparams = new Float32Array(data.texparams);

        let on = parseInt(data.objects.length/ShaderProgram.OBJECTS_LENGTH-data.ln);
        let tn = parseInt(data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH);

        this.objects_tex = WebglHelper.createTexture();
        this.params_tex = WebglHelper.createTexture();
        WebglHelper.setTexture(
            this.objects_tex,1,
            ShaderProgram.OBJECTS_LENGTH, on+data.ln,
            gl.R32F,gl.RED,gl.FLOAT,data_objects,true
        );
        WebglHelper.setTexture(
            this.params_tex,2,
            ShaderProgram.TEXPARAMS_LENGTH, tn,
            gl.R32F,gl.RED,gl.FLOAT,data_texparams,true
        );

        this.shader.uniforms.on = ['int',on];
        this.shader.uniforms.ln = ['int',data.ln];
        this.shader.uniforms.tn = ['int',tn];

        if(data.pcache.length!=0){
            this.shader.textures.pCatch = 3;
            let data_pcache = new Float32Array(data.pcache);
            let pn = parseInt(data.pcache.length/ShaderProgram.PCATCH_LENGTH);
            this.pcache_tex = WebglHelper.createTexture();
            WebglHelper.setTexture(
                this.pcache_tex,3,
                ShaderProgram.TEXPARAMS_LENGTH, pn,
                gl.R32F,gl.RED,gl.FLOAT,data_pcache,true
            );
            this.shader.uniforms.tn = ['int',pn];
        }
    }

    render(modelviewProjection,eye,sampleCount){
        this.shader.uniforms.eye = eye;
        this.shader.uniforms.matrix = Matrix.Translation(
            Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]
            ).multiply(1 / 512)).multiply(modelviewProjection).inverse();
        this.shader.uniforms.textureWeight = sampleCount===0?0.0001:sampleCount / (sampleCount + 1);
        this.shader.uniforms.timeSinceStart = (new Date() - this.timeStart) * 0.001;

        this.shader.render();
    }
}

export {Tracer}