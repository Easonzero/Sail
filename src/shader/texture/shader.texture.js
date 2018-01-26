/**
 * Created by eason on 1/20/18.
 */
import {Generator,Export,Plugin} from '../generator';
import checkerboard from './checkerboard.glsl';
import cornellbox from './cornellbox.glsl';

let plugins = {
    "checkerboard":new Plugin("checkerboard",checkerboard),
    "cornellbox":new Plugin("cornellbox",cornellbox)
};

let head = `vec3 getSurfaceColor(vec3 hit,float texIndex){
    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);
    if(texCategory==UNIFORM_COLOR) return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);`
let tail = `return BLACK;}`;

let ep = new Export("getSurfaceColor",head,tail,"texCategory",function(plugin){
    return `return ${plugin.name}(hit,texIndex);`
});

export default new Generator("texture",[""],[""],plugins,ep);