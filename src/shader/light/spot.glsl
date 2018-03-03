struct Spot{
  vec3 emission;
  float cosTotalWidth;
  float cosFalloffStart;
  vec3 from;
};

Spot parseSpot(float index){
    Spot spot;
    spot.cosTotalWidth = readFloat(lights,vec2(1.0,index),LIGHTS_LENGTH);
    spot.cosFalloffStart = readFloat(lights,vec2(2.0,index),LIGHTS_LENGTH);
    spot.from = readVec3(lights,vec2(3.0,index),LIGHTS_LENGTH);
    spot.emission = readVec3(lights,vec2(6.0,index),LIGHTS_LENGTH);
    return spot;
}

float falloff(Spot spot,vec3 w){
    vec3 wl = w;
    float cosTheta = -wl.y;
    if (cosTheta < spot.cosTotalWidth) return 0.0;
    if (cosTheta >= spot.cosFalloffStart) return 1.0;

    float delta =
        (cosTheta - spot.cosTotalWidth) / (spot.cosFalloffStart - spot.cosTotalWidth);
    float delta2 = delta * delta;
    return delta2 * delta2;
}

vec3 spot_sample(Spot spot,float seed,vec3 hit,vec3 insNormal){
    vec3 p = spot.from;
    vec3 toLight = p-hit;

    if(testShadow(Ray(hit, toLight))) return BLACK;
    vec3 normToLight = normalize(toLight);
    float d = length(toLight);

    return spot.emission * falloff(spot,-normToLight) *
        max(0.0, dot(normalize(toLight), insNormal)) / (d*d);
}