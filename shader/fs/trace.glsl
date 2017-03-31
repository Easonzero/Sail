#include "../lib/face.glsl"
#include "../lib/ray.glsl"

precision highp float;
varying vec3 ray;
uniform sampler2D texture;
uniform sampler2D vecs;

void main() {
    gl_FragColor = vec4(mix(vec3(1,1,1),ray,0.99), 1.0);
}