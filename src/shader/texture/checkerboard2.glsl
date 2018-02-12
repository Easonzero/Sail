void checkerboard2_attr(float texIndex,out vec3 color1,out vec3 color2,out float size){
    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
    size = readFloat(texParams,vec2(7.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 checkerboard2(vec3 hit,vec2 uv,float texIndex){
    vec3 color1,color2;
    float size;
    checkerboard2_attr(texIndex,color1,color2,size);

    uv = vec2(floor(uv.x/size),floor(uv.y/size));

    if(int(uv.x+uv.y)%2==0) return color1;
    return color2;
}