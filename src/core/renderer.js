/**
 * Created by eason on 17-3-21.
 */
import {Tracer} from './tracer';
import {ShaderProgram,WebglHelper} from './webgl';
import {RenderShader} from './shader';

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

export {Renderer};