/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from "../utils/matrix";

function roughnessToAlpha(roughness) {
    roughness = Math.max(roughness, 1e-3);
    let x = Math.log(roughness);
    return 1.62142 + 0.819955 * x + 0.1734 * x * x +
    0.0171201 * x * x * x + 0.000640711 * x * x * x * x;
}

class Material{
    constructor(){
        this._pluginName = '';
    }

    get pluginName(){
        return this._pluginName;
    }

    set pluginName(name){}

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

        this._pluginName = "matte";

        if(this.sigma!==0){
            sigma = sigma*Math.PI/180;
            let sigma2 = sigma * sigma;
            this.A = 1.0 - (sigma2 / (2.0 * (sigma2 + 0.33)));
            this.B = 0.45 * sigma2 / (sigma2 + 0.09);
        }
    }

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

        this._pluginName = "mirror";
    }

    gen(){
        let tmp = [
            2,this.kr
        ];

        return super.gen(tmp);
    }
}

class Metal extends Material{
    constructor(roughness=0.01,uroughness=0,vroughness=0,eta,k){
        super();

        this.uroughness = uroughness===0?roughness:uroughness;
        this.vroughness = vroughness===0?roughness:vroughness;

        this.eta = eta?eta:new Vector([9.530817595377695, 6.635831967341377, 4.47513354108444]);
        this.k = k?k:new Vector([13.028170336874789, 8.112634272577575, 5.502811570992323]);

        this._pluginName = "metal";
    }

    gen(){
        let tmp = [
            3,this.uroughness,this.vroughness,
            this.eta.e(1),this.eta.e(2),this.eta.e(3),
            this.k.e(1),this.k.e(2),this.k.e(3)
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
        this.uroughness = uroughness===0?uroughness:uroughness;
        this.vroughness = vroughness===0?vroughness:vroughness;

        this._pluginName = "glass";
    }

    gen(){
        let tmp = [
            4,this.kr,this.kt,this.eta,this.uroughness,this.vroughness
        ];

        return super.gen(tmp);
    }
}

export {Matte,Mirror,Metal,Glass};