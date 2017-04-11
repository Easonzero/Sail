precision highp float;

#define MAX_NUM_OBJECTS 100000000

#include "../lib/face.glsl"
#include "../lib/cube.glsl"
#include "../lib/sphere.glsl"
#include "../lib/ray.glsl"
#include "../lib/intersect.glsl"

varying vec3 rayd;
uniform vec3 eye;
uniform int n;
uniform sampler2D texture;
uniform sampler2D vecs;

void main() {
    gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    Ray ray = Ray(eye,rayd);

    Intersect intersect;
    intersect.d = MAX_DISTANCE;

    for(int i=0;i<MAX_NUM_OBJECTS;i++){
        if(i>=n) break;

        int category = int(texture2D(vecs,vec2(0.0,i)).r);
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
        gl_FragColor = vec4(vec3(0,0,0), 1.0);
    else
        gl_FragColor = vec4(vec3(0,1,0), 1.0);

}