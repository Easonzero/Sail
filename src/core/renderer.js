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
    }

    update(scene){
        let data_objects=[],data_lights=[];
        for(let object of scene.objects){
            data_objects.push(...object.gen());
        }
        for(let light of scene.lights){
            data_lights.push(...light.gen());
        }
        this.tracer.update(data_objects,data_lights,scene.mat, scene.eye,scene.sampleCount);
        scene.sampleCount++;
    }

    render(){
        WebglHelper.clearScreen();
        this.tracer.render();
        this.shader.render();
    }
}

export {Renderer};