/**
 * Created by eason on 1/20/18.
 */
import {Vector,Matrix} from '../utils/matrix';
import {PluginParams} from '../shader/generator'
import c from '../shader/const/shader.const'
import filter from '../shader/filter/shader.filter'
import main from '../shader/main/shader.main'
import material from '../shader/material/shader.material'
import shade from '../shader/shade/shader.shade'
import shape from '../shader/shape/shader.shape'
import texture from '../shader/texture/shader.texture'
import trace from '../shader/trace/shader.trace'
import util from '../shader/util/shader.util'

class TraceShader{
    constructor(pluginsList = {shape:[],texture:[],material:[],trace:"pathtrace"}){
        this.uniform = {
            n:{type:'int',value:0},
            ln:{type:'int',value:0},
            tn:{type:'int',value:0},
            textureWeight:{type:'float',value:0},
            timeSinceStart:{type:'float',value:0},
            matrix:{type:'mat4',value:Matrix.I(4)},
            eye:{type:'vec3',value:Vector.Zero(3)},
        };
        this.texture = {
            cache:0,
            objects:1,
            texParams:2
        };

        this.glslv = "300 es";
        this.pluginsList = pluginsList;
    }

    combinefs(){
        return `#version ${this.glslv}\n`
            + `precision highp float;
               precision highp int;\n`
            + this.uniformstr()
            + c.generate()
            + util.generate(
                new PluginParams("random"),
                new PluginParams("sampler"),
                new PluginParams("texhelper"),
                new PluginParams("utility")
            )
            + texture.generate(...this.pluginsList.texture)
            + material.generate(...this.pluginsList.material)
            + shape.generate(...this.pluginsList.shape)
            + shade.generate()
            + trace.generate(this.pluginsList.trace)
            + main.generate(new PluginParams("fstrace"))
    }

    combinevs(){
        return `#version ${this.glslv}\n`
            + `precision highp float;
               precision highp int;\n`
            + this.uniformstr()
            + util.generate(new PluginParams("utility"))
            + main.generate(new PluginParams("vstrace"))
    }

    uniformstr(){
        let result = "";
        for(let entry of Object.entries(this.uniform)){
            result += `uniform ${entry[1].type} ${entry[0]};\n`;
        }
        for(let entry of Object.entries(this.texture)){
            result += `uniform sampler2D ${entry[0]};\n`;
        }
        return result;
    }
}


class RenderShader{
    constructor(pluginsList={filter:"gamma"}){
        this.texture = {
            tex:0
        };
        this.glslv = "300 es";
        this.pluginsList = pluginsList;
    }

    combinefs(){
        return `#version ${this.glslv}\n`
            + `precision highp float;\n`
            + this.uniformstr()
            + filter.generate(this.pluginsList.filter)
            + main.generate(new PluginParams("fsrender"))
    }

    combinevs(){
        return `#version ${this.glslv}\n`
            + this.uniformstr()
            + main.generate(new PluginParams("vsrender"))
    }

    uniformstr(){return `uniform sampler2D tex;\n`}
}

export {TraceShader,RenderShader}