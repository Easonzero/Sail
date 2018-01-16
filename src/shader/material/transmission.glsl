#include "bsdfs.glsl"

void transmission_attr(float matIndex,out Refractive r){
    r.nt = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
    r.F0 = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 transmission(Intersect ins,vec3 wo,out vec3 wi){
    vec3 f;
    float pdf;

    Refractive refractive_brdf;
    transmission_attr(ins.matIndex,refractive_brdf);
    refractive_brdf.rc = ins.sc;

    f = refractive_sample_f(refractive_brdf,ins.seed,ins.normal,wi,wo,pdf);

    return f/pdf;
}