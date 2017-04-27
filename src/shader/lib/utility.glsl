vec3 ensure3byW(vec4 vec){
    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);
}

float modMatrix(mat3 mat){
    return dot(cross(mat[0],mat[1]),mat[2]);
}

float fresnel(float thetai,float thetat,float lamda){
    float r1 = (lamda*cos(thetai)-cos(thetat))/(lamda*cos(thetai)+cos(thetat));
    float r2 = (cos(thetai)-lamda*cos(thetat))/(cos(thetai)+lamda*cos(thetat));
    return (r1*r1+r2*r2)/2.0;
}