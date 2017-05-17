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
	wi = cosWeightHemisphere(seed);
	pdf = wi.z * INVPI;
	return lambertian_f(l,wi,wo);
}

//reflective

struct Reflective{
    float kr;
    vec3 cr;
};

vec3 reflective_f(Reflective r,vec3 normal,vec3 wi,vec3 wo){
    return r.kr*r.cr / abs(wi.z);
}

vec3 reflective_sample_f(Reflective r,vec3 normal,out vec3 wi, vec3 wo, out float pdf){
	wi = vec3(-wo.x,-wo.y,wo.z);
	wi = normalize(wi);
	pdf = 1.0;
	return reflective_f(r,normal,wi,wo);
}