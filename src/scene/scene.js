/**
 * Created by eason on 17-4-12.
 */
import {Camera} from './camera';
import {Cube,Sphere,Plane,Object3D} from './geometry';
import {Light} from './light';

class Scene {
    constructor(){
        this.camera = {};
        this.lights = [];
        this.objects = [];
        this.sampleCount = 1;
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
            something instanceof Plane||
            something instanceof Object3D){
            this.objects.push(something);
        }else if(something instanceof Light){
            this.lights.push(something);
        }
    }

    update(){
        this.camera.update();
        scene.sampleCount = 1;
    }
}

export {Scene};