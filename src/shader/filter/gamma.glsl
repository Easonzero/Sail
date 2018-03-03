vec3 gamma(vec3 v) {
  return pow(v, vec3(1.0 / FILTER_GAMMA_C));
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = texture(colorMap, texCoord).rgb;
    return vec4(gamma(color),1.0);
}