void glass_attr(float matIndex,out float kr,out float kt,
                out float eta,out float uroughness,out float vroughness){
    kr= readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);
    kt = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);
    eta = readFloat(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);
    uroughness = readFloat(texParams,vec2(4.0,matIndex),TEX_PARAMS_LENGTH);
    vroughness = readFloat(texParams,vec2(5.0,matIndex),TEX_PARAMS_LENGTH);
}

vec3 glass(vec2 u,float matIndex,vec3 sc,vec3 wo,out vec3 wi,bool into){
    vec3 f;
    float pdf;

    float kr,kt,eta,uroughness,vroughness;
    glass_attr(matIndex,kr,kt,eta,uroughness,vroughness);

    bool isSpecular = uroughness < EPSILON&&vroughness < EPSILON;
    if(isSpecular){
        SpecularFr sf = SpecularFr(kr*sc,kt*sc,1.0,eta,into);
        f = specular_fr_sample_f(sf,u,wo,wi,pdf);
    }else{
        MicrofacetDistribution md = MicrofacetDistribution(uroughness,vroughness,TROWBRIDGEREITZ);
        float p = u.x;
        u.x = min(u.x * 2.0 - 1.0, ONEMINUSEPSILON);
        if(p<0.5){
            Fresnel fresnel = createFresnelD(1.0,eta);
            MicrofacetR mr = MicrofacetR(kr*sc,fresnel,md);
            f = microfacet_r_sample_f(mr,u,wo,wi,pdf);
        }else{
            MicrofacetT mt = MicrofacetT(kt*sc,1.0,eta,into,md);
            f = microfacet_t_sample_f(mt,u,wo,wi,pdf);
        }
    }

    return f * absCosTheta(wi)/pdf;
}

vec3 glass_f(float matIndex,vec3 sc,vec3 wo,vec3 wi,bool into){

    float kr,kt,eta,uroughness,vroughness;
    glass_attr(matIndex,kr,kt,eta,uroughness,vroughness);

    bool isSpecular = vroughness == 0.0 && uroughness == 0.0;
    if(isSpecular){
        SpecularFr sf = SpecularFr(kr*sc,kt*sc,1.0,eta,into);
        return specular_fr_f(sf,wo,wi);
    }else{
        MicrofacetDistribution md = MicrofacetDistribution(uroughness,vroughness,TROWBRIDGEREITZ);
        if(sameHemisphere(wo,wi)){
            Fresnel fresnel = createFresnelD(1.0,eta);
            MicrofacetR mr = MicrofacetR(kr*sc,fresnel,md);
            return microfacet_r_f(mr,wo,wi);
        }else{
            MicrofacetT mt = MicrofacetT(kt*sc,1.0,eta,into,md);
            return microfacet_t_f(mt,wo,wi);
        }
    }
}