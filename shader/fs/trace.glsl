#version 300 es
precision highp float;

#include "../lib/face.glsl"
#include "../lib/cube.glsl"
#include "../lib/sphere.glsl"
#include "../lib/ray.glsl"
#include "../lib/intersect.glsl"

uniform vec3 eye;
uniform int n;
uniform sampler2D tex;
uniform sampler2D vecs;

in vec3 rayd;
out vec4 color;

void main() {
    Ray ray = Ray(eye,rayd);

    Intersect intersect;
    intersect.d = MAX_DISTANCE;

    for(int i=0;i<n;i++){
        int category = int(texture(vecs,vec2(0.0,i)).r);
        Intersect tmp;

        if(category==0){
            Face face = parseFace(vecs,i);
            tmp = intersectFace(ray,face);
        }else if(category==1){
            Cube cube = parseCube(vecs,i);
            tmp = intersectCube(ray,cube);
        }else if(category==2){
            Sphere sphere = parseSphere(vecs,i);
            tmp = intersectSphere(ray,sphere);
        }

        if(tmp.d<intersect.d){
            intersect = tmp;
        }
    }

    if(intersect.d==MAX_DISTANCE)
        color = vec4(0.0,0.0,0.0,1.0);
    else
        color = vec4(0.0,0.0,1.0,1.0);
}