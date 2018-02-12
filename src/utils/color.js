/**
 * Created by eason on 2/4/18.
 */
import {UniformColor} from '../scene/texture';
import {Vector} from './matrix';

class Color {
    static createTexture(color){
        if(color instanceof Array)
            return new UniformColor(color);

        return new UniformColor(color.flatten())
    }

    static get BLACK(){
        return new UniformColor([0,0,0])
    };
    static get WHITE(){
        return new UniformColor([1,1,1])
    };
    static get GREEN(){
        return new UniformColor([0,1,0])
    }
    static get BLUE(){
        return new UniformColor([0,0,1])
    }
    static get RED(){
        return new UniformColor([1,0,0])
    }
}

export {Color}