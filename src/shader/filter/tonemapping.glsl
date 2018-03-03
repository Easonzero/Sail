vec3 tonemapping(vec3 color) {
    vec3 x = max(vec3(0.0), color - 0.004);
    return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = texture(colorMap, texCoord).rgb;
    return vec4(tonemapping(color),1.0);
}