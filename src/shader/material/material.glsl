#include "../const/define.glsl"
#include "matte.glsl"
#include "mirror.glsl"
#include "metal.glsl"
#include "transmission.glsl"

vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){
    int matCategory = readInt(texParams,vec2(0.0,ins.matIndex),TEX_PARAMS_LENGTH);
    vec3 f,direct = BLACK,_fpdf;
    bool into = dot(ins.normal,-wo) < 0.0;
    ins.normal = into ? ins.normal : ins.normal * -1.0;
    if(matCategory == MATTE){
        fpdf = matte(ins,wo,wi);
        f = matte_f(ins,wo,wi);
    }else if(matCategory == MIRROR)
        fpdf = mirror(ins,wo,wi);
    else if(matCategory == METAL){
        fpdf = metal(ins,wo,wi);
        f = metal_f(ins,wo,wi);
    }else if(matCategory == TRANSMISSION){
        fpdf = transmission(ins,wo,wi,into);
    }
    //direct
    if(ins.index>=ln&&matCategory!=MIRROR&&matCategory!=TRANSMISSION)
        for(int i=0;i<ln;i++){
            vec3 light = sampleGeometry(ins,i,_fpdf);
            vec3 toLight = light - ins.hit;
            float d = length(toLight);
            if(!testShadow(Ray(ins.hit + ins.normal * 0.0001, toLight)))
                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);
        }
    return ins.emission + direct;
}