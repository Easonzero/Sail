/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';

function roughnessToAlpha(roughness) {
    roughness = Math.max(roughness, 1e-3);
    let x = Math.log(roughness);
    return 1.62142 + 0.819955 * x + 0.1734 * x * x +
    0.0171201 * x * x * x + 0.000640711 * x * x * x * x;
}

class Material{
    gen(data){
        let l = data.length;
        data.length = ShaderProgram.TEXPARAMS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Matte extends Material{
    constructor(kd=1,sigma=0){
        super();

        if(kd<=0) kd=1;
        this.kd = kd;
        this.sigma = sigma;
        this.A = 0;
        this.B =0;

        if(this.sigma!==0){
            sigma = sigma*Math.PI/180;
            let sigma2 = sigma * sigma;
            this.A = 1.0 - (sigma2 / (2.0 * (sigma2 + 0.33)));
            this.B = 0.45 * sigma2 / (sigma2 + 0.09);
        }
    }

    get pluginName(){
        return "matte";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            1,this.kd,this.sigma,this.A,this.B
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

class Glass extends Material{
    constructor(kr=1,kt=1,eta,uroughness=0,vroughness=0){
        super();

        this.kr = kr;
        this.kt = kt;
        this.eta = eta;
        this.uroughness = uroughness==0?uroughness:roughnessToAlpha(uroughness);
        this.vroughness = vroughness==0?vroughness:roughnessToAlpha(vroughness);
    }

    get pluginName(){
        return "glass";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            4,this.kr,this.kt,this.eta,this.uroughness,this.vroughness
        ];

        return super.gen(tmp);
    }
}

export {Matte,Mirror,Metal,Glass};