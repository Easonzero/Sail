/**
 * Created by eason on 17-4-12.
 */
import {Camera} from './camera';
import {Cube,Sphere,Plane} from './geometry';
import trace from '../shader/trace/shader.trace'
import filter from '../shader/filter/shader.filter'

class Scene {
    constructor(){
        this.camera = {};
        this.objects = [];
        this.sampleCount = 0;
        this.lgcount = 0;
        this.obcount = 0;
        this._trace = "pathtrace";
        this._filter = "gamma";
    }

    set filter(plugin){
        if(filter.query(plugin)) this._filter = plugin;
    }

    get filter(){
        return this._filter;
    }

    set trace(plugin){
        if(trace.query(plugin)) this._trace = plugin;
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
        }else if(something instanceof Cube||
            something instanceof Sphere||
            something instanceof Plane){
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

        for(let ob of this.objects){
            if(ob.pluginName &&
                !pluginsList.shape.includes(ob.pluginName))
                pluginsList.shape.push(ob.pluginName);
            if(ob.material.pluginName &&
                !pluginsList.material.includes(ob.material.pluginName))
                pluginsList.material.push(ob.material.pluginName);
            if(ob.texture.pluginName &&
                !pluginsList.texture.includes(ob.texture.pluginName))
                pluginsList.texture.push(ob.texture.pluginName);
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