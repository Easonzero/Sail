struct Hyperboloid{
    vec3 p;
    vec3 p1;
    vec3 p2;
    float ah;
    float ch;
    float matIndex;
    float texIndex;
    vec3 emission;
    bool reverseNormal;
};

bool testBoundboxForHyperboloid(Ray ray,Hyperboloid hyperboloid){
    float r1 = sqrt(hyperboloid.p1.x*hyperboloid.p1.x+hyperboloid.p1.y*hyperboloid.p1.y);
    float r2 = sqrt(hyperboloid.p2.x*hyperboloid.p2.x+hyperboloid.p2.y*hyperboloid.p2.y);
    float rMax = max(r1,r2);
    float zMin = min(hyperboloid.p1.z,hyperboloid.p2.z);
    float zMax = max(hyperboloid.p1.z,hyperboloid.p2.z);
    Boundbox box = Boundbox(
        hyperboloid.p-vec3(rMax,-zMin,rMax),
        hyperboloid.p+vec3(rMax,zMax,rMax)
    );
    return testBoundbox(ray,box);
}

Hyperboloid parseHyperboloid(float index){
    Hyperboloid hyperboloid;
    hyperboloid.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    hyperboloid.p1 = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    hyperboloid.p2 = readVec3(objects,vec2(7.0,index),OBJECTS_LENGTH);
    hyperboloid.ah = readFloat(objects,vec2(10.0,index),OBJECTS_LENGTH);
    hyperboloid.ch = readFloat(objects,vec2(11.0,index),OBJECTS_LENGTH);
    hyperboloid.reverseNormal = readBool(objects,vec2(12.0,index),OBJECTS_LENGTH);
    hyperboloid.matIndex = readFloat(objects,vec2(13.0,index),OBJECTS_LENGTH)/float(tn-1);
    hyperboloid.texIndex = readFloat(objects,vec2(14.0,index),OBJECTS_LENGTH)/float(tn-1);
    hyperboloid.emission = readVec3(objects,vec2(15.0,index),OBJECTS_LENGTH);

    return hyperboloid;
}

void computeDpDForHyperboloid(vec3 hit,vec3 p1,vec3 p2,float phi,out vec3 dpdu,out vec3 dpdv){
    float sinPhi = sin(phi),cosPhi = cos(phi);
    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);
    dpdv = vec3((p2.x - p1.x) * cosPhi - (p2.y - p1.y) * sinPhi,
                      (p2.x - p1.x) * sinPhi + (p2.y - p1.y) * cosPhi, p2.z - p1.z);
}

vec3 normalForHyperboloid(vec3 hit,Hyperboloid hyperboloid){
    float v = (hit.z - hyperboloid.p1.z) / (hyperboloid.p2.z - hyperboloid.p1.z);
    vec3 pr = (1.0 - v) * hyperboloid.p1 + v * hyperboloid.p2;
    float phi = atan(pr.x * hit.y - hit.x * pr.y,
                         hit.x * pr.x + hit.y * pr.y);
    if (phi < 0.0) phi += 2.0 * PI;
    vec3 dpdu,dpdv;
    computeDpDForHyperboloid(hit,hyperboloid.p1,hyperboloid.p2,phi,dpdu,dpdv);
    vec3 normal = localToWorld(normalize(cross(dpdu,dpdv)),OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return (hyperboloid.reverseNormal?-1.0:1.0)*normal;
}

Intersect intersectHyperboloid(Ray ray,Hyperboloid hyperboloid){
    Intersect result;
    result.d = MAX_DISTANCE;

    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    ray.origin = worldToLocal(ray.origin - hyperboloid.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);

    float a = hyperboloid.ah * ray.dir.x * ray.dir.x + hyperboloid.ah * ray.dir.y * ray.dir.y - hyperboloid.ch * ray.dir.z * ray.dir.z;
    float b = 2.0 * (hyperboloid.ah * ray.dir.x * ray.origin.x + hyperboloid.ah * ray.dir.y * ray.origin.y - hyperboloid.ch * ray.dir.z * ray.origin.z);
    float c = hyperboloid.ah * ray.origin.x * ray.origin.x + hyperboloid.ah * ray.origin.y * ray.origin.y - hyperboloid.ch * ray.origin.z * ray.origin.z - 1.0;

    float t1,t2,t;
    if(!quadratic(a,b,c,t1,t2)) return result;
    if(t2 < -EPSILON) return result;

    t = t1;
    if(t1 < EPSILON) t = t2;

    vec3 hit = ray.origin+t*ray.dir;
    float zMin = min(hyperboloid.p1.z, hyperboloid.p2.z);
    float zMax = max(hyperboloid.p1.z, hyperboloid.p2.z);
    if (hit.z < zMin || hit.z > zMax){
        if (t == t2) return result;
        t = t2;

        hit = ray.origin+t*ray.dir;
        if (hit.z < zMin || hit.z > zMax) return result;
    }

    if(t >= MAX_DISTANCE) return result;

    float v = (hit.z - hyperboloid.p1.z) / (hyperboloid.p2.z - hyperboloid.p1.z);
    vec3 pr = (1.0 - v) * hyperboloid.p1 + v * hyperboloid.p2;
    float phi = atan(pr.x * hit.y - hit.x * pr.y,
                             hit.x * pr.x + hit.y * pr.y);
    if (phi < 0.0) phi += 2.0 * PI;
    float u = phi / (2.0*PI);

    result.d = t;
    computeDpDForHyperboloid(hit,hyperboloid.p1,hyperboloid.p2,phi,result.dpdu,result.dpdv);
    result.normal = normalize(cross(result.dpdu,result.dpdv));
    result.hit = hit;
    result.matIndex = hyperboloid.matIndex;
    result.sc = getSurfaceColor(result.hit,vec2(u,v),hyperboloid.texIndex);
    result.emission = hyperboloid.emission;

    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+hyperboloid.p;
    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return result;
}

vec3 sampleHyperboloid(vec2 u,Hyperboloid hyperboloid,out float pdf){
    //todo
    return BLACK;
}