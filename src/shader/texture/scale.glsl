void scale_attr(float texIndex,out vec3 color1,out vec3 color2){
    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 scale(vec3 hit,vec2 uv,float texIndex){
    vec3 color1,color2;
    mix_attr(texIndex,color1,color2);

    return color1 * color2;
}
