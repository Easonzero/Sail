vec3 ensure3byW(vec4 vec){
    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);
}

float modMatrix(mat3 mat){
    return dot(cross(mat[0],mat[1]),mat[2]);
}

vec3 ortho(vec3 d) {
	if (abs(d.x)>0.00001 || abs(d.y)>0.00001) {
		return vec3(d.y,-d.x,0.0);
	} else  {
		return vec3(0.0,d.z,-d.y);
	}
}

float maxComponent(vec3 v){
    return max(max(v.x,v.y),v.z);
}

void swap(inout float f1,inout float f2){
    float tmp = f1;
    f1 = f2;
    f2 = tmp;
}

float frDielectric(float cosThetaI, float etaI, float etaT) {
    cosThetaI = clamp(cosThetaI, -1.0, 1.0);
    bool entering = cosThetaI > 0.0;
    if (!entering) {
        swap(etaI, etaT);
        cosThetaI = abs(cosThetaI);
    }

    float sinThetaI = sqrt(max(0.0, 1.0 - cosThetaI * cosThetaI));
    float sinThetaT = etaI / etaT * sinThetaI;

    if (sinThetaT >= 1.0) return 1.0;
    float cosThetaT = sqrt(max(0.0, 1.0 - sinThetaT * sinThetaT));
    float Rparl = ((etaT * cosThetaI) - (etaI * cosThetaT)) /
                  ((etaT * cosThetaI) + (etaI * cosThetaT));
    float Rperp = ((etaI * cosThetaI) - (etaT * cosThetaT)) /
                  ((etaI * cosThetaI) + (etaT * cosThetaT));
    return (Rparl * Rparl + Rperp * Rperp) / 2.0;
}

vec3 frConductor(float cosThetaI, const vec3 etai,
                     const vec3 etat, const vec3 k){
    cosThetaI = clamp(cosThetaI, -1.0, 1.0);
    vec3 eta = etat / etai;
    vec3 etak = k / etai;

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