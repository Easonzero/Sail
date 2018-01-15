#version 300 es

#include "../util/utility.glsl"

in vec3 vertex;
uniform vec3 eye;
uniform mat4 matrix;
out vec3 raydir;

void main() {
    gl_Position = vec4(vertex, 1.0);
    raydir = normalize(ensure3byW(matrix*gl_Position)-eye);
}