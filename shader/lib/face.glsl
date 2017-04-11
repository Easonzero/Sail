#include "define.glsl"

struct Face {
    vec3 vec_1;
    vec3 vec_2;
    vec3 vec_3;
    vec3 normal;
    int material;
};

Face parseFace(sampler2D data,int index){
    Face face;
    for(int i=0;i<3;i++){
        face.vec_1[i] = texture2D(data,vec2(float(1+i)/DATA_LENGTH,index)).r;
        face.vec_2[i] = texture2D(data,vec2(float(4+i)/DATA_LENGTH,index)).r;
        face.vec_3[i] = texture2D(data,vec2(float(7+i)/DATA_LENGTH,index)).r;
        face.normal[i] = texture2D(data,vec2(float(10+i)/DATA_LENGTH,index)).r;
    }

    face.material = int(texture2D(data,vec2(float(13)/DATA_LENGTH,index)).r);

    return face;
}