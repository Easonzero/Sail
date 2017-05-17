#version 300 es
precision highp float;

#define EBOUNCES 3
#define LBOUNCES 2
#define MAXLIGHTSNUM 4
#define RR_THRESH 0.5

uniform vec3 eye;
uniform int on,ln,tn,pn;
uniform float textureWeight,timeSinceStart;
uniform sampler2D objects,pCache,texParams;
uniform sampler2D cCache;
uniform sampler2D tex1,tex2,tex3,tex4;

in vec3 rayd;
out vec4 out_color;

#include "../util/random.glsl"
#include "../const/ray.glsl"
#include "../shape/intersect.glsl"
#include "../material/material.glsl"

struct RecordInfo{
    vec3 fpdf;
    vec3 hit;
};

void trace(inout int deepth,inout Ray ray,inout vec3 fpdf,bool rr){
    Intersect ins = intersectObjects(ray);
    ins.seed = timeSinceStart + float(deepth);

    if(ins.d==MAX_DISTANCE) {
        deepth=max(EBOUNCES,LBOUNCES);
        return;
    }

    vec3 wi;
    vec3 _fpdf = shade(ins,ray);
    if(_fpdf==BLACK) return;

    fpdf *= _fpdf;

    if(rr){
        float beta = maxComponent(fpdf);
        if(beta<RR_THRESH&&deepth>1){
            float p = max(0.05,beta);
            if(random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed ) < p){
                deepth=max(EBOUNCES,LBOUNCES);
                return;
            }else{
                fpdf /= 1.0-p;
            }
        }
    }

    deepth++;
}

void main() {
    vec3 color = BLACK;
    RecordInfo record[EBOUNCES];
    vec3 ffpdf = WHITE,bfpdf;
    Ray fray = Ray(eye,rayd),bray;

    for(int deepth=0;deepth<EBOUNCES;){
        trace(deepth,fray,ffpdf,false);
        record[deepth-1].fpdf = ffpdf;
        record[deepth-1].hit = fray.origin;
    }

    for(int i=0;i<ln&&i<MAXLIGHTSNUM;i++){
        Light light = parseLight(float(on+i)/float(on+ln-1));
        bray = sampleLightRay(light,timeSinceStart + float(i));
        bfpdf = WHITE;
        for(int deepth=0;deepth<LBOUNCES;){
            trace(deepth,bray,bfpdf,false);
            for(int i=0;i<EBOUNCES;i++){
                if(!testShadow(Ray(record[i].hit,bray.origin-record[i].hit)))
                    color+=record[i].fpdf*bfpdf*light.color*light.intensity;
            }
        }
    }

    color /= float(ln*LBOUNCES*EBOUNCES);

    vec3 texture = texture( cCache, gl_FragCoord.xy / 512.0 ).rgb;
    out_color = vec4(mix(color, texture, textureWeight),1.0);
}

