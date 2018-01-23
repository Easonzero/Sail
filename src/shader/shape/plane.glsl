struct Plane{
    vec3 normal;
    float offset;
    bool dface;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Plane parsePlane(float index){
    Plane plane;
    plane.normal = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    plane.offset = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    plane.dface = readBool(objects,vec2(5.0,index),OBJECTS_LENGTH);
    plane.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    plane.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    plane.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);
    return plane;
}

void computeDpDForPlane( vec3 normal,out vec3 dpdu,out vec3 dpdv){
    if (abs(normal.x)<0.5) {
        dpdu = cross(normal, vec3(1,0,0));
    }else {
        dpdu = cross(normal, vec3(0,1,0));
    }

    dpdv = cross(normal,dpdu);
}

Intersect intersectPlane(Ray ray,Plane plane){
    Intersect result;
    result.d = MAX_DISTANCE;
    float DN = dot(ray.dir,plane.normal);
    if(DN==0.0||(!plane.dface&&DN>EPSILON)) return result;
    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;
    if(t<EPSILON) return result;
    result.d = t;
    result.normal = plane.normal;
    result.hit = ray.origin+result.d*ray.dir;
    computeDpDForPlane(result.normal,result.dpdu,result.dpdv);
    result.matIndex = plane.matIndex;
    result.sc = getSurfaceColor(result.hit,plane.texIndex);
    result.emission = plane.emission;
    result.matCategory = readInt(texParams,vec2(0.0,plane.matIndex),TEX_PARAMS_LENGTH);
    return result;
}

vec3 samplePlane(Intersect ins,Plane plane,out float pdf){
    //todo
    return BLACK;
}