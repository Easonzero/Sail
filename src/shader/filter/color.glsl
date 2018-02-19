vec4 pixelFilter(vec2 texCoord){
    vec3 color = texture(colorMap, texCoord).rgb;
    return vec4(color,1.0);
}