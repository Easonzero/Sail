#version 300 es

#include "../util/utility.glsl"
#include "../const/ray.glsl"

in vec3 vertex;
uniform vec3 eye;
uniform vec3 test;
uniform mat4 matrix;
out vec3 rayd;

void main() {
    gl_Position = vec4(vertex, 1.0);
    rayd = normalize(ensure3byW(matrix*gl_Position)-eye);
}