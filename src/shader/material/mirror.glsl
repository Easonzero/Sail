#include "bsdfs.glsl"

void mirror_attr(float matIndex,out Reflective r){
    r.kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 mirror(Intersect ins,vec3 wo,out vec3 wi){
    vec3 f;
    float pdf;

    Reflective specular_brdf;
    mirror_attr(ins.matIndex,specular_brdf);
    specular_brdf.cr = ins.sc;

    f = reflective_sample_f(specular_brdf,wi,wo,pdf);

    return f/pdf;
}