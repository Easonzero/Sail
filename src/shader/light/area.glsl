struct Area{
  vec3 emission;
  int index;
};

Area parseArea(float index){
    Area area;
    area.index = readInt(lights,vec2(1.0,index),LIGHTS_LENGTH);
    area.emission = readVec3(lights,vec2(2.0,index),LIGHTS_LENGTH);
    return area;
}

vec3 area_sample(Area area,float seed,vec3 hit,vec3 insNormal){
    vec3 normal,p;
    float pdf,d;
    p = sampleGeometry(random2(seed),area.index,normal,pdf);
    vec3 toLight = p-hit;
    vec3 normToLight = normalize(toLight);
    if(testShadow(Ray(hit, toLight))) return BLACK;
    d = length(toLight);

    return 6.0*area.emission*max(0.0,dot(normal,-normToLight)) *//放大直接光照减少噪点
        max(0.0, dot(normToLight, insNormal)) /
        (pdf*d*d);
}