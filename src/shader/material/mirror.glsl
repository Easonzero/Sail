void mirror_attr(float matIndex,out float kr){
    kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 mirror(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){
    vec3 f;
    float pdf;

    float kr;
    mirror_attr(matIndex,kr);

    SpecularR sr = SpecularR(kr*sc,createFresnelN());

    f = specular_r_sample_f(sr,u,wo,wi,pdf);

    return f * absCosTheta(wi)/pdf;
}

vec3 mirror_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){
    float kr;
    mirror_attr(matIndex,kr);

    SpecularR sr = SpecularR(kr*sc,createFresnelN());

    return specular_r_f(sr,wo,wi);
}