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

vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){
    vec3 f,direct = BLACK,_fpdf;
    bool into = dot(ins.normal,-wo) < 0.0;
    if(!into) {ins.normal = -ins.normal;}

    wo = worldToLocal(wo,ins.normal,ins.dpdu,ins.dpdv);
    fpdf = material(ins.seed,ins.matCategory,ins.matIndex,ins.sc,into,wo,wi,f);
    wi = localToWorld(wi,ins.normal,ins.dpdu,ins.dpdv);

    if(ins.index>=ln&&ins.matCategory==MATTE)
        for(int i=0;i<ln;i++){
            vec3 light = sampleGeometry(ins,i,_fpdf);
            vec3 toLight = light - ins.hit;
            float d = length(toLight);
            if(!testShadow(Ray(ins.hit + ins.normal * 0.0001, toLight)))
                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);
        }

    return ins.emission+direct;
}

void trace(Ray ray,out vec3 e,int maxDeepth){
    vec3 fpdf = WHITE;e = BLACK;
    int deepth=1;
    while(++deepth<=maxDeepth){
        Intersect ins = intersectObjects(ray);
        ins.seed = timeSinceStart + float(deepth);
        if(ins.d==MAX_DISTANCE) break;

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
