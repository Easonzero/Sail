void matte_attr(float matIndex,out Lambertian l){
    l.kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 matte(float seed,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){
    vec3 f;
    float pdf;

    Lambertian diffuse_brdf;
    matte_attr(matIndex,diffuse_brdf);
    diffuse_brdf.cd = sc;

    f = lambertian_sample_f(diffuse_brdf,seed,wi,wo,pdf);

    return f/pdf;
}

vec3 matte_f(float matIndex,vec3 sc,vec3 wo,vec3 wi){
    Lambertian diffuse_brdf;
    matte_attr(matIndex,diffuse_brdf);
    diffuse_brdf.cd = sc;

    return lambertian_f(diffuse_brdf,wi,wo);
}