#include "bsdfs.glsl"

void mirror_attr(float matIndex,out Reflective r){
    r.kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 mirror(Intersect ins,vec3 wo,out vec3 wi){
    vec3 f;
    float pdf;
    vec3 sdir,tdir;

    Reflective specular_brdf;
    mirror_attr(ins.matIndex,specular_brdf);
    specular_brdf.cr = ins.sc;

    f = reflective_sample_f(specular_brdf,wi,wo,pdf);

    return f/pdf;
}

vec3 mirror_f(Intersect ins,vec3 wo,vec3 wi){
    Reflective specular_brdf;
    mirror_attr(ins.matIndex,specular_brdf);
    specular_brdf.cr = ins.sc;

    return reflective_f(specular_brdf,wi,wo);
}