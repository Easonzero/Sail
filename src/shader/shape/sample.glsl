#include "primitive.glsl"
#include "intersect.glsl"
#include "../util/sampler.glsl"

vec3 sampleRectangle(Intersect ins,vec3 min,vec3 x,vec3 y,out float pdf){
     float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );
     float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );
     pdf = 1.0/(length(x)*length(y));
     return min+u1*x+u2*y;
}

vec3 sampleGeometry(Intersect ins,int i,out vec3 fpdf){
    fpdf = BLACK;
    int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
    vec3 result = BLACK;
    if(category==CUBE){
        float pdf;
        Cube cube = parseCube(float(i)/float(ln+n-1));
        vec3 x = vec3(cube.rt.x-cube.lb.x,0.0,0.0);
        vec3 y = vec3(0.0,0.0,cube.rt.z-cube.lb.z);
        result = sampleRectangle(ins,cube.lb,x,y,pdf);
        vec3 normal = normalForCube(result,cube);
        fpdf = cube.emission*max(0.0,dot(normal,ins.hit-result))/pdf;//放大直接光照
    }else if(category==SPHERE){
        //todo
    }
    else if(category==PLANE){
        //todo
    }
    return result;
}