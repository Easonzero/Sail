/**
 * Created by eason on 17-4-12.
 */
import {ShaderProgram} from './webgl';

class Light {
    constructor(color, intensity){
        this.color = $V(color);
        this.intensity = intensity;
    }
}

class DirectionalLight extends Light{
    constructor(color, intensity, direction){
        super(color,intensity);
        this.direction = $V(direction).toUnitVector();
    }

    gen(){
        let tmp = [
            3,
            this.color.e(1),this.color.e(2),this.color.e(3),
            this.intensity,
            this.direction.e(1),this.direction.e(2),this.direction.e(3)
        ];
        tmp.length = ShaderProgram.LIGHT_LENGTH;
        return tmp.fill(this.intensity,8,tmp.length);
    }
}

class PointLight extends Light{
    constructor(color, intensity, pos){
        super(color,intensity);
        this.pos = $V(pos);
    }

    gen(){
        let tmp = [
            0,
            this.color.e(1),this.color.e(2),this.color.e(3),
            this.intensity,
            this.pos.e(1),this.pos.e(2),this.pos.e(3)
        ];
        tmp.length = ShaderProgram.LIGHT_LENGTH;
        return tmp.fill(this.intensity,8,tmp.length);
    }
}

export {Light,DirectionalLight,PointLight};