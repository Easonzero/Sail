struct Fresnel{
    int type;
    vec3 etaI;
    vec3 etaT;
    vec3 k;
};

Fresnel createFresnelD(float etaI,float etaT){
    Fresnel fresnel;
    fresnel.etaI = vec3(etaI);
    fresnel.etaT = vec3(etaT);
    fresnel.type = DIELECTRIC;
    return fresnel;
}

Fresnel createFresnelC(vec3 etaI,vec3 etaT,vec3 k){
    Fresnel fresnel;
    fresnel.etaI = etaI;
    fresnel.etaT = etaT;
    fresnel.k = k;
    fresnel.type = CONDUCTOR;
    return fresnel;
}

Fresnel createFresnelN(){
    Fresnel fresnel;
    fresnel.type = NOOP;
    return fresnel;
}

float frDielectric(float cosThetaI, float etaI, float etaT) {
    cosThetaI = clamp(cosThetaI, -1.0, 1.0);

    float sinThetaI = sqrt(max(0.0, 1.0 - cosThetaI * cosThetaI));
    float sinThetaT = etaI / etaT * sinThetaI;

    if (sinThetaT >= 1.0) return 1.0;
    float cosThetaT = sqrt(max(0.0, 1.0 - sinThetaT * sinThetaT));
    float TI = etaT * cosThetaI,IT = etaI * cosThetaT,
        II = etaI * cosThetaI, TT = etaT * cosThetaT;
    float Rparl = (TI - IT) /
                  (TI + IT);
    float Rperp = (II - TT) /
                  (II + TT);
    return (Rparl * Rparl + Rperp * Rperp) / 2.0;
}

vec3 frConductor(float cosThetaI, vec3 etaI, vec3 etaT, vec3 k) {
    cosThetaI = clamp(cosThetaI, -1.0, 1.0);
    vec3 eta = etaT / etaI;
    vec3 etak = k / etaI;

    float cosThetaI2 = cosThetaI * cosThetaI;
    float sinThetaI2 = 1.0 - cosThetaI2;
    vec3 eta2 = eta * eta;
    vec3 etak2 = etak * etak;

    vec3 t0 = eta2 - etak2 - sinThetaI2;
    vec3 a2plusb2 = sqrt(t0 * t0 + 4.0 * eta2 * etak2);
    vec3 t1 = a2plusb2 + cosThetaI2;
    vec3 a = sqrt(0.5 * (a2plusb2 + t0));
    vec3 t2 = 2.0 * cosThetaI * a;
    vec3 Rs = (t1 - t2) / (t1 + t2);

    vec3 t3 = cosThetaI2 * a2plusb2 + sinThetaI2 * sinThetaI2;
    vec3 t4 = t2 * sinThetaI2;
    vec3 Rp = Rs * (t3 - t4) / (t3 + t4);

    return 0.5 * (Rp + Rs);
}

vec3 frEvaluate(Fresnel f,float cosThetaI){
    if(f.type==DIELECTRIC) return WHITE*frDielectric(cosThetaI,f.etaI.x,f.etaT.x);
    else if(f.type==CONDUCTOR) return frConductor(cosThetaI,f.etaI,f.etaT,f.k);

    return WHITE;
}