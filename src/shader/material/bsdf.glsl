//diffuse

struct LambertianR{
    vec3 R;
};

vec3 lambertian_r_f(LambertianR lr, vec3 wo, vec3 wi){
    return lr.R * INVPI;
}

float lambertian_r_pdf(LambertianR lr, vec3 wo, vec3 wi){
    return sameHemisphere(wo, wi) ? absCosTheta(wi) * INVPI : 0.0;
}

vec3 lambertian_r_sample_f(LambertianR lr, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    wi = cosineSampleHemisphere(u);
    pdf = lambertian_r_pdf(lr, wo, wi);
    return lambertian_r_f(lr,wo, wi);
}

struct LambertianT{
    vec3 T;
};

vec3 lambertian_t_f(LambertianT lt, vec3 wo, vec3 wi){
    return lt.T * INVPI;
}

float lambertian_t_pdf(LambertianT lt, vec3 wo, vec3 wi){
    return !sameHemisphere(wo, wi) ? absCosTheta(wi) * INVPI : 0.0;
}

vec3 lambertian_t_sample_f(LambertianT lt, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    wi = cosineSampleHemisphere(u);
    wi.z *= -1.0;
    pdf = lambertian_t_pdf(lt, wo, wi);
    return lambertian_t_f(lt,wo, wi);
}

struct OrenNayar{
    vec3 R;
    float A,B;
};

vec3 orenNayar_f(OrenNayar on, vec3 wo, vec3 wi){
    float sinThetaI = sinTheta(wi);
    float sinThetaO = sinTheta(wo);

    float maxCos = 0.0;
    if (sinThetaI > EPSILON && sinThetaO > EPSILON) {
        float sinPhiI = sinPhi(wi), cosPhiI = cosPhi(wi);
        float sinPhiO = sinPhi(wo), cosPhiO = cosPhi(wo);
        float dCos = cosPhiI * cosPhiO + sinPhiI * sinPhiO;
        maxCos = max(0.0, dCos);
    }

    float sinAlpha, tanBeta;
    if (absCosTheta(wi) > absCosTheta(wo)) {
        sinAlpha = sinThetaO;
        tanBeta = sinThetaI / absCosTheta(wi);
    } else {
        sinAlpha = sinThetaI;
        tanBeta = sinThetaO / absCosTheta(wo);
    }
    return on.R * INVPI * (on.A + on.B * maxCos * sinAlpha * tanBeta);
}

float orenNayar_pdf(OrenNayar on, vec3 wo, vec3 wi){
    return sameHemisphere(wo, wi) ? absCosTheta(wi) * INVPI : 0.0;
}

vec3 orenNayar_sample_f(OrenNayar on, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    wi = cosineSampleHemisphere(u);
    pdf = orenNayar_pdf(on, wo, wi);
    return orenNayar_f(on,wo, wi);
}

//specular

struct SpecularR{
    vec3 R;
    Fresnel f;
};

vec3 specular_r_f(SpecularR sr, vec3 wo, vec3 wi){
    return BLACK;
}

float specular_r_pdf(SpecularR sr, vec3 wo, vec3 wi){
    return 0.0;
}

vec3 specular_r_sample_f(SpecularR sr, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    wi = vec3(-wo.x, -wo.y, wo.z);
    pdf = 1.0;

    return frEvaluate(sr.f,cosTheta(wi)) * sr.R / absCosTheta(wi);
}

struct SpecularT{
    vec3 T;
    float etaA, etaB;
    bool into;
};

vec3 specular_t_f(SpecularT st, vec3 wo, vec3 wi){
    return BLACK;
}

float specular_t_pdf(SpecularT st, vec3 wo, vec3 wi){
    return 0.0;
}

vec3 specular_t_sample_f(SpecularT st, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    float etaI = st.into ? st.etaA : st.etaB;
    float etaT = st.into ? st.etaB : st.etaA;

    wi = refract(-wo,vec3(0,0,1),etaI / etaT);

    pdf = 1.0;
    vec3 ft = st.T * (WHITE - frDielectric(cosTheta(wi),st.etaA,st.etaB));

    return ft / absCosTheta(wi);
}

struct SpecularFr{
    vec3 R;
    vec3 T;
    float etaA, etaB;
    bool into;
};

vec3 specular_fr_f(SpecularFr sf, vec3 wo, vec3 wi){
    return BLACK;
}

float specular_fr_pdf(SpecularFr sf, vec3 wo, vec3 wi){
    return 0.0;
}

