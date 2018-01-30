void checkerboard2_attr(float texIndex,out vec3 color1,out vec3 color2){
    color1 = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    color2 = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 checkerboard2(vec3 hit,vec2 uv,float texIndex){
    vec3 color1,color2;
    checkerboard2_attr(texIndex,color1,color2);
    uv = 10.0*uv;
    uv = vec2(floor(uv.x),floor(uv.y));
    if(int(uv.x+uv.y)%2==0) return color1;

    return color2;
}