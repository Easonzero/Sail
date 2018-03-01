import {ShaderProgram} from "../core/webgl";
import {Vector} from "../utils/matrix";

class Light{
    constructor(emission){
        this.emission = new Vector(emission);

        this._pluginName = '';
    }

    get pluginName(){
        return this._pluginName;
    }

    set pluginName(name){}

    gen(data){
        data.push(
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        );
        let l = data.length;
        data.length = ShaderProgram.LIGHTS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class GeometryLight extends Light{
    constructor(geometry,emission){
        super(emission);
        geometry.emission = new Vector(emission);
        this.geometry = geometry;
    }

    set geometry(geometry){
        this._geometry = geometry;
    }

    get geometry(){
        if(typeof this.index !== 'undefined') return this._geometry;
    }

    //don't directly visit geometry
    getGeometry(index){
        this.index = index;
        return this.geometry;
    }

    gen(data){
        if(typeof this.index === 'undefined') throw "can't find index of AreaLight's geometry";
        data.push(this.index);
        return super.gen(data);
    }
}

class AreaLight extends GeometryLight{
    constructor(geometry,emission){
        super(geometry,emission);

        this._pluginName = 'area';
    }

    gen(){
        let tmp = [0];
        return super.gen(tmp);
    }
}

class PointLight extends Light{
    constructor(from,emission){
        super(emission);

        this.from = new Vector(from);

        this._pluginName = 'point';
    }

    gen(){
        let tmp = [
            1,
            this.from.e(1),this.from.e(2),this.from.e(3)
        ];
        return super.gen(tmp);
    }
}

export {Light,GeometryLight,AreaLight,PointLight}