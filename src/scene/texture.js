/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from '../utils/matrix';

class Texture{
    gen(data){
        let l = data.length;
        data.length = ShaderProgram.TEXPARAMS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Color {
    static create(color){
        return new UniformColor(color);
    }
}

class UniformColor extends Texture{
    constructor(color){
        super();

        this.color = new Vector(color);
    }

    get pluginName(){
        return undefined;
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            0,this.color.e(1),this.color.e(2),this.color.e(3)
        ];

        return super.gen(tmp);
    }
}

class Checkerboard extends Texture{
    constructor(size=0.3,lineWidth=0.03){
        super();

        if(size<=0) size=0.3;
        if(lineWidth<0) lineWidth=0.03;

        this.size = size;
        this.lineWidth = lineWidth;
    }

    get pluginName(){
        return "checkerboard";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            5,this.size,this.lineWidth
        ];

        return super.gen(tmp);
    }
}

class CornellBox extends Texture{
    constructor(min,max){
        super();

        this.min = new Vector(min);
        this.max = new Vector(max);
    }

    get pluginName(){
        return "cornellbox";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            6,this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];

        return super.gen(tmp);
    }
}

class Checkerboard2 extends Texture{
    constructor(color1=[1,1,1],color2=[0,0,0]){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
    }

    get pluginName(){
        return "checkerboard2";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            7,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3),
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
    }

    get pluginName(){
        return "bilerp";
    }

    set pluginName(name){}

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

class Dots extends Texture{
    constructor(inside,outside){
        super();

        this.inside = new Vector(inside);
        this.outside = new Vector(outside);
    }

    get pluginName(){
        return "dots";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            9,
            this.inside.e(1),this.inside.e(2),this.inside.e(3),
            this.outside.e(1),this.outside.e(2),this.outside.e(3),
        ];

        return super.gen(tmp);
    }
}

class Fbm extends Texture{
    constructor(octaves,omega){
        super();

        this.octaves = octaves;
        this.omega = omega;
    }

    get pluginName(){
        return "fbm";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            10,
            this.octaves,this.omega
        ];

        return super.gen(tmp);
    }
}

class Marble extends Texture{
    constructor(octaves,omega,scale,variation){
        super();

        this.octaves = octaves;
        this.omega = omega;
        this.scale = scale;
        this.variation = variation;
    }

    get pluginName(){
        return "marble";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            11,
            this.octaves,this.omega,this.scale,this.variation
        ];

        return super.gen(tmp);
    }
}

class Mix extends Texture{
    constructor(octaves,color1,color2,amount){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
        this.amount = amount;
    }

    get pluginName(){
        return "mix";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            12,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3),
            this.amount
        ];

        return super.gen(tmp);
    }
}

class Scale extends Texture{
    constructor(octaves,color1,color2){
        super();

        this.color1 = new Vector(color1);
        this.color2 = new Vector(color2);
    }

    get pluginName(){
        return "scale";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            13,
            this.color1.e(1),this.color1.e(2),this.color1.e(3),
            this.color2.e(1),this.color2.e(2),this.color2.e(3)
        ];

        return super.gen(tmp);
    }
}

class UV extends Texture{
    constructor(){
        super();
    }

    get pluginName(){
        return "uv";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            14
        ];

        return super.gen(tmp);
    }
}

class Windy extends Texture{
    constructor(){
        super();
    }

    get pluginName(){
        return "windy";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            15
        ];

        return super.gen(tmp);
    }
}

class Wrinkled extends Texture{
    constructor(octaves,omega){
        super();

        this.octaves = octaves;
        this.omega = omega;
    }

    get pluginName(){
        return "wrinkled";
    }

    set pluginName(name){}

    gen(){
        let tmp = [
            16,
            this.octaves,this.omega
        ];

        return super.gen(tmp);
    }
}

export {Color,Checkerboard,CornellBox,Checkerboard2,Bilerp,Dots,Fbm,Marble,Mix,Scale,UV,Windy,Wrinkled};