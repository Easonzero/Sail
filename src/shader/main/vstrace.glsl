in vec3 vertex;
out vec3 raydir;

void main() {
    gl_Position = vec4(vertex, 1.0);
    raydir = normalize(ensure3byW(matrix*gl_Position)-eye);
}