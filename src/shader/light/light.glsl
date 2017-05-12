#include "../const/define.glsl"
#include "../util/sampler.glsl"
#include "../util/texhelper.glsl"

struct Light {
    int category;
    float intensity;
    vec3 color;
    vec3 pos;
    vec3 attrs;
};

Light parseLight(float index){
    Light light;
    light.category = readInt(objects,vec2(0.0,index),OBJECTS_LENGTH);
    light.intensity = readFloat(objects,vec2(1.0,index),OBJECTS_LENGTH);
    light.color = readVec3(objects,vec2(2.0,index),OBJECTS_LENGTH);
    light.pos = readVec3(objects,vec2(5.0,index),OBJECTS_LENGTH);
    light.attrs = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);
    return light;
}

Ray sampleLightRay(Light light,float seed){
    if(light.category==POINT_LIGHT){
        return Ray(light.pos,uniformlyRandomDirection(seed));
    }
    return Ray(vec3(0,0,0),vec3(0,0,0));
}

vec3 sampleLightPos(Light light,float seed){
    if(light.category==POINT_LIGHT){
        return light.pos+uniformlyRandomVector(seed)*0.1;
    }
    return light.pos;
}