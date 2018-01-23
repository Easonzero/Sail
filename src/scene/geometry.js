/**
 * Created by eason on 17-4-11.
 */
import {ShaderProgram} from '../core/webgl';

class Cube{
    constructor(min,max,material,texture,emission=[0,0,0]){
        this.min = $V(min);
        this.max = $V(max);
        this.material = material;
        this.texture = texture;
        this.emission = $V(emission);

        this.light = !this.emission.equal($V([0,0,0]));
    }

    get pluginName(){
        return "cube";
    }

    set pluginName(name){}

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3),
            texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.OBJECTS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Sphere{
    constructor(c,r,material,texture,emission=[0,0,0]){
        this.c = $V(c);
        this.r = r;
        this.material = material;
        this.texture = texture;
        this.emission = $V(emission);

        this.light = !this.emission.equal($V([0,0,0]));
    }

    get pluginName(){
        return "sphere";
    }

    set pluginName(name){}

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),
            this.r,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.OBJECTS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Plane{
    constructor(normal,offset,dface=false,material,texture,emission=[0,0,0]){
        this.normal = $V(normal).toUnitVector();
        this.offset = offset;
        this.dface = dface?1:0;
        this.material = material;
        this.texture = texture;
        this.emission = $V(emission);

        this.light = !this.emission.equal($V([0,0,0]));
    }

    get pluginName(){
        return "plane";
    }

    set pluginName(name){}

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp = [
            3,
            this.normal.e(1),this.normal.e(2),this.normal.e(3),
            this.offset,this.dface,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.OBJECTS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

export {Cube,Sphere,Plane};