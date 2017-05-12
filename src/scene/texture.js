import {ShaderProgram} from '../core/webgl';
/**
 * Created by eason on 17-5-12.
 */

class UniformColor{
    constructor(color){
        this.color = $V(color);
    }

    gen(){
        let tmp = [
            0,this.color.e(1),this.color.e(2),this.color.e(3)
        ];
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,4,tmp.length);
    }
}

class Checkerboard{
    constructor(){
    }

    gen(){
        let tmp = [
            5
        ];
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,1,tmp.length);
    }
}

export {UniformColor,Checkerboard};