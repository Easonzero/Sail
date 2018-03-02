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
    float pdf;
    p = sampleGeometry(random2(seed),area.index,normal,pdf);
    vec3 toLight = p-hit;
    vec3 normToLight = normalize(toLight);
    if(testShadow(Ray(hit, toLight))) return BLACK;

    return area.emission*max(0.0,dot(normal,-normToLight)) *
        max(0.0, dot(normToLight, insNormal)) / pdf;
}