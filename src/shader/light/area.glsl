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

vec3 area_sample(Area area,vec2 u,vec3 hit,vec3 insNormal){
    vec3 normal,p;
    float pdf,d;
    p = sampleGeometry(u,area.index,normal,pdf);
    vec3 toLight = p-hit;
    if(testShadow(Ray(hit + 0.0001*normal, toLight))) return BLACK;
    d = length(toLight);

    return area.emission*max(0.0,dot(normal,-toLight)) *
        max(0.0, dot(normalize(toLight), insNormal)) /
        (pdf*d*d);
}