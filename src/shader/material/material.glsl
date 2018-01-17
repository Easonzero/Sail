#include "../const/define.glsl"
#include "matte.glsl"
#include "mirror.glsl"
#include "metal.glsl"
#include "transmission.glsl"

vec3 material(float seed,float matIndex,vec3 sc,bool into,vec3 wo,out vec3 wi,out vec3 f){
    int matCategory = readInt(texParams,vec2(0.0,matIndex),TEX_PARAMS_LENGTH);
    f = BLACK;
    vec3 fpdf;
    if(matCategory == MATTE){
        fpdf = matte(seed,matIndex,sc,wo,wi);
        f = matte_f(matIndex,sc,wo,wi);
    }else if(matCategory == MIRROR)
        fpdf = mirror(seed,matIndex,sc,wo,wi);
    else if(matCategory == METAL){
        fpdf = metal(seed,matIndex,sc,wo,wi);
        f = metal_f(matIndex,sc,wo,wi);
    }else if(matCategory == TRANSMISSION){
        fpdf = transmission(seed,matIndex,sc,wo,wi,into);
    }

    return fpdf;
}