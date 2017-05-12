#version 300 es
precision highp float;

#define BOUNCES 5
#define MAXLIGHTSNUM 16
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

void trace(inout Ray ray,out vec3 fpdf,bool rr){
    fpdf = WHITE;
    for(int deepth=0;deepth<BOUNCES;){
        Intersect ins = intersectObjects(ray);
        ins.seed = timeSinceStart + float(deepth);

        if(ins.d==MAX_DISTANCE) {
            break;
        }

        vec3 wi;
        vec3 _fpdf = shade(ins,ray);
        if(_fpdf==BLACK) break;

        fpdf *= _fpdf;

        if(rr){
            float beta = maxComponent(fpdf);
            if(beta<RR_THRESH&&deepth>3){
                float p = max(0.05,beta);
                if(random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed ) < p){
                    deepth = BOUNCES;
                    return;
                }else{
                    fpdf /= 1.0-p;
                }
            }
        }

        deepth++;
    }
}

void main() {
    vec3 color = BLACK;
    vec3 lcolor[MAXLIGHTSNUM];
    vec3 ffpdf,bfpdf;
    Ray fray = Ray(eye,rayd),bray;

    trace(fray,ffpdf,false);
    for(int i=0;i<ln&&i<MAXLIGHTSNUM;i++){
        Light light = parseLight(float(on+i)/float(on+ln-1));
        bray = sampleLightRay(light,timeSinceStart + float(i));
        trace(bray,bfpdf,false);
        if(!testShadow(Ray(fray.origin,bray.origin-fray.origin)))
            color+=bfpdf*light.color*light.intensity;
    }
    color *= ffpdf;

    vec3 texture = texture( cCache, gl_FragCoord.xy / 512.0 ).rgb;
    out_color = vec4(mix(color, texture, textureWeight),1.0);
}

