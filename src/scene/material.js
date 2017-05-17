import {ShaderProgram} from '../core/webgl';
/**
 * Created by eason on 17-5-12.
 */

class Matte{
    constructor(kd=1){
        if(kd<=0) kd=1;
        this.kd = kd;
    }

    gen(){
        let tmp = [
            1,this.kd
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Reflective{
    constructor(kd=0.5,kr=0.5){
        if(kd<=0) kd=0.5;
        if(kr<=0) kr=0.5;
        this.kd = kd;
        this.kr = kr;
    }

    gen(){
        let tmp = [
            2,this.kd,this.kr
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

export {Matte,Reflective};