/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';

class Matte{
    constructor(kd=1){
        if(kd<=0) kd=1;
        this.kd = kd;
    }

    get pluginName(){
        return "matte";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            1,this.kd
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Mirror{
    constructor(kr=1.0){
        if(kr<=0) kr=0.5;
        this.kr = kr;
    }

    get pluginName(){
        return "mirror";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            2,this.kr
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Metal{
    constructor(ax=1,ay=1){
        this.ax = ax;
        this.ay = ay;
        this.invax2 = 1/(ax*ax);
        this.invay2 = 1/(ay*ay);
        this.const2 = 4*Math.PI*ax*ay;
    }

    get pluginName(){
        return "metal";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            3,this.ax,this.ay,this.invax2,this.invay2,this.const2
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Transmission{
    constructor(nt){
        this.nt = nt;
        this.F0 = (1.0 - nt) * (1.0 - nt) / ((1.0 + nt) * (1.0 + nt));
    }

    get pluginName(){
        return "transmission";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            4,this.nt,this.F0
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

export {Matte,Mirror,Metal,Transmission};