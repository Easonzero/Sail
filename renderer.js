/**
 * Created by eason on 17-3-21.
 */
import {vs_render,fs_render} from './shader/shader.program';
import {Tracer} from './tracer';
import {ShaderProgram,WebglHelper} from './webgl';

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

export {Renderer};