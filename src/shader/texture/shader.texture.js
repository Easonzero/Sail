/**
 * Created by eason on 1/20/18.
 */
import {Generator,Export,Plugin} from '../generator';
import noise from './noise.glsl';
import checkerboard from './checkerboard.glsl';
import checkerboard2 from './checkerboard2.glsl';
import cornellbox from './cornellbox.glsl';
import bilerp from './bilerp.glsl';
import dots from './dots.glsl';
import fbm from './fbm.glsl';
import marble from './marble.glsl';
import mix from './mix.glsl';
import scale from './scale.glsl';
import uv from './uv.glsl';
import windy from './windy.glsl';
import wrinkled from './wrinkled.glsl';

let plugins = {
    "checkerboard":new Plugin("checkerboard",checkerboard),
    "checkerboard2":new Plugin("checkerboard2",checkerboard2),
    "cornellbox":new Plugin("cornellbox",cornellbox),
    "bilerp":new Plugin("bilerp",bilerp),
    "dots":new Plugin("dots",dots),
    "fbm":new Plugin("fbm",fbm),
    "marble":new Plugin("marble",marble),
    "mix":new Plugin("mix",mix),
    "scale":new Plugin("scale",scale),
    "uv":new Plugin("uv",uv),
    "windy":new Plugin("windy",windy),
    "wrinkled":new Plugin("wrinkled",wrinkled),
};

let head = `vec3 getSurfaceColor(vec3 hit,vec2 uv,float texIndex){
    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);
    if(texCategory==UNIFORM_COLOR) return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);`
let tail = `return BLACK;}`;

let ep = new Export("getSurfaceColor",head,tail,"texCategory",function(plugin){
    return `return ${plugin.name}(hit,uv,texIndex);`
});

export default new Generator("texture",[noise],[""],plugins,ep);