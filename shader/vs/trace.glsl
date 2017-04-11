#include "../lib/utility.glsl"
#include "../lib/ray.glsl"

attribute vec3 vertex;
uniform vec3 eye;
uniform vec3 test;
uniform mat4 matrix;
varying vec3 rayd;

void main() {
    gl_Position = vec4(vertex, 1.0);
    rayd = normalize(ensure3byW(matrix*gl_Position)-eye);
}