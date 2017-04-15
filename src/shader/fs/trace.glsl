#version 300 es
precision highp float;

#define BOUNCES 5

#include "../lib/random.glsl"
#include "../lib/ray.glsl"
#include "../lib/intersect.glsl"
#include "../lib/light.glsl"

uniform vec3 eye;
uniform int on;
uniform int ln;
uniform float textureWeight;
uniform float timeSinceStart;
uniform sampler2D tex;
uniform sampler2D objects;
uniform sampler2D lights;

in vec3 rayd;
out vec4 out_color;

void main() {
    Ray ray = Ray(eye,rayd);

    vec3 color = BLACK;

    for(int depth=0;depth<BOUNCES;depth++){
        Intersect ins = intersectObjects(objects,on,ray);

        if(ins.d==MAX_DISTANCE) break;

        Material material = queryMaterial(ins.material,ins.hit);
        vec3 rd = reflect(ray.dir,ins.normal);

        for(int i=0;i<ln;i++){
            Light light = parseLight(lights,float(i)/float(ln-1));
            light.pos += uniformlyRandomVector(timeSinceStart-53.0)*0.1;
            if(!testShadow(objects,on,light,ins.hit))
                color+=calcolor(material,light,ins,rd);
        }

        ray = Ray(ins.hit,normalize(rd + uniformlyRandomVector(timeSinceStart + float(depth)) * material.glossiness));
    }

    vec3 texture = texture( tex, gl_FragCoord.xy / 512.0 ).rgb;
    out_color = vec4(mix(color, texture, textureWeight),1.0);
}