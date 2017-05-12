#include "random.glsl"

vec3 toLocalityCoordinate(vec3 sdir,vec3 tdir,vec3 normal,vec3 w){
    return vec3(dot(w,sdir),dot(w,tdir),dot(w,normal));
}

vec3 toWorldCoordinate(vec3 sdir,vec3 tdir,vec3 normal,vec3 w){
    return w.x*sdir+w.y*tdir+w.z*normal;
}

vec3 uniformlyRandomDirection( float seed ){
	float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );
	float angle = 2.0 * PI * v;
	return vec3( r * cos( angle ), r * sin( angle ), z );
}

vec3 uniformlyRandomVector( float seed ){
	return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));
}

vec3 cosWeightHemisphere(float seed){
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float angle = 2.0 * PI * v;

	return vec3(u*cos(angle),u*sin(angle),cos(asin(u)));
}

vec3 cone(vec3 dir, float extent,float seed) {
	dir = normalize(dir);
	vec3 o1 = normalize(ortho(dir));
	vec3 o2 = normalize(cross(dir, o1));
	vec2 r =  random2( seed );
	r.x=r.x*2.*PI;
	r.y=1.0-r.y*extent;
	float oneminus = sqrt(1.0-r.y*r.y);
	return cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;
}