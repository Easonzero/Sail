struct Cone{
    vec3 p;
    float h;
    float r;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Cone parseCone(float index){
    Cone cone;
    cone.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    cone.h = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    cone.r = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);
    cone.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    cone.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    cone.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);
    return cone;
}

void computeDpDForCone(vec3 hit,float h,out vec3 dpdu,out vec3 dpdv){
    float v = hit.z / h;

    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);
    dpdv = vec3(-hit.x / (1.0 - v), -hit.y / (1.0 - v), h);
}

vec3 normalForCone(vec3 hit,Cone cone){
    float tana = cone.r/cone.h;
    float d = sqrt(hit.x*hit.x+hit.y*hit.y);
    float x1 = d/tana;
    float x2 = d*tana;
    vec3 no = vec3(0,0,cone.h-x1-x2);
    return normalize(hit-no);
}

Intersect intersectCone(Ray ray,Cone cone){
    Intersect result;
    result.d = MAX_DISTANCE;

    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    ray.origin = worldToLocal(ray.origin - cone.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);

    float k = cone.r / cone.h;
    k = k * k;
    float a = ray.dir.x * ray.dir.x + ray.dir.y * ray.dir.y - k * ray.dir.z * ray.dir.z;
    float b = 2.0 * (ray.dir.x * ray.origin.x + ray.dir.y * ray.origin.y - k * ray.dir.z * (ray.origin.z - cone.h));
    float c = ray.origin.x * ray.origin.x + ray.origin.y * ray.origin.y - k * (ray.origin.z - cone.h) * (ray.origin.z - cone.h);

    float t1,t2,t;
    if(!quadratic(a,b,c,t1,t2)) return result;
    if(t2 < -EPSILON) return result;

    t = t1;
    if(t1 < EPSILON) t = t2;

    vec3 hit = ray.origin+t*ray.dir;
    if (hit.z < -EPSILON || hit.z > cone.h){
        if (t == t2) return result;
        t = t2;

        hit = ray.origin+t*ray.dir;
        if (hit.z < -EPSILON || hit.z > cone.h) return result;
    }

    if(t >= MAX_DISTANCE) return result;

    result.d = t;
    computeDpDForCone(hit,cone.h,result.dpdu,result.dpdv);
    result.normal = normalize(cross(result.dpdu,result.dpdv));
    result.hit = hit;
    result.matIndex = cone.matIndex;
    result.sc = getSurfaceColor(result.hit,cone.texIndex);
    result.emission = cone.emission;

    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+cone.p;
    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return result;
}

vec3 sampleCone(Intersect ins,Cone cone,out float pdf){
    //todo
    return BLACK;
}