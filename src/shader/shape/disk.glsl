struct Disk{
    vec3 p;
    float r;
    float innerR;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Disk parseDisk(float index){
    Disk disk;
    disk.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    disk.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    disk.innerR = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);
    disk.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    disk.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    disk.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);
    return disk;
}

void computeDpDForDisk(vec3 hit,float r,float innerR,float dist2,out vec3 dpdu,out vec3 dpdv){
    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);
    dpdv = vec3(hit.x, hit.y, 0) * (innerR - r) / sqrt(dist2);
}

vec3 normalForDisk(vec3 hit,Disk disk){
    float dist2 = hit.x * hit.x + hit.y * hit.y;
    vec3 dpdu,dpdv;
    computeDpDForDisk(hit,disk.r,disk.innerR,dist2,dpdu,dpdv);
    return normalize(cross(dpdu,dpdv));
}

Intersect intersectDisk(Ray ray,Disk disk){
    Intersect result;
    result.d = MAX_DISTANCE;

    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    ray.origin = worldToLocal(ray.origin - disk.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);

    if (ray.dir.z == 0.0) return result;
    float t = -ray.origin.z / ray.dir.z;
    if (t <= 0.0) return result;

    vec3 hit = ray.origin+t*ray.dir;
    float dist2 = hit.x * hit.x + hit.y * hit.y;
    if (dist2 > disk.r * disk.r || dist2 < disk.innerR * disk.innerR)
        return result;

    if(t >= MAX_DISTANCE) return result;

    result.d = t;
    computeDpDForDisk(hit,disk.r,disk.innerR,dist2,result.dpdu,result.dpdv);
    result.normal = normalize(cross(result.dpdu,result.dpdv));
    result.hit = hit;
    result.matIndex = disk.matIndex;
    result.sc = getSurfaceColor(result.hit,disk.texIndex);
    result.emission = disk.emission;

    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+disk.p;
    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return result;
}

vec3 sampleDisk(Intersect ins,Disk disk,out float pdf){
    //todo
    return BLACK;
}