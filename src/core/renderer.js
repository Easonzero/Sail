/**
 * Created by eason on 17-3-21.
 */
import {vs_render,fs_render} from '../shader/shader.program';
import {Tracer} from './tracer';
import {ShaderProgram,WebglHelper} from './webgl';

class Renderer {
    constructor(canvas){
        WebglHelper.initWebgl(canvas);

        this.shader = new ShaderProgram(vs_render,fs_render);

        this.tracer = new Tracer();

        this.data={objects:[],texparams:[],ln:0,n:0};
    }

    update(scene){
        for(let light of scene.lights){
            this.data.objects.push(...light.gen(this.data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH));
            this.data.texparams.push(...light.genTexparams());
        }
        for(let object of scene.objects){
            this.data.objects.push(...object.gen(this.data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH));
            this.data.texparams.push(...object.genTexparams());
        }
        this.data.ln = scene.lights.length;
        this.data.n = scene.objects.length;
        this.tracer.update(this.data);
    }

    render(scene){
        WebglHelper.clearScreen();
        this.tracer.render(scene.mat,scene.eye,scene.sampleCount);
        this.shader.render();
        scene.sampleCount++;
    }
}

export {Renderer};