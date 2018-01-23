/**
 * Created by eason on 17-5-12.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from '../utils/matrix';

class Color{
    static create(color){
        return new UniformColor(color);
    }
}

class UniformColor{
    constructor(color){
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
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Checkerboard{
    constructor(size=0.3,lineWidth=0.03){
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
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class CornellBox{
    constructor(min,max){
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
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

export {Color,Checkerboard,CornellBox};