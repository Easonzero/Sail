void bilerp_attr(float texIndex,out vec3 color00,out vec3 color01,out vec3 color10,out vec3 colory11){
    color00 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    color01 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
    color10 = readVec3(texParams,vec2(7.0,texIndex),TEX_PARAMS_LENGTH);
    color11 = readVec3(texParams,vec2(10.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 bilerp(vec3 hit,vec2 uv,float texIndex){
    vec3 color00,color01,color10,colory11;
    bilerp_attr(texIndex,color00,color01,color10,colory11);

    return (1.0 - uv.x) * (1.0 - uv.y) * color00 + (1.0 - uv.x) * (uv.y) * color01 +
                   (uv.x) * (1.0 - uv.y) * color10 + (uv.x) * (uv.y) * colory11;
}