vec3 specular_fr_sample_f(SpecularFr sf, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    float F = frDielectric(cosTheta(wo), sf.etaA, sf.etaB);
    if (u.x < F) {
        wi = vec3(-wo.x, -wo.y, wo.z);
        pdf = 1.0;
        return  sf.R / absCosTheta(wi);
    }else{
        float etaI = sf.into ? sf.etaA : sf.etaB;
        float etaT = sf.into ? sf.etaB : sf.etaA;

        wi = refract(-wo,vec3(0,0,1),etaI / etaT);

        vec3 ft = sf.T * (1.0 - F);

        pdf = 1.0;
        return ft / absCosTheta(wi);
    }
}

//glossy

struct MicrofacetR{
    vec3 R;
    Fresnel f;
    MicrofacetDistribution md;
};

vec3 microfacet_r_f(MicrofacetR mr, vec3 wo, vec3 wi){
    float cosThetaO = absCosTheta(wo), cosThetaI = absCosTheta(wi);
    vec3 wh = wi + wo;

    if (cosThetaI < EPSILON || cosThetaO < EPSILON) return BLACK * 0.001;
    if (equalZero(wh.x) && equalZero(wh.y) && equalZero(wh.z)) return BLACK * 0.001;

    wh = normalize(wh);
    vec3 F = frEvaluate(mr.f,dot(wi, wh));
    return mr.R * microfacet_d(mr.md,wh) * F / (4.0 * cosThetaI * cosThetaO);
}

float microfacet_r_pdf(MicrofacetR mr, vec3 wo, vec3 wi){
    if (!sameHemisphere(wo, wi)) return 0.001;
    vec3 wh = normalize(wo + wi);
    return microfacet_pdf(mr.md, wo, wh) / (4.0 * dot(wo, wh));
}

vec3 microfacet_r_sample_f(MicrofacetR mr, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    if (wo.z < EPSILON) return BLACK * 0.001;
    vec3 wh = microfacet_sample_wh(mr.md,u,wo);
    wi = reflect(-wo, wh);
    if (!sameHemisphere(wo, wi)) return BLACK * 0.001;

    float dotoh = dot(wo,wh);
    pdf = microfacet_pdf(mr.md, wo, wh) / (4.0 * dot(wo,wh));

    return microfacet_r_f(mr, wo, wi);
}

struct MicrofacetT{
    vec3 T;
    float etaA, etaB;
    bool into;
    MicrofacetDistribution md;
};

vec3 microfacet_t_f(MicrofacetT mt, vec3 wo, vec3 wi){
    if (sameHemisphere(wo, wi)) return BLACK * 0.001;

    float cosThetaO = cosTheta(wo);
    float cosThetaI = cosTheta(wi);
    if (equalZero(cosThetaI) || equalZero(cosThetaO)) return BLACK * 0.001;

    float eta = mt.into ? (mt.etaB / mt.etaA) : (mt.etaA / mt.etaB);
    vec3 wh = normalize(wo + wi * eta);
    if (wh.z < -EPSILON) wh = -wh;

    float F = frDielectric(dot(wo, wh),mt.etaA,mt.etaB);

    float sqrtDenom = dot(wo, wh) + eta * dot(wi, wh);

    return (1.0 - F) * mt.T *
           abs(microfacet_d(mt.md,wh) * eta * eta *
                    abs(dot(wi, wh)) * abs(dot(wo, wh)) /
                    (cosThetaI * cosThetaO * sqrtDenom * sqrtDenom));
}

float microfacet_t_pdf(MicrofacetT mt, vec3 wo, vec3 wi){
    if (sameHemisphere(wo, wi)) return 0.001;

    float eta = mt.into ? (mt.etaB / mt.etaA) : (mt.etaA / mt.etaB);
    vec3 wh = normalize(wo + wi * eta);

    float sqrtDenom = dot(wo, wh) + eta * dot(wi, wh);
    float dwh_dwi = abs((eta * eta * dot(wi, wh)) / (sqrtDenom * sqrtDenom));
    return microfacet_pdf(mt.md, wo, wh) * dwh_dwi;
}

vec3 microfacet_t_sample_f(MicrofacetT mt, vec2 u, vec3 wo, out vec3 wi, out float pdf){
    if (equalZero(wo.z)) return BLACK * 0.001;
    vec3 wh = microfacet_sample_wh(mt.md, u, wo);
    float eta = mt.into ? (mt.etaA / mt.etaB) : (mt.etaB / mt.etaA);
    wi = refract(-wo,wh,eta);
    pdf = microfacet_t_pdf(mt, wo, wi);
    return microfacet_t_f(mt, wo, wi);
}


