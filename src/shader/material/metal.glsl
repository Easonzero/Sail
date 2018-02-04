void metal_attr(float matIndex,out float uroughness,out float vroughness,out vec3 eta,out vec3 k){
    uroughness = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
    vroughness = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);
    eta = readVec3(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);
    k = readVec3(texParams,vec2(6.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 metal(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){
    vec3 f;
    float pdf;

    float uroughness,vroughness;
    vec3 eta,k;
    metal_attr(matIndex,uroughness,vroughness,eta,k);

    MicrofacetDistribution md = MicrofacetDistribution(uroughness,vroughness,TROWBRIDGEREITZ);
    Fresnel fresnel = createFresnelC(WHITE,eta,k);
    MicrofacetR mr = MicrofacetR(sc,fresnel,md);
    f = microfacet_r_sample_f(mr,u,wo,wi,pdf);

    return f * absCosTheta(wi)/pdf;
}

vec3 metal_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){
    float uroughness,vroughness;
    vec3 eta,k;
    metal_attr(matIndex,uroughness,vroughness,eta,k);

    MicrofacetDistribution md = MicrofacetDistribution(uroughness,vroughness,TROWBRIDGEREITZ);
    Fresnel fresnel = createFresnelC(WHITE,eta,k);
    MicrofacetR mr = MicrofacetR(sc,fresnel,md);

    return microfacet_r_f(mr,wo,wi);
}