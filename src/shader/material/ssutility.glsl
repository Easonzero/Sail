float cosTheta(const vec3 w) { return w.z; }
float cos2Theta(const vec3 w) { return w.z * w.z; }
float absCosTheta(const vec3 w) { return abs(w.z); }
float sin2Theta(const vec3 w) {
    return max(0.0, 1.0 - cos2Theta(w));
}

float sinTheta(const vec3 w) { return sqrt(sin2Theta(w)); }

float tanTheta(const vec3 w) {
    float cosT = cosTheta(w);
    if(equalZero(cosT)) return INF;
    return sinTheta(w) / cosT;
}

float tan2Theta(const vec3 w) {
    float cos2T = cos2Theta(w);
    if(cos2T<EPSILON) return INF;
    return sin2Theta(w) / cos2T;
}

float cosPhi(const vec3 w) {
    float sinTheta = sinTheta(w);
    return (equalZero(sinTheta)) ? 1.0 : clamp(w.x / sinTheta, -1.0, 1.0);
}

float sinPhi(const vec3 w) {
    float sinTheta = sinTheta(w);
    return (equalZero(sinTheta)) ? 0.0 : clamp(w.y / sinTheta, -1.0, 1.0);
}

float cos2Phi(const vec3 w) { return cosPhi(w) * cosPhi(w); }

float sin2Phi(const vec3 w) { return sinPhi(w) * sinPhi(w); }

float cosDPhi(const vec3 wa, const vec3 wb) {
    return clamp(
        (wa.x * wb.x + wa.y * wb.y) /
        sqrt((wa.x * wa.x + wa.y * wa.y) * (wb.x * wb.x + wb.y * wb.y)),
        -1.0, 1.0);
}

bool sameHemisphere(const vec3 w, const vec3 wp) {
    return w.z * wp.z > EPSILON;
}