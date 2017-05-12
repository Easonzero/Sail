import {ShaderProgram} from '../core/webgl';
/**
 * Created by eason on 17-5-12.
 */

class Matte{
    constructor(kd){
        this.kd = kd;
    }

    gen(){
        let tmp = [
            1,this.kd
        ];
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,2,tmp.length);
    }
}

export {Matte};