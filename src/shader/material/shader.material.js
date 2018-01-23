/**
 * Created by eason on 1/20/18.
 */
import {Generator,Export,Plugin} from '../generator';
import bsdfs from './bsdfs.glsl';
import metal from './metal.glsl';
import matte from './matte.glsl';
import mirror from './mirror.glsl';
import transmission from './transmission.glsl';

let plugins = {
    "metal":new Plugin("metal",metal),
    "matte":new Plugin("matte",matte),
    "mirror":new Plugin("mirror",mirror),
    "transmission":new Plugin("transmission",transmission)
};

let head = `vec3 material(float seed,int matCategory,float matIndex,vec3 sc,bool into,vec3 wo,out vec3 wi,out vec3 f){
    f = BLACK;
    vec3 fpdf;if(false){}`;
let tail = `return fpdf;}`;

let ep = new Export("material",head,tail,"matCategory",function(plugin){
    return `fpdf = ${plugin.name}(seed,matIndex,sc,wo,wi,into);
        f = ${plugin.name}_f(matIndex,sc,wo,wi);`
});

export default new Generator("material",bsdfs,"",plugins,ep);