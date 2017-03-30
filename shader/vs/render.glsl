attribute vec3 vertex;
varying vec2 texCoord;

void main() {
    texCoord = vertex.xy * 0.5 + 0.5;
    gl_Position = vec4(vertex, 1.0);
}