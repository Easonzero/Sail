vec2 convert(vec2 pos,float width){
    pos.x = pos.x/width;
    return pos;
}

int readInt(sampler2D tex,vec2 pos,float width){
    return int(texture(tex,convert(pos,width)).r);
}

float readFloat(sampler2D tex,vec2 pos,float width){
    return texture(tex,convert(pos,width)).r;
}

vec2 readVec2(sampler2D tex,vec2 pos,float width){
    vec2 result;
    pos = convert(pos,width);
    result.x = texture(tex,pos).r;
    pos.x += 1.0/width;
    result.y = texture(tex,pos).r;
    return result;
}

vec3 readVec3(sampler2D tex,vec2 pos,float width){
    vec3 result;
    pos = convert(pos,width);
    result.x = texture(tex,pos).r;
    pos.x += 1.0/width;
    result.y = texture(tex,pos).r;
    pos.x += 1.0/width;
    result.z = texture(tex,pos).r;
    return result;
}

vec3 readTexture(sampler2D tex,vec2 pos){
    float index = readFloat(texParams,pos,TEX_PARAMS_LENGTH)/float(pn-1);
    vec2 tv = readVec2(pCache,vec2(0.0,index),PCACHE_LENGTH);
    return texture(tex,tv).rgb;
}

vec3 readCacheVec3(vec2 pos){
    float index = readFloat(texParams,pos,TEX_PARAMS_LENGTH)/float(pn-1);
    return readVec3(pCache,vec2(0.0,index),PCACHE_LENGTH);
}