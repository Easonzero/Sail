/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from '../utils/matrix';

class Texture{
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

class UniformColor extends Texture{
    constructor(color){
        super();

        this.color = new Vector(color);

        this._pluginName = undefined;
    }

    gen(){
        let tmp = [
            0,this.color.e(1),this.color.e(2),this.color.e(3)
        ];

        return super.gen(tmp);
    }
}

class Checkerboard extends Texture{
    constructor(size=0.1,lineWidth=0.01){
        super();

        if(size<=0) size=0.3;
        if(lineWidth<0) lineWidth=0.03;

        this.size = size;
        this.lineWidth = lineWidth;

        this._pluginName = "checkerboard";
    }

    gen(){
        let tmp = [
            5,this.size,this.lineWidth
        ];

        return super.gen(tmp);
    }
}

class Checkerboard2 extends Texture{
    constructor(color1=[1,1,1],color2=[0,0,0],size=0.1){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
        this.size = size;

        this._pluginName = "checkerboard2";
    }

    gen(){
        let tmp = [
            7,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3),
            this.size
        ];

        return super.gen(tmp);
    }
}

class Bilerp extends Texture{
    constructor(color00,color01,color10,color11){
        super();

        this.color00 = new Vector(color00);
        this.color01 = new Vector(color01);
        this.color10 = new Vector(color10);
        this.color11 = new Vector(color11);

        this._pluginName = "bilerp";
    }

    gen(){
        let tmp = [
            8,
            this.color00.e(1),this.color00.e(2),this.color00.e(3),
            this.color01.e(1),this.color01.e(2),this.color01.e(3),
            this.color10.e(1),this.color10.e(2),this.color10.e(3),
            this.color11.e(1),this.color11.e(2),this.color11.e(3)
        ];

        return super.gen(tmp);
    }
}

class Mix extends Texture{
    constructor(color1,color2,amount){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
        this.amount = amount;

        this._pluginName = "mixf";
    }

    gen(){
        let tmp = [
            9,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3),
            this.amount
        ];

        return super.gen(tmp);
    }
}

class Scale extends Texture{
    constructor(color1,color2){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);

        this._pluginName = "scale";
    }

    gen(){
        let tmp = [
            10,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3)
        ];

        return super.gen(tmp);
    }
}

class UV extends Texture{
    constructor(){
        super();
        this._pluginName = "uvf";
    }

    gen(){
        let tmp = [
            11
        ];

        return super.gen(tmp);
    }
}

export {UniformColor,Checkerboard,Checkerboard2,Bilerp,Mix,Scale,UV};