struct Cube{
    vec3 min;
    vec3 max;
    float matIndex;
    float texIndex;
    vec3 emission;
    bool reverseNormal;
};

Cube parseCube(float index){
    Cube cube;
    cube.min = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    cube.max = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    cube.reverseNormal = readBool(objects,vec2(7.0,index),OBJECTS_LENGTH);
    cube.matIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.texIndex = readFloat(objects,vec2(9.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.emission = readVec3(objects,vec2(10.0,index),OBJECTS_LENGTH);
    return cube;
}

vec3 normalForCube(vec3 hit, Cube cube){
    float c = (cube.reverseNormal?-1.0:1.0);
	if ( hit.x < cube.min.x + 0.0001 )
		return c*vec3( -1.0, 0.0, 0.0 );
	else if ( hit.x > cube.max.x - 0.0001 )
		return c*vec3( 1.0, 0.0, 0.0 );
	else if ( hit.y < cube.min.y + 0.0001 )
		return c*vec3( 0.0, -1.0, 0.0 );
	else if ( hit.y > cube.max.y - 0.0001 )
		return c*vec3( 0.0, 1.0, 0.0 );
	else if ( hit.z < cube.min.z + 0.0001 )
		return c*vec3( 0.0, 0.0, -1.0 );
	else return c*vec3( 0.0, 0.0, 1.0 );
}

void computeDpDForCube( vec3 normal,out vec3 dpdu,out vec3 dpdv){
    if (abs(normal.x)<0.5) {
        dpdu = cross(normal, vec3(1,0,0));
    }else {
        dpdu = cross(normal, vec3(0,1,0));
    }

    dpdv = cross(normal,dpdu);
}

vec3 sampleCube(vec2 u,Cube cube,out float pdf){
    return BLACK;
}

vec2 getCubeUV(vec3 hit, Cube cube){
    vec3 tr = cube.max-cube.min;
    hit = hit - cube.min;
    if ( hit.x < cube.min.x + 0.0001||hit.x > cube.max.x - 0.0001 )
		return hit.yz/tr.yz;
	else if ( hit.y < cube.min.y + 0.0001||hit.y > cube.max.y - 0.0001 )
		return hit.xz/tr.xz;
	else
		return hit.xy/tr.xy;
}

Intersect intersectCube(Ray ray,Cube cube){
    Intersect result;
    result.d = MAX_DISTANCE;
    vec3 tMin = (cube.min - ray.origin) / ray.dir;
    vec3 tMax = (cube.max- ray.origin) / ray.dir;
    vec3 t1 = min( tMin, tMax );
    vec3 t2 = max( tMin, tMax );
    float tNear = max( max( t1.x, t1.y ), t1.z );
    float tFar = min( min( t2.x, t2.y ), t2.z );
    float t=-1.0,f;
    if(tNear>EPSILON&&tNear<tFar) t = tNear;
    else if(tNear<tFar) t = tFar;
    if(t > EPSILON){
        result.d = t;
        result.hit = ray.origin+t*ray.dir;
        result.normal = normalForCube(ray.origin+t*ray.dir,cube);
        computeDpDForCube(result.normal,result.dpdu,result.dpdv);
        result.matIndex = cube.matIndex;
        result.sc = getSurfaceColor(result.hit,getCubeUV(result.hit,cube),cube.texIndex);
        result.emission = cube.emission;
    }
    return result;
}