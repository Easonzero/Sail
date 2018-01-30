void dots_attr(float texIndex,out vec3 inside,out vec3 outside){
    inside = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    outside = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 dots(vec3 hit,vec2 uv,float texIndex){
    vec3 inside,outside;
    dots_attr(texIndex,inside,outside);

    int sCell = floor(uv.x + 0.5), tCell = floor(uv.y + 0.5);
    
    if (Noise(sCell + .5f, tCell + .5f) > 0) {
        float radius = 0.35;
        float maxShift = 0.5 - radius;
        float sCenter = sCell + maxShift * noise(sCell + 1.5, tCell + 2.8);
        float tCenter = tCell + maxShift * noise(sCell + 4.5, tCell + 9.8);
        vec2 dst = uv - vec2(sCenter, tCenter);
        if (dst.x*dst.x+dst.y*dst.y < radius * radius)
            return inside;
        }
        return outside;
}