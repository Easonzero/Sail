void mix_attr(float texIndex,out vec3 color1,out vec3 color2,out float amount){
    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
    amount = readVec3(texParams,vec2(7.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 mix(vec3 hit,vec2 uv,float texIndex){
    vec3 color1,color2;
    float amount;
    mix_attr(texIndex,color1,color2,amount);

    return (1.0 - amount) * color1 + amount * color2;
}
