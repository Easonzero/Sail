import {ShaderProgram} from '../core/webgl';
/**
 * Created by eason on 17-5-12.
 */
class Color{
    static create(color){
        return new UniformColor(color);
    }
}

class UniformColor{
    constructor(color){
        this.color = $V(color);
    }

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

    gen(){
        let tmp = [
            5,this.size,this.lineWidth
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

export {Color,Checkerboard};