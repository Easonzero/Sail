float gamma(float x) {
    return pow(clamp(x,0.0,1.0), 1.0/FILTER_GAMMA_C) + 0.0022222222222222;
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = texture(colorMap, texCoord).rgb;
    return vec4(gamma(color.r),gamma(color.g),gamma(color.b),1.0);
}