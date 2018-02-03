void matte_attr(float matIndex,out float kd,out float sigma,out float A,out float B){
    kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
    sigma = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);
    A = readFloat(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);
    B = readFloat(texParams,vec2(4.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 matte(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){
    vec3 f;
    float pdf;

    float kd,sigma,A,B;
    matte_attr(matIndex,kd,sigma,A,B);

    if(sigma<EPSILON){
        LambertianR diffuseR = LambertianR(kd*sc);
        f = lambertian_r_sample_f(diffuseR,u,wo,wi,pdf);
    }else{
        OrenNayar diffuseR = OrenNayar(kd*sc,A,B);
        f = orenNayar_sample_f(diffuseR,u,wo,wi,pdf);
    }

    return f * absCosTheta(wi)/pdf;
}

vec3 matte_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){
    float kd,sigma,A,B;
    matte_attr(matIndex,kd,sigma,A,B);

    if(sigma<EPSILON){
        LambertianR diffuseR = LambertianR(kd*sc);
        return lambertian_r_f(diffuseR,wo,wi);
    }else{
        OrenNayar diffuseR = OrenNayar(kd*sc,A,B);
        return orenNayar_f(diffuseR,wo,wi);
    }
}