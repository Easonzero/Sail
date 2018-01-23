in vec2 texCoord;
out vec4 color;

void main() {
    color = pixelFilter(texCoord);
}