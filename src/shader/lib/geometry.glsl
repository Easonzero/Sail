#include "define.glsl"

struct Face {
    vec3 vec_1;
    vec3 vec_2;
    vec3 vec_3;
    vec3 normal_1;
    vec3 normal_2;
    vec3 normal_3;
    int material;
};

struct Cube{
    vec3 lb;
    vec3 rt;
    int material;
};

struct Sphere{
    vec3 c;
    float r;
    int material;
};

struct Plane{
    vec3 normal;
    float offset;
    int material;
};

Cube parseCube(sampler2D data,float index){
    Cube cube;
    for(int i=0;i<3;i++){
        cube.lb[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;
        cube.rt[i] = texture(data,vec2(float(i+4)/DATA_LENGTH,index)).r;
    }
    cube.material = int(texture(data,vec2(float(7)/DATA_LENGTH,index)).r);
    return cube;
}

Face parseFace(sampler2D data,float index){
    Face face;
    for(int i=0;i<3;i++){
        face.vec_1[i] = texture(data,vec2(float(1+i)/DATA_LENGTH,index)).r;
        face.vec_2[i] = texture(data,vec2(float(4+i)/DATA_LENGTH,index)).r;
        face.vec_3[i] = texture(data,vec2(float(7+i)/DATA_LENGTH,index)).r;
        face.normal_1[i] = texture(data,vec2(float(10+i)/DATA_LENGTH,index)).r;
        face.normal_2[i] = texture(data,vec2(float(13+i)/DATA_LENGTH,index)).r;
        face.normal_3[i] = texture(data,vec2(float(16+i)/DATA_LENGTH,index)).r;
    }

    face.material = int(texture(data,vec2(float(19)/DATA_LENGTH,index)).r);

    return face;
}

Sphere parseSphere(sampler2D data,float index){
    Sphere sphere;
    for(int i=0;i<3;i++){
        sphere.c[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;
    }
    sphere.r = texture(data,vec2(float(4)/DATA_LENGTH,index)).r;
    sphere.material = int(texture(data,vec2(float(5)/DATA_LENGTH,index)).r);
    return sphere;
}

Plane parsePlane(sampler2D data,float index){
    Plane plane;
    for(int i=0;i<3;i++){
        plane.normal[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;
    }
    plane.offset = texture(data,vec2(float(4)/DATA_LENGTH,index)).r;
    plane.material = int(texture(data,vec2(float(5)/DATA_LENGTH,index)).r);
    return plane;
}

vec3 normalForCube( vec3 hit, Cube cube )
{
	if ( hit.x < cube.lb.x + 0.0001 )
		return vec3( -1.0, 0.0, 0.0 );
	else if ( hit.x > cube.rt.x - 0.0001 )
		return vec3( 1.0, 0.0, 0.0 );
	else if ( hit.y < cube.lb.y + 0.0001 )
		return vec3( 0.0, -1.0, 0.0 );
	else if ( hit.y > cube.rt.y - 0.0001 )
		return vec3( 0.0, 1.0, 0.0 );
	else if ( hit.z < cube.lb.z + 0.0001 )
		return vec3( 0.0, 0.0, -1.0 );
	else return vec3( 0.0, 0.0, 1.0 );
}

vec3 normalForSphere( vec3 hit, Sphere sphere ){
	return (hit - sphere.c) / sphere.r;
}