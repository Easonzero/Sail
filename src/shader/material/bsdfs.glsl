#include "../const/define.glsl"
#include "../light/light.glsl"
#include "../util/sampler.glsl"

//lambertian

struct Lambertian{
    float kd;
    vec3 cd;
};

vec3 lambertian_f(Lambertian l,vec3 wi,vec3 wo){
    return l.kd * l.cd * INVPI;
}

vec3 lambertian_sample_f(Lambertian l,float seed,out vec3 wi, vec3 wo, out float pdf){
    vec3 normal = vec3(0,0,1);
	wi = cosWeightHemisphere(seed);
	pdf = dot(normal,wi) * INVPI;
	return lambertian_f(l,wi,wo);
}