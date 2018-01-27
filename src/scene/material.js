/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';

class Material{
    gen(data){
        let l = data.length;
        data.length = ShaderProgram.TEXPARAMS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Matte extends Material{
    constructor(kd=1){
        super();

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

        return super.gen(tmp);
    }
}

class Mirror extends Material{
    constructor(kr=1.0){
        super();

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

        return super.gen(tmp);
    }
}

class Metal extends Material{
    constructor(ax=1,ay=1){
        super();

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

        return super.gen(tmp);
    }
}

class Transmission extends Material{
    constructor(nt){
        super();

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

        return super.gen(tmp);
    }
}

export {Matte,Mirror,Metal,Transmission};