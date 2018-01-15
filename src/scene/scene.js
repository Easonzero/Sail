/**
 * Created by eason on 17-4-12.
 */
import {Camera} from './camera';
import {Cube,Sphere,Plane} from './geometry';

class Scene {
    constructor(){
        this.camera = {};
        this.lights = [];
        this.objects = [];
        this.sampleCount = 0;
    }

    get mat(){
        return this.camera.projection.x(this.camera.modelview);
    }

    get eye(){
        return this.camera.eye;
    }

    add(something){
        if(something instanceof Camera){
            this.camera = something;
        }else if(something instanceof Cube||
            something instanceof Sphere||
            something instanceof Plane){
            if(something.light) this.lights.push(something);
            else this.objects.push(something);
        }
    }

    update(){
        this.camera.update();
        scene.sampleCount = 0;
    }
}

export {Scene};