/**
 * Created by eason on 1/20/18.
 */
import {Generator,Export,Plugin} from '../generator';
import ssutility from './ssutility.glsl';
import fresnel from './fresnel.glsl';
import microfacet from './microfacet.glsl';
import bsdf from './bsdf.glsl';
import metal from './metal.glsl';
import matte from './matte.glsl';
import mirror from './mirror.glsl';
import glass from './glass.glsl';

let plugins = {
    "metal":new Plugin("metal",metal),
    "matte":new Plugin("matte",matte),
    "mirror":new Plugin("mirror",mirror),
    "glass":new Plugin("glass",glass)
};

let head = `vec3 material(Intersect ins,vec3 wo,out vec3 wi,out vec3 f){
    f = BLACK;
    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );
    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );
    vec3 fpdf;if(false){}`;
let tail = `return fpdf;}`;

let ep = new Export("material",head,tail,"ins.matCategory",function(plugin){
    return `fpdf = ${plugin.name}(vec2(u1,u2),ins.matIndex,ins.sc,wo,wi,ins.into);
        f = ${plugin.name}_f(ins.matIndex,ins.sc,wo,wi,ins.into);`
});

export default new Generator("material",[ssutility,fresnel,microfacet,bsdf],[""],plugins,ep);