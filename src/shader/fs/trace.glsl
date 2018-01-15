#version 300 es
precision highp float;

#define MAXBOUNCES 5

uniform vec3 eye;
uniform int n,ln,tn;
uniform float textureWeight,timeSinceStart;
uniform sampler2D objects,texParams;
uniform sampler2D cache;//结果缓存

in vec3 raydir;
out vec4 out_color;

struct Ray{
    vec3 origin;
    vec3 dir;
};

#include "../util/random.glsl"
#include "../shape/sample.glsl"
#include "../material/material.glsl"

void trace(inout Ray ray,out vec3 e,int maxDeepth){
    vec3 fpdf = WHITE;e = BLACK;
    int deepth=0;
    while(deepth<maxDeepth){
        ++deepth;
        Intersect ins = intersectObjects(ray);
        ins.seed = timeSinceStart + float(deepth);
        if(ins.d==MAX_DISTANCE) break;

        //r.r
        float p = maxComponent(fpdf);
        if(++deepth>maxDeepth){
            if(random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed )<p) fpdf/=p;
            else{
                e += ins.emission*fpdf;
                break;
            }
        }

        vec3 wi;
        vec3 _fpdf;

        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;

        fpdf *= _fpdf;
        ray.origin = ins.hit;
        ray.dir = wi;
    }
}

void main() {
    int deepth;
    vec3 e;
    Ray ray = Ray(eye,raydir);

    trace(ray,e,MAXBOUNCES);

    vec3 texture = texture( cache, gl_FragCoord.xy/512.0 ).rgb;
    out_color = vec4(mix(e, texture, textureWeight),1.0);
}
