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

void computeDpDForSphere(vec3 normal,out vec3 dpdu,out vec3 dpdv){
    dpdu = normalize(vec3(-2.0*PI * normal.y, 2.0*PI * normal.x, 0.0));
    dpdv = cross(normal,dpdu);
}

Intersect intersectSphere(Ray ray,Sphere sphere){
    Intersect result;
    result.d = MAX_DISTANCE;
    vec3 toSphere = ray.origin - sphere.c;
	float a = dot( ray.dir, ray.dir );
	float b = 2.0 * dot( toSphere, ray.dir );
	float c = dot( toSphere, toSphere ) - sphere.r * sphere.r;
	float det = b * b - 4.0 * a * c;
	if ( det > EPSILON ){
	    det = sqrt( det );
		float t = (-b - det);
		if(t < EPSILON) t = (-b + det);
		t /= 2.0*a;
		if(t > EPSILON){
	        result.d = t;
    		result.hit = ray.origin+t*ray.dir;
    		result.normal = normalForSphere(ray.origin+t*ray.dir,sphere);
    		computeDpDForSphere(result.normal,result.dpdu,result.dpdv);
    		result.matIndex = sphere.matIndex;
    		result.sc = getSurfaceColor(result.hit,sphere.texIndex);
    		result.emission = sphere.emission;
    		result.matCategory = readInt(texParams,vec2(0.0,sphere.matIndex),TEX_PARAMS_LENGTH);
		}
	}
    return result;
}

vec3 sampleSphere(Intersect ins,Sphere sphere,out float pdf){
    //todo
    return BLACK;
}