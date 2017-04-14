#include "define.glsl"
#include "material.glsl"
#include "ray.glsl"

struct Light {
    int category;
    vec3 color;
    float intensity;
    vec3 pos;
    vec3 attrs;
};

Light parseLight(sampler2D data,float index){
    Light light;
    light.category = int(texture(data,vec2(float(0)/LIGHT_LENGTH,index)).r);
    light.intensity = texture(data,vec2(float(4)/LIGHT_LENGTH,index)).r;
    for(int i=0;i<3;i++){
        light.color[i] = texture(data,vec2(float(1+i)/LIGHT_LENGTH,index)).r;
        light.pos[i] = texture(data,vec2(float(5+i)/LIGHT_LENGTH,index)).r;
        light.attrs[i] = texture(data,vec2(float(8+i)/LIGHT_LENGTH,index)).r;
    }
    return light;
}

bool testShadow(sampler2D data,int n,Light light,vec3 hit){
    vec3 ld;
    Intersect ins;
    if(light.category==DIRECT_LIGHT){
        ld = -light.pos*MAX_DISTANCE;
    }else if(light.category==POINT_LIGHT){
        ld = light.pos-hit;
    }
    ins = intersectObjects(data,n,Ray(hit,ld));
    if(ins.d>0.0&&ins.d<1.0)
        return true;
    return false;
}

vec3 calcolor(Material material,Light light,Intersect ins,vec3 rd){
    vec3 result = BLACK;
    vec3 ld;
    if(light.category==DIRECT_LIGHT){
        ld = -light.pos;
    }else if(light.category==POINT_LIGHT){
        ld = normalize(light.pos-ins.hit);
    }
    result = material.diffuse*light.intensity*light.color*max(dot(ins.normal,ld),0.00001) +
        material.specular*light.intensity*light.color*pow(clamp(dot(normalize(rd), ld), 0.0, 1.0), material.roughness);
    return result;
}