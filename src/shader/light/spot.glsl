struct Spot{
  vec3 emission;
  int index;
};

Spot parseSpot(float index){
    Spot spot;
    spot.index = readInt(lights,vec2(1.0,index),LIGHTS_LENGTH);
    spot.emission = readVec3(lights,vec2(2.0,index),LIGHTS_LENGTH);
    return spot;
}

float falloff(vec3 w){
    vec3 wl = normalize(WorldToLight(w));
    float cosTheta = wl.z;
    if (cosTheta < cosTotalWidth) return 0;
    if (cosTheta >= cosFalloffStart) return 1;
    // Compute falloff inside spotlight cone
    Float delta =
        (cosTheta - cosTotalWidth) / (cosFalloffStart - cosTotalWidth);
    return (delta * delta) * (delta * delta);
}

vec3 spot_sample(Spot spot,float seed,vec3 hit,vec3 insNormal){
    vec3 normal,p;
    float pdf,d;
    p = sampleGeometry(random2(seed),spot.index,normal,pdf);
    vec3 toLight = p-hit;
    vec3 normToLight = normalize(toLight);
    if(testShadow(Ray(hit, toLight))) return BLACK;
    d = length(toLight);

    return 5.0*spot.emission*max(0.0,dot(normal,-normToLight)) *//放大直接光照减少噪点
        max(0.0, dot(normToLight, insNormal)) /
        (pdf*d*d);
}