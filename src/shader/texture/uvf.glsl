vec3 uvf(vec3 hit,vec2 uv,float texIndex){
    return vec3(uv.x-floor(uv.x),uv.y-floor(uv.y),0);
}
