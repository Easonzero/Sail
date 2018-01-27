struct Cylinder{
    vec3 p;
    float h;
    float r;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Cylinder parseCylinder(float index){
    Cylinder cylinder;
    cylinder.p = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    cylinder.h = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    cylinder.r = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH);
    cylinder.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    cylinder.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    cylinder.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);
    return cylinder;
}

void computeDpDForCylinder(vec3 hit,float h,out vec3 dpdu,out vec3 dpdv){
    dpdu = vec3(-2.0 * PI * hit.y, 2.0 * PI * hit.x, 0);
    dpdv = vec3(0, 0, h);
}

vec3 normalForCylinder(vec3 hit,Cylinder cylinder){
    return normalize(vec3((hit-cylinder.p).xy,0));
}

Intersect intersectCylinder(Ray ray,Cylinder cylinder){
    Intersect result;
    result.d = MAX_DISTANCE;

    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    ray.origin = worldToLocal(ray.origin - cylinder.p,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);

    float a = ray.dir.x * ray.dir.x + ray.dir.y * ray.dir.y;
    float b = 2.0 * (ray.dir.x * ray.origin.x + ray.dir.y * ray.origin.y);
    float c = ray.origin.x * ray.origin.x + ray.origin.y * ray.origin.y - cylinder.r * cylinder.r;


    float t1,t2,t;
    if(!quadratic(a,b,c,t1,t2)) return result;
    if(t2 < -EPSILON) return result;

    t = t1;
    if(t1 < EPSILON) t = t2;

    vec3 hit = ray.origin+t*ray.dir;
    float hitRad = sqrt(hit.x * hit.x + hit.y * hit.y);
    hit.x *= cylinder.r / hitRad;
    hit.y *= cylinder.r / hitRad;
    if (hit.z < -EPSILON || hit.z > cylinder.h){
        if (t == t2) return result;
        t = t2;

        hit = ray.origin+t*ray.dir;
        float hitRad = sqrt(hit.x * hit.x + hit.y * hit.y);
        hit.x *= cylinder.r / hitRad;
        hit.y *= cylinder.r / hitRad;
        if (hit.z < -EPSILON || hit.z > cylinder.h) return result;
    }

    if(t >= MAX_DISTANCE) return result;

    result.d = t;
    computeDpDForCylinder(hit,cylinder.h,result.dpdu,result.dpdv);
    result.normal = normalize(cross(result.dpdu,result.dpdv));
    result.hit = hit;
    result.matIndex = cylinder.matIndex;
    result.sc = getSurfaceColor(result.hit,cylinder.texIndex);
    result.emission = cylinder.emission;
    result.matCategory = readInt(texParams,vec2(0.0,cylinder.matIndex),TEX_PARAMS_LENGTH);

    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+cylinder.p;
    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return result;
}

vec3 sampleCylinder(Intersect ins,Cylinder cylinder,out float pdf){
    //todo
    return BLACK;
}