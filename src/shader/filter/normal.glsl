vec4 pixelFilter(vec2 texCoord){
    vec3 color = texture(normalMap, texCoord).rgb;
    return vec4(color,1.0);
}