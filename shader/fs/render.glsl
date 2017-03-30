precision highp float;
varying vec2 texCoord;
uniform sampler2D texture;

void main() {
    gl_FragColor = texture2D(texture, texCoord);
}