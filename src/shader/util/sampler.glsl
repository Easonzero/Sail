vec3 uniformlyRandomDirection( float seed ){
	float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );
	float angle = 2.0 * PI * v;
	return vec3( r * cos( angle ), r * sin( angle ), z );
}

vec3 uniformlyRandomVector( float seed ){
	return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));
}

vec3 cosWeightHemisphere(float seed){
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float r = sqrt(u);
	float angle = 2.0 * PI * v;

	return vec3(r*cos(angle),r*sin(angle),sqrt(1.-u));
}

vec3 cosWeightHemisphere2(float seed){
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float angle = 2.0 * PI * v;

	return vec3(u*cos(angle),u*sin(angle),cos(asin(u)));
}

vec2 UniformSampleDisk(float seed) {
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
    float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
    float r = sqrt(u);
    float theta = 2.0 * PI * v;
    return vec2(r * cos(theta), r * sin(theta));
}

vec2 ConcentricSampleDisk(float seed){
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
    float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
    float uOffset = 2.0 * u - 1.0;
    float vOffset = 2.0 * v - 1.0;

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

vec3 UniformSampleCone(float seed, float cosThetaMax) {
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
    float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
    float cosTheta = (1.0 - u) + u * cosThetaMax;
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    float phi = v * 2.0 * PI;
    return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta,
                    cosTheta);
}

vec2 UniformSampleTriangle(float seed) {
    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
    float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );

    float su0 = sqrt(u);
    return vec2(1.0 - su0, v * su0);
}