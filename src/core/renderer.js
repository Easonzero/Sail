/**
 * Created by eason on 17-3-21.
 */
import {Tracer} from './tracer';
import {ShaderProgram,WebglHelper} from './webgl';
import {RenderShader,LineShader} from './shader';

class Renderer {
    constructor(canvas){
        WebglHelper.initWebgl(canvas);

        this.renderShader = new ShaderProgram();
        this.lineShader = new ShaderProgram();

        this.lineShader.addVBO(gl.ARRAY_BUFFER,new Float32Array([
            0, 0, 0,
            1, 0, 0,
            0, 1, 0,
            1, 1, 0,
            0, 0, 1,
            1, 0, 1,
            0, 1, 1,
            1, 1, 1
        ]));
        this.lineShader.addVBO(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 2, 6, 3, 7
        ]));
        this.renderShader.addVBO(gl.ARRAY_BUFFER,new Float32Array([
            -1, -1,
            -1, +1,
            +1, -1,
            +1, +1
        ]));
        this.lineShader.setProgram(new LineShader());

        this.tracer = new Tracer();
    }

    updateObjects(scene){
        this.tracer.updateObjects(scene);
    }

    update(scene){
        this.renderShader.setProgram(new RenderShader(scene.rendererConfig()));
        this.tracer.update(scene);

        this.renderShader.texture.colorMap.value = 0;
        this.renderShader.texture.normalMap.value = ShaderProgram.frameCache[2];
        this.renderShader.texture.positionMap.value = ShaderProgram.frameCache[3];
    }

    render(scene){
        WebglHelper.clearScreen();

        if(scene.moving){
            scene.sampleCount = 0;
            this.updateObjects(scene);
        }

        this.tracer.render(scene.mat,scene.eye,scene.sampleCount++);
        this.renderShader.render('triangle');

        if(scene.select){
            let boundbox = scene.select.boundbox();
            this.lineShader.uniform.cubeMin.value = boundbox.min;
            this.lineShader.uniform.cubeMax.value = boundbox.max;
            this.lineShader.uniform.modelviewProjection.value = scene.mat;
            this.lineShader.render('line');
        }
    }
}

export {Renderer};