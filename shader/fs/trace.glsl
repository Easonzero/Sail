precision highp float;
varying vec3 light;
uniform sampler2D texture;
uniform sampler2D vecs;

void main() {
    gl_FragColor = vec4(mix(vec3(1,1,1),light,0.99), 1.0);
}