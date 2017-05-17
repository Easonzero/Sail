#include "bsdfs.glsl"
#include "../const/ray.glsl"

void reflective_attr(float matIndex,out float kd,out float kr){
    kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
    kr = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 reflective(Intersect ins,inout Ray ray){
    vec3 wo = -ray.dir;
    vec3 wi,fd,fr;
    float pdf;
    vec3 sdir,tdir;
    float kd,kr;
    reflective_attr(ins.matIndex,kd,kr);
    getCoordinate(ins.normal,sdir,tdir);
    wo = toLocalityCoordinate(sdir,tdir,ins.normal,wo);

    Reflective specular_brdf = Reflective(kr,ins.sc);
    fr = reflective_sample_f(specular_brdf,ins.normal,wi,wo,pdf);
    //Lambertian diffuse_brdf = Lambertian(kd,ins.sc);
    //fd = lambertian_f(diffuse_brdf,wi,wo);

    vec3 f = fr;

    if(pdf<0.0001) return vec3(0.0);

    wi = toWorldCoordinate(sdir,tdir,ins.normal,wi);

    ray = Ray(ins.hit,wi);
    float ndotwi = max(dot(ins.normal,wi),0.0);
    return f*ndotwi/pdf;
}