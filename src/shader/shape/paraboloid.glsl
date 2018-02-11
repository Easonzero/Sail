struct Paraboloid{
    vec3 p;
    float z0;
    float z1;
    float r;
    float matIndex;
    float texIndex;
    vec3 emission;
    bool reverseNormal;
};

Paraboloid parseParaboloid(float index){
    Paraboloid paraboloid;
    paraboloid.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    paraboloid.z0 = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    paraboloid.z1 = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);
    paraboloid.r = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH);
    paraboloid.reverseNormal = readBool(objects,vec2(7.0,index),OBJECTS_LENGTH);
    paraboloid.matIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);
    paraboloid.texIndex = readFloat(objects,vec2(9.0,index),OBJECTS_LENGTH)/float(tn-1);
    paraboloid.emission = readVec3(objects,vec2(10.0,index),OBJECTS_LENGTH);
    return paraboloid;
}

void computeDpDForParaboloid(vec3 hit,float zMax,float zMin,out vec3 dpdu,out vec3 dpdv){
    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);
    dpdv = (zMax - zMin) *
                vec3(hit.x / (2.0 * hit.z), hit.y / (2.0 * hit.z), 1);

}

vec3 normalForParaboloid(vec3 hit,Paraboloid paraboloid){
    float zMin = min(paraboloid.z0, paraboloid.z1);
    float zMax = max(paraboloid.z0, paraboloid.z1);
    vec3 dpdu,dpdv;
    computeDpDForParaboloid(hit,zMax,zMin,dpdu,dpdv);
    vec3 normal = localToWorld(normalize(cross(dpdu,dpdv)),OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return (paraboloid.reverseNormal?-1.0:1.0)*normal;
}

Intersect intersectParaboloid(Ray ray,Paraboloid paraboloid){
    Intersect result;
    result.d = MAX_DISTANCE;

    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    ray.origin = worldToLocal(ray.origin - paraboloid.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);

    float zMin = min(paraboloid.z0, paraboloid.z1);
    float zMax = max(paraboloid.z0, paraboloid.z1);

    float k = zMax / (paraboloid.r * paraboloid.r);
    float a = k * (ray.dir.x * ray.dir.x + ray.dir.y * ray.dir.y);
    float b = 2.0 * k * (ray.dir.x * ray.origin.x + ray.dir.y * ray.origin.y) - ray.dir.z;
    float c = k * (ray.origin.x * ray.origin.x + ray.origin.y * ray.origin.y) - ray.origin.z;

    float t1,t2,t;
    if(!quadratic(a,b,c,t1,t2)) return result;
    if(t2 < -EPSILON) return result;

    t = t1;
    if(t1 < EPSILON) t = t2;

    vec3 hit = ray.origin+t*ray.dir;
    if (hit.z < zMin || hit.z > zMax){
        if (t == t2) return result;
        t = t2;

        hit = ray.origin+t*ray.dir;
        if (hit.z < zMin || hit.z > zMax) return result;
    }

    if(t >= MAX_DISTANCE) return result;

    float phi = atan(hit.y, hit.x);
    if (phi < 0.0) phi += 2.0 * PI;

    float u = phi / (2.0*PI);
    float v = (hit.z - zMin) / (zMax - zMin);

    result.d = t;
    computeDpDForParaboloid(hit,zMax,zMin,result.dpdu,result.dpdv);
    result.normal = normalize(cross(result.dpdu,result.dpdv));
    result.hit = hit;
    result.matIndex = paraboloid.matIndex;
    result.sc = getSurfaceColor(result.hit,vec2(u,v),paraboloid.texIndex);
    result.emission = paraboloid.emission;

    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+paraboloid.p;
    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return result;
}

vec3 sampleParaboloid(vec2 u,Paraboloid paraboloid,out float pdf){
    //todo
    return BLACK;
}