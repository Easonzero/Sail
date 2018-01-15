#include "../const/define.glsl"
#include "../util/texhelper.glsl"

struct Cube{
    vec3 lb;
    vec3 rt;
    float matIndex;
    float texIndex;
    vec3 emission;
};

struct Sphere{
    vec3 c;
    float r;
    float matIndex;
    float texIndex;
    vec3 emission;
};

struct Plane{
    vec3 normal;
    float offset;
    bool dface;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Cube parseCube(float index){
    Cube cube;
    cube.lb = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    cube.rt = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    cube.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);
    return cube;
}

Sphere parseSphere(float index){
    Sphere sphere;
    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    sphere.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);
    sphere.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    sphere.emission = readVec3(objects,vec2(7.0,index),OBJECTS_LENGTH);
    return sphere;
}

Plane parsePlane(float index){
    Plane plane;
    plane.normal = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    plane.offset = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    plane.dface = readBool(objects,vec2(5.0,index),OBJECTS_LENGTH);
    plane.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    plane.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    plane.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);
    return plane;
}

vec3 normalForCube( vec3 hit, Cube cube , float f)
{
	if ( hit.x < cube.lb.x + 0.0001 )
		return vec3( -1.0, 0.0, 0.0 ) * f;
	else if ( hit.x > cube.rt.x - 0.0001 )
		return vec3( 1.0, 0.0, 0.0 ) * f;
	else if ( hit.y < cube.lb.y + 0.0001 )
		return vec3( 0.0, -1.0, 0.0 ) * f;
	else if ( hit.y > cube.rt.y - 0.0001 )
		return vec3( 0.0, 1.0, 0.0 ) * f;
	else if ( hit.z < cube.lb.z + 0.0001 )
		return vec3( 0.0, 0.0, -1.0 ) * f;
	else return vec3( 0.0, 0.0, 1.0 ) * f;
}

vec3 normalForSphere( vec3 hit, Sphere sphere ){
	return (hit - sphere.c) / sphere.r;
}