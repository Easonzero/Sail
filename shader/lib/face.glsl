#include "ray.glsl"

struct Face {
    vec3 vecs[3];
    vec3 color;
    int material;
};

Face parse(sampler2D data,int i){
    Face face;
    for(int t=0;t<3;t++){
        face.vecs[t] = texture2D(data,vec2(i,t));
    }

    return face;
}

float intersect(Ray ray,Face face){
    return 0;
}