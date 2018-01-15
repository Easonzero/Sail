#include "bsdfs.glsl"

void matte_attr(float matIndex,out Lambertian l){
    l.kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 matte(Intersect ins,vec3 wo,out vec3 wi){
    vec3 f;
    float pdf;

    Lambertian diffuse_brdf;
    matte_attr(ins.matIndex,diffuse_brdf);
    diffuse_brdf.cd = ins.sc;

    f = lambertian_sample_f(diffuse_brdf,ins.seed,wi,wo,pdf);

    return f/pdf;
}

vec3 matte_f(Intersect ins,vec3 wo,vec3 wi){
    Lambertian diffuse_brdf;
    matte_attr(ins.matIndex,diffuse_brdf);
    diffuse_brdf.cd = ins.sc;

    return lambertian_f(diffuse_brdf,wi,wo);
}