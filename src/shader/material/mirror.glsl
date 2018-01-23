void mirror_attr(float matIndex,out Reflective r){
    r.kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 mirror(float seed,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){
    vec3 f;
    float pdf;

    Reflective specular_brdf;
    mirror_attr(matIndex,specular_brdf);
    specular_brdf.cr = sc;

    f = reflective_sample_f(specular_brdf,seed,wi,wo,pdf);

    return f/pdf;
}

vec3 mirror_f(float matIndex,vec3 sc,vec3 wo,vec3 wi){
    return BLACK;
}