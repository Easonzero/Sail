/**
 * Created by eason on 17-4-12.
 */
import {Camera} from './camera';
import {Cube,Sphere,Plane} from './geometry';
import trace from '../shader/trace/shader.trace'
import filter from '../shader/filter/shader.filter'
import {PluginParams} from '../shader/generator';

class Scene {
    constructor(){
        this.camera = {};
        this.objects = [];
        this.sampleCount = 0;
        this.lgcount = 0;
        this.obcount = 0;
        this._trace = new PluginParams("pathtrace");
        this._filter = new PluginParams("none");
    }

    set filter(plugin){
        if(filter.query(plugin)) this._filter.name = plugin;
    }

    get filter(){
        return this._filter;
    }

    set trace(plugin){
        if(trace.query(plugin)) this._trace.name = plugin;
    }

    get trace(){
        return this._trace;
    }

    get mat(){
        return this.camera.projection.x(this.camera.modelview);
    }

    set mat(mat){}

    get eye(){
        return this.camera.eye;
    }

    set eye(eye){}

    add(something){
        if(something instanceof Camera){
            this.camera = something;
        }else if(something instanceof Object){
            if(something.light) {
                this.objects.unshift(something);
                this.lgcount++;
            }
            else {
                this.objects.push(something);
                this.obcount++;
            }
        }
    }

    update(){
        this.camera.update();
        scene.sampleCount = 0;
    }

    tracerConfig() {
        let pluginsList = {
            shape:[],
            material:[],
            texture:[],
            trace:this.trace
        };

        let tmp = {
            shape:[],
            material:[],
            texture:[]
        };

        for(let ob of this.objects){
            if(ob.pluginName &&
                !tmp.shape.includes(ob.pluginName)){
                pluginsList.shape.push(new PluginParams(ob.pluginName));
                tmp.shape.push(ob.pluginName);
            }
            if(ob.material.pluginName &&
                !tmp.material.includes(ob.material.pluginName)){
                pluginsList.material.push(new PluginParams(ob.material.pluginName));
                tmp.material.push(ob.material.pluginName);
            }
            if(ob.texture.pluginName &&
                !tmp.texture.includes(ob.texture.pluginName)){
                pluginsList.texture.push(new PluginParams(ob.texture.pluginName));
                tmp.texture.push(ob.texture.pluginName);
            }
        }
        return pluginsList;
    }

    rendererConfig(){
        return {
            filter:this.filter
        }
    }
}

export {Scene};