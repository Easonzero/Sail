/**
 * Created by eason on 17-4-12.
 */
import {Camera} from './camera';
import {Object3D,Cube,Sphere,Rectangle} from './geometry';
import {Light,GeometryLight} from './light';
import trace from '../shader/trace/shader.trace'
import filter from '../shader/filter/shader.filter'
import {PluginParams} from '../shader/generator';

class Scene {
    constructor(){
        this.camera = {};
        this.objects = [];
        this.lights = [];
        this.sampleCount = 0;
        this._trace = new PluginParams("path");
        this._filter = new PluginParams("color");

        this.select = null;
        this.moving = false;
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
        }else if(something instanceof Object3D){
            this.objects.push(something);
        }else if(something instanceof Light){
            if(something instanceof GeometryLight){
                this.objects.push(something.getGeometry(this.objects.length));
            }
            this.lights.push(something);
        }
    }

    update(){
        this.camera.update();
        scene.sampleCount = 0;
    }

    tracerConfig() {
        let pluginsList = {
            shape:[],
            light:[],
            material:[],
            texture:[],
            trace:this.trace
        };

        let tmp = {
            shape:[],
            light:[],
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

        for(let light of this.lights){
            if(light.pluginName &&
                !tmp.light.includes(light.pluginName)){
                pluginsList.light.push(new PluginParams(light.pluginName));
                tmp.light.push(light.pluginName);
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