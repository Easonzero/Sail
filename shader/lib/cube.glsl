#include "define.glsl"

struct Cube{
    vec3 lb;
    vec3 rt;
    int material;
};

Cube parseCube(sampler2D data,int index){
    Cube cube;
    for(int i=0;i<3;i++){
        cube.lb[i] = texture2D(data,vec2(float(i+1)/DATA_LENGTH,index)).r;
        cube.rt[i] = texture2D(data,vec2(float(i+4)/DATA_LENGTH,index)).r;
    }
    cube.material = int(texture2D(data,vec2(float(7)/DATA_LENGTH,index)).r);
    return cube;
}