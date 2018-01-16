#include "../const/define.glsl"
#include "../util/sampler.glsl"

//lambertian

struct Lambertian{
    float kd;
    vec3 cd;
};

vec3 lambertian_f(Lambertian l,const vec3 wi,const vec3 wo){
    return l.kd * l.cd * INVPI;
}

vec3 lambertian_sample_f(Lambertian l,float seed,vec3 n,out vec3 wi, vec3 wo, out float pdf){
	wi = cosineWeightedDirection(seed,n);
	pdf = INVPI;
	return lambertian_f(l,wi,wo);
}

//reflective

struct Reflective{
    float kr;
    vec3 cr;
};

vec3 reflective_f(Reflective r,const vec3 wi,const vec3 wo){
    return r.kr*r.cr;
}

vec3 reflective_sample_f(Reflective r,vec3 n,out vec3 wi, vec3 wo, out float pdf){
	wi = reflect(-wo,n);
	pdf = 1.0;
	return reflective_f(r,wi,wo);
}


//ward

struct Ward{
    float ax, ay;
    float invax2, invay2;
    float const2;
    vec3 rs;
};

vec3 ward_f(Ward w,const vec3 wi,const vec3 wo){
//    vec3 H = normalize(wi+wo);
//    vec3 specular = BLACK;
//	if(H.z <= 0.f) return specular;
//	float const1 = wi.z*wo.z;
//	if(const1 <= 0.f) return specular;
//	const1 = inversesqrt(const1);
//	float const3 = exp(-1.f * (H.x*H.x*w.invax2 + H.y*H.y*w.invay2)/(H.z*H.z));
//	specular = w.rs * const3 * const1 / w.const2;
    return w.rs;
}

vec3 ward_sample_f(Ward w,float seed,vec3 n,out vec3 wi, vec3 wo, out float pdf){
    vec3 h;
    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float phi = atan(w.ay*tan(2.0*PI*u2)/w.ax);
	float cosPhi = cos(phi);
	float sinPhi = sqrt(1.0-cosPhi*cosPhi);
	float theta = atan(sqrt(-log(u1)/(cosPhi*cosPhi*w.invax2 + sinPhi*sinPhi*w.invay2)));

	h.z = cos(theta);
	float cosTheta2 = h.z*h.z;
	float sinTheta = sqrt(1.0-cosTheta2);
	float tanTheta2 = (1.0-cosTheta2)/cosTheta2;
	h.x = cosPhi*sinTheta;
	h.y = sinPhi*sinTheta;

	pdf = 1.0;//exp(-tanTheta2*(cosPhi*cosPhi*w.invax2 + sinPhi*sinPhi*w.invay2))/(w.const2*dot(h,wo)*cosTheta2*h.z);

    vec3 sdir, tdir;
    if (abs(n.x)<0.0) {
        sdir = cross(n, vec3(1,0,0));
    }
    else {
        sdir = cross(n, vec3(0,1,0));
    }
    tdir = cross(n, sdir);
    h = h.x*sdir + h.y*tdir + h.z*n;

	if(dot(wo,h)<-EPSILON) h=-h;
	wi = reflect(-wo,h);
	return ward_f(w,wi,wo);
}

//refractive

struct Refractive{
    vec3 rc;
    float F0;
    float nt;
};

vec3 refractive_sample_f(Refractive r,float seed,vec3 n,bool into,out vec3 wi, vec3 wo, out float pdf){
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
    float nnt = into ? NC / r.nt : r.nt / NC;
    float ddn = dot(-wo,n);

	float cos2t = 1.0-nnt*nnt*(1.0-ddn*ddn);

	if (cos2t < 0.0){
	    pdf = 1.0;
	    wi = -wo - n * 2.0 * dot(-wo,n);
	    return r.rc;
	}

	vec3 refr = normalize(-wo*nnt - n*(ddn*nnt+sqrt(cos2t)));

	float c = 1.0-(into?-ddn:dot(-n,refr));
    float Fe = r.F0 + (1.0 - r.F0) * c * c * c * c * c;
    float Fr = 1.0 - Fe;
    pdf = 0.25 + 0.5 * Fe;
    if (u < pdf){
        wi = -wo - n * 2.0 * dot(-wo,n);
        return r.rc * Fe;
    }
    else{
        wi = refr;
        pdf = 1.0-pdf;
        return r.rc * Fr;
    }
}


