struct Cornellbox{
    vec3 min;
    vec3 max;
    float matIndex;
    bool reverseNormal;
    vec3 emission;
};

Cornellbox parseCornellbox(float index){
    Cornellbox box;
    box.min = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    box.max = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    box.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    box.reverseNormal = false;
    box.emission = BLACK;
    return box;
}

vec3 getCornellboxColor(vec3 hit,vec3 min,vec3 max){

    if ( hit.x < min.x + 0.0001 )
    	return GREEN;
    else if ( hit.x > max.x - 0.0001 )
    	return BLUE;
    else if ( hit.y < min.y + 0.0001 )
    	return WHITE;
    else if ( hit.y > max.y - 0.0001 )
    	return WHITE;
    else if ( hit.z > min.z + 0.0001 )
    	return WHITE;

    return BLACK;
}

vec3 normalForCornellbox(vec3 hit, Cornellbox box){
	if ( hit.x < box.min.x + 0.0001 )
		return vec3( -1.0, 0.0, 0.0 );
	else if ( hit.x > box.max.x - 0.0001 )
		return vec3( 1.0, 0.0, 0.0 );
	else if ( hit.y < box.min.y + 0.0001 )
		return vec3( 0.0, -1.0, 0.0 );
	else if ( hit.y > box.max.y - 0.0001 )
		return vec3( 0.0, 1.0, 0.0 );
	else if ( hit.z < box.min.z + 0.0001 )
		return vec3( 0.0, 0.0, -1.0 );
	else return vec3( 0.0, 0.0, 1.0 );
}

void computeDpDForCornellbox( vec3 normal,out vec3 dpdu,out vec3 dpdv){
    if (abs(normal.x)<0.5) {
        dpdu = cross(normal, vec3(1,0,0));
    }else {
        dpdu = cross(normal, vec3(0,1,0));
    }

    dpdv = cross(normal,dpdu);
}

vec3 sampleCornellbox(vec2 u,Cornellbox box,out float pdf){
    return BLACK;
}

Intersect intersectCornellbox(Ray ray,Cornellbox box){
    Intersect result;
    result.d = MAX_DISTANCE;
    vec3 tMin = (box.min - ray.origin) / ray.dir;
    vec3 tMax = (box.max- ray.origin) / ray.dir;
    vec3 t1 = min( tMin, tMax );
    vec3 t2 = max( tMin, tMax );
    float tNear = max( max( t1.x, t1.y ), t1.z );
    float tFar = min( min( t2.x, t2.y ), t2.z );
    float t=-1.0,f;

    if(tNear<tFar) t = tFar;

    if(t > EPSILON){
        result.d = t;
        result.hit = ray.origin+t*ray.dir;
        result.normal = -normalForCornellbox(ray.origin+t*ray.dir,box);
        computeDpDForCornellbox(result.normal,result.dpdu,result.dpdv);
        result.matIndex = box.matIndex;
        result.sc = getCornellboxColor(result.hit,box.min,box.max);
        result.emission = BLACK;
    }
    return result;
}