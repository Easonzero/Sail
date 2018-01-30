vec3 c[9] = {
    vec3(0.58, 0.58, 0.6), vec3(0.58, 0.58, 0.6), vec3(0.58, 0.58, 0.6),
    vec3(0.5, 0.5, 0.5),   vec3(0.6, 0.59, 0.58), vec3(0.58, 0.58, 0.6),
    vec3(0.58, 0.58, 0.6), vec3(0.2, 0.2, 0.33), vec3(0.58, 0.58, 0.6)
};

void marble_attr(float texIndex,out int octaves,out float omega,out float scale,out float variation){
    octaves = readInt(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    omega = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);
    scale = readFloat(texParams,vec2(3.0,texIndex),TEX_PARAMS_LENGTH);
    variation = readFloat(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 marble(vec3 hit,vec2 uv,float texIndex){
    int octaves;
    float omega,scale,variation;
    marble_attr(texIndex,octaves,omega,scale,variation);
    hit *= scale;
    float marble = hit.y + variation * fbm(hit, omega, octaves);
    float t = 0.5 + 0.5 * sin(marble);
    int nc = 9,nseg = nc-3;
    int first = floor(t * nseg);
    t = (t * nseg - first);
    vec3 c0 = c[first];
    vec3 c1 = c[first + 1];
    vec3 c2 = c[first + 2];
    vec3 c3 = c[first + 3];
    vec3 s0 = (1.f - t) * c0 + t * c1;
    vec3 s1 = (1.f - t) * c1 + t * c2;
    vec3 s2 = (1.f - t) * c2 + t * c3;
    s0 = (1.f - t) * s0 + t * s1;
    s1 = (1.f - t) * s1 + t * s2;
    return 1.5f * ((1.f - t) * s0 + t * s1);
}