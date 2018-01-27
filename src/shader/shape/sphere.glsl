struct Sphere{
    vec3 c;
    float r;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Sphere parseSphere(float index){
    Sphere sphere;
    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);
    sphere.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);
    sphere.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);
    sphere.emission = readVec3(objects,vec2(7.0,index),OBJECTS_LENGTH);
    return sphere;
}

vec3 normalForSphere( vec3 hit, Sphere sphere ){
	return (hit - sphere.c) / sphere.r;
}

void computeDpDForSphere(vec3 hit,float radius,out vec3 dpdu,out vec3 dpdv){
    float theta = acos(clamp(hit.z / radius, -1.0, 1.0));

    float zRadius = sqrt(hit.x * hit.x + hit.y * hit.y);
    float invZRadius = 1.0 / zRadius;
    float cosPhi = hit.x * invZRadius;
    float sinPhi = hit.y * invZRadius;

    dpdu = vec3(-2.0*PI * hit.y, 2.0*PI * hit.x,0.0);
    dpdv = PI * vec3(hit.z * cosPhi, hit.z * sinPhi,-radius * sin(theta));
}

Intersect intersectSphere(Ray ray,Sphere sphere){
    Intersect result;
    result.d = MAX_DISTANCE;

    ray.dir = worldToLocal(ray.dir,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    ray.origin = worldToLocal(ray.origin - sphere.c,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);

	float a = dot( ray.dir, ray.dir );
	float b = 2.0 * dot( ray.origin, ray.dir );
	float c = dot( ray.origin, ray.origin ) - sphere.r * sphere.r;

	float t1,t2,t;
	if(!quadratic(a,b,c,t1,t2)) return result;
	if(t2 < EPSILON) return result;

    t = t1;
    if(t1 < EPSILON) t = t2;
    if(t >= MAX_DISTANCE) return result;

    result.d = t;
    result.hit = ray.origin+t*ray.dir;
    computeDpDForSphere(result.hit,sphere.r,result.dpdu,result.dpdv);
    result.normal = normalize(cross(result.dpdv,result.dpdu));
    result.matIndex = sphere.matIndex;
    result.sc = getSurfaceColor(result.hit,sphere.texIndex);
    result.emission = sphere.emission;
    result.matCategory = readInt(texParams,vec2(0.0,sphere.matIndex),TEX_PARAMS_LENGTH);

    result.hit = localToWorld(result.hit,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T)+sphere.c;
    result.normal = localToWorld(result.normal,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdu = localToWorld(result.dpdu,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    result.dpdv = localToWorld(result.dpdv,OBJECT_SPACE_N,OBJECT_SPACE_S,OBJECT_SPACE_T);
    return result;
}

vec3 sampleSphere(Intersect ins,Sphere sphere,out float pdf){
    //todo
    return BLACK;
}