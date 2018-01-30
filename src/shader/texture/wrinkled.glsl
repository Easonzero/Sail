void wrinkled_attr(float texIndex,out int octaves,out float omega){
    octaves = readInt(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    omega = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 wrinkled(vec3 hit,vec2 uv,float texIndex){
    int octaves;
    float omega;
    wrinkled_attr(texIndex,octaves,omega);

    return turbulence(hit, omega, octaves) * WHITE;
}