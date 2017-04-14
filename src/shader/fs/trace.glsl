#version 300 es
precision highp float;

#define BOUNCES 5

#include "../lib/ray.glsl"
#include "../lib/intersect.glsl"
#include "../lib/light.glsl"

uniform vec3 eye;
uniform int on;
uniform int ln;
uniform sampler2D tex;
uniform sampler2D objects;
uniform sampler2D lights;

in vec3 rayd;
out vec4 out_color;

void main() {
    Ray ray = Ray(eye,rayd);

    vec3 color = BLACK;
    float refc = 1.0;

    for(int depth=0;depth<BOUNCES;depth++){
        Intersect ins = intersectObjects(objects,on,ray);

        if(ins.d==MAX_DISTANCE) break;

        Material material = queryMaterial(ins.material,ins.hit);
        vec3 rd = reflect(ray.dir,ins.normal);

        for(int i=0;i<ln;i++){
            Light light = parseLight(lights,float(i)/float(ln-1));
            if(!testShadow(objects,on,light,ins.hit))
                color+=refc*calcolor(material,light,ins,rd);
        }

        refc*=material.reflect;
        ray = Ray(ray.origin+ins.d*ray.dir,rd);
    }
    out_color = vec4(color,1);
}