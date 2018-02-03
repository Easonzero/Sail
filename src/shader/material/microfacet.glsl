struct MicrofacetDistribution{
    float alphax;
    float alphay;
    int type;
};

vec3 beckmann_sample_wh(vec2 u,float alphax,float alphay,vec3 wo){
    float tan2Theta, phi;
    float logSample = log(u.x);
    if (logSample>=INF) logSample = 0.0;
    if (equalZero(alphax - alphay)) {
        tan2Theta = -alphax * alphax * logSample;
        phi = u.x * 2.0 * PI;
    } else {
        phi = atan(alphay / alphax * tan(2.0 * PI * u.x + 0.5 * PI));
        if (u.x > 0.5) phi += PI;
        float sinPhi = sin(phi), cosPhi = cos(phi);
        float alphax2 = alphax * alphax, alphay2 = alphay * alphay;
        tan2Theta = -logSample / (cosPhi * cosPhi / alphax2 + sinPhi * sinPhi / alphay2);
    }
    
    float cosTheta = 1.0 / sqrt(1.0 + tan2Theta);
    float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));
    vec3 wh = sphericalDirection(sinTheta, cosTheta, phi);
    if (!sameHemisphere(wo, wh)) wh = -wh;
    return wh;
}

float beckmann_d(float alphax, float alphay, vec3 wh){
    float tan2Theta = tan2Theta(wh);
    if (tan2Theta>=INF) return 0.001;
    float cos4Theta = cos2Theta(wh) * cos2Theta(wh);
    return exp(-tan2Theta * (cos2Phi(wh) / (alphax * alphax) + sin2Phi(wh) / (alphay * alphay))) /
           (PI * alphax * alphay * cos4Theta);
}

float beckmann_pdf(float alphax, float alphay, vec3 wo,vec3 wh){
    return beckmann_d(alphax,alphay,wh) * absCosTheta(wh);
}

vec3 trowbridgeReitz_sample_wh(vec2 u, float alphax, float alphay, vec3 wo){
    float cosTheta = 0.0, phi = 2.0 * PI * u.x;
    if (alphax == alphay) {
        float tanTheta2 = alphax * alphax * u.x / (1.0 - u.x);
        cosTheta = 1.0 / sqrt(1.0 + tanTheta2);
    } else {
        phi = atan(alphay / alphax * tan(PIOVER2 + 2.0 * PI * u.x));
        if (u.x > 0.5) phi += PI;
        float sinPhi = sin(phi), cosPhi = cos(phi);
        float alphax2 = alphax * alphax, alphay2 = alphay * alphay;
        float alpha2 = 1.0 / (cosPhi * cosPhi / alphax2 + sinPhi * sinPhi / alphay2);
        float tanTheta2 = alpha2 * u.x / (1.0 - u.x);
        cosTheta = 1.0 / sqrt(1.0 + tanTheta2);
    }
    float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));
    vec3 wh = sphericalDirection(sinTheta, cosTheta, phi);
    if (!sameHemisphere(wo, wh)) wh = -wh;
    return wh;
}

float trowbridgeReitz_d(float alphax, float alphay, vec3 wh){
    float tan2Theta = tan2Theta(wh);
    if (tan2Theta>=INF) return 0.001;
    float cos4Theta = cos2Theta(wh) * cos2Theta(wh);
    float e = (cos2Phi(wh) / (alphax * alphax) + sin2Phi(wh) / (alphay * alphay)) * tan2Theta;
    return 1.0 / (PI * alphax * alphay * cos4Theta * (1.0 + e) * (1.0 + e));
}

float trowbridgeReitz_pdf(float alphax, float alphay, vec3 wo,vec3 wh){
    return trowbridgeReitz_d(alphax, alphay, wh) * absCosTheta(wh);
}

vec3 microfacet_sample_wh(MicrofacetDistribution md,vec2 u,vec3 wo){
    if(md.type==BECKMANN) return beckmann_sample_wh(u,md.alphax,md.alphay,wo);
    else if(md.type==TROWBRIDGEREITZ) return trowbridgeReitz_sample_wh(u,md.alphax,md.alphay,wo);

    return BLACK;
}

float microfacet_d(MicrofacetDistribution md,vec3 wh){
    if(md.type==BECKMANN) return beckmann_d(md.alphax,md.alphay,wh);
    else if(md.type==TROWBRIDGEREITZ) return trowbridgeReitz_d(md.alphax,md.alphay,wh);

    return 0.0;
}

float microfacet_pdf(MicrofacetDistribution md,vec3 wo,vec3 wh){
    if(md.type==BECKMANN) return beckmann_pdf(md.alphax,md.alphay,wo,wh);
    else if(md.type==TROWBRIDGEREITZ) return trowbridgeReitz_pdf(md.alphax,md.alphay,wo,wh);

    return 0.0;
}