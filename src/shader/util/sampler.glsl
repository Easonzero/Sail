vec3 uniformlyRandomDirection(vec2 u){
	float z = 1.0 - 2.0 * u.x;   float r = sqrt( 1.0 - z * z );
	float angle = 2.0 * PI * u.y;
	return vec3( r * cos( angle ), r * sin( angle ), z );
}

vec3 cosineSampleHemisphere(vec2 u){
	float r = sqrt(u.x);
	float angle = 2.0 * PI * u.y;

	return vec3(r*cos(angle),r*sin(angle),sqrt(1.-u.x));
}

vec3 cosineSampleHemisphere2(vec2 u){
	float angle = 2.0 * PI * u.y;

	return vec3(u.x*cos(angle),u.x*sin(angle),cos(asin(u.x)));
}

vec2 uniformSampleDisk(vec2 u) {
    float r = sqrt(u.x);
    float theta = 2.0 * PI * u.y;
    return vec2(r * cos(theta), r * sin(theta));
}

vec2 concentricSampleDisk(vec2 u){
    float uOffset = 2.0 * u.x - 1.0;
    float vOffset = 2.0 * u.y - 1.0;

    if (uOffset == 0.0 && vOffset == 0.0) return vec2(0, 0);

    float theta, r;
    if (abs(uOffset) > abs(vOffset)) {
        r = uOffset;
        theta =(vOffset / uOffset) * PIOVER4;
    } else {
        r = vOffset;
        theta = PIOVER2 - (uOffset / vOffset) * PIOVER4;
    }
    return r * vec2(cos(theta), sin(theta));
}

vec3 uniformSampleCone(vec2 u,float cosThetaMax) {
    float cosTheta = (1.0 - u.x) + u.x * cosThetaMax;
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    float phi = u.y * 2.0 * PI;
    return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta,
                    cosTheta);
}

vec2 uniformSampleTriangle(vec2 u) {
    float su0 = sqrt(u.x);
    return vec2(1.0 - su0, u.y * su0);
}