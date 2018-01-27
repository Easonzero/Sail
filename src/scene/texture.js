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

export {Color,Checkerboard,CornellBox};