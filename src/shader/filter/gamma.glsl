float gamma(float x) {
    return pow(clamp(x,0.0,1.0), 1.0/2.2) + 0.5/255.0;
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = texture(tex, texCoord).rgb;
    return vec4(gamma(color.r),gamma(color.g),gamma(color.b),1.0);
}