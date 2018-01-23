/**
 * Created by eason on 17-3-21.
 */
import {ShaderProgram,WebglHelper} from './webgl'
import {TraceShader} from './shader'
import {Matrix,Vector} from '../utils/matrix';

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

export {Tracer}