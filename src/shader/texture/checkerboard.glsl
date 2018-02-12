void checkerboard_attr(float texIndex,out float size,out float lineWidth){
    size = readFloat(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    lineWidth = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 checkerboard(vec3 hit,vec2 uv,float texIndex){
    float size,lineWidth;
    checkerboard_attr(texIndex,size,lineWidth);

    float width = 0.5 * lineWidth / size;
    float fx = uv.x/size-floor(uv.x/size),
          fy = uv.y/size-floor(uv.y/size);
    bool in_outline = (fx<width||fx>1.0-width)||(fy<width||fy>1.0-width);

    if (!in_outline) {
        return WHITE;
    } else {
        return GREY;
    }
}