#include "define.glsl"

struct Sphere{
    vec3 c;
    float r;
    int material;
};

Sphere parseSphere(sampler2D data,int index){
    Sphere sphere;
    for(int i=0;i<3;i++){
        sphere.c[i] = texture2D(data,vec2(float(i+1)/DATA_LENGTH,index)).r;
    }
    sphere.r = texture2D(data,vec2(float(4)/DATA_LENGTH,index)).r;
    sphere.material = int(texture2D(data,vec2(float(5)/DATA_LENGTH,index)).r);
    return sphere;
}