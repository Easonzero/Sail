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

bool readBool(sampler2D tex,vec2 pos,float width){
    return readInt(tex,pos,width)==1;
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