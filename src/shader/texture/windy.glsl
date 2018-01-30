vec3 windy(vec3 hit,vec2 uv,float texIndex){
    float windStrength = fbm(0.1 * hit, 0.5, 3);
    float waveHeight = fbm(hit, 0.5, 6);
    return abs(windStrength) * waveHeight;
}
