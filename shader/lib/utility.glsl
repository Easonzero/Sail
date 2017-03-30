vec3 ensure3byW(vec4 vec){
    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);
}
