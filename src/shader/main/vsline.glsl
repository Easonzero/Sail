in vec3 vertex;

void main() {
    gl_Position = modelviewProjection * vec4(mix(cubeMin, cubeMax, vertex), 1.0);
}