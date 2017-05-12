#include "../const/define.glsl"
#include "../util/texhelper.glsl"

struct Face {
    vec3 vec_1;
    vec3 vec_2;
    vec3 vec_3;
    vec3 normal_1;
    vec3 normal_2;
    vec3 normal_3;
    float matIndex;
    float texIndex;
};

struct Cube{
    vec3 lb;
    vec3 rt;
    float matIndex;
    float texIndex;
};

struct Sphere{
    vec3 c;
    float r;
    float matIndex;
    float texIndex;
};

struct Plane{
    vec3 normal;
    float offset;
    float matIndex;
    float texIndex;
};

Cube parseCube(float index){
    Cube cube;
    cube.lb = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    cube.rt = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    cube.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);
    return cube;
}

Face parseFace(float index){
    Face face;

    face.vec_1 = readCacheVec3(vec2(1.0,index));
    face.vec_2 = readCacheVec3(vec2(2.0,index));
    face.vec_3 = readCacheVec3(vec2(3.0,index));
    face.normal_1 = readCacheVec3(vec2(4.0,index));
    face.normal_2 = readCacheVec3(vec2(5.0,index));
    face.normal_3 = readCacheVec3(vec2(6.0,index));

    face.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    face.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);

    return face;
}

Sphere parseSphere(float index){
    Sphere sphere;
    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    sphere.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);
    sphere.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    return sphere;
}

Plane parsePlane(float index){
    Plane plane;
    plane.normal = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    plane.offset = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    plane.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);
    plane.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
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