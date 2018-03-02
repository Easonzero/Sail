struct Point{
  vec3 from;
  vec3 emission;
};

Point parsePoint(float index){
    Point point;
    point.from = readVec3(lights,vec2(1.0,index),LIGHTS_LENGTH);
    point.emission = readVec3(lights,vec2(4.0,index),LIGHTS_LENGTH);
    return point;
}

vec3 point_sample(Point point,float seed,vec3 hit,vec3 insNormal){
    vec3 p = point.from + uniformSampleSphere(random2(seed))*0.1;
    vec3 toLight = p-hit;
    if(testShadow(Ray(hit, toLight))) return BLACK;

    return point.emission *
        max(0.0, dot(normalize(toLight), insNormal));
}