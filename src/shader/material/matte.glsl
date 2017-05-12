#include "bsdfs.glsl"
#include "../const/ray.glsl"

vec3 matte(Intersect ins,inout Ray ray){
    vec3 wo = -ray.dir;
    vec3 wi,f;
    float pdf;
    vec3 sdir,tdir;
    getCoordinate(ins.normal,sdir,tdir);
    wo = toLocalityCoordinate(sdir,tdir,ins.normal,wo);

    Lambertian diffuse_brdf = Lambertian(1.0,ins.sc);
    f = lambertian_sample_f(diffuse_brdf,ins.seed,wi,wo,pdf);

    wi = toWorldCoordinate(sdir,tdir,ins.normal,wi);

    float ndotwi = max(dot(ins.normal,wi),0.0);

    ray = Ray(ins.hit,normalize(wi));

    return f*ndotwi/pdf;
}