struct Cube{
    vec3 lb;
    vec3 rt;
    float matIndex;
    float texIndex;
    vec3 emission;
};

Cube parseCube(float index){
    Cube cube;
    cube.lb = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    cube.rt = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    cube.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);
    cube.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);
    return cube;
}

vec3 normalForCube( vec3 hit, Cube cube){
	if ( hit.x < cube.lb.x + 0.0001 )
		return vec3( -1.0, 0.0, 0.0 );
	else if ( hit.x > cube.rt.x - 0.0001 )
		return vec3( 1.0, 0.0, 0.0 );
	else if ( hit.y < cube.lb.y + 0.0001 )
		return vec3( 0.0, -1.0, 0.0 );
	else if ( hit.y > cube.rt.y - 0.0001 )
		return vec3( 0.0, 1.0, 0.0 );
	else if ( hit.z < cube.lb.z + 0.0001 )
		return vec3( 0.0, 0.0, -1.0 );
	else return vec3( 0.0, 0.0, 1.0 );
}

void computeDpDForCube( vec3 normal,out vec3 dpdu,out vec3 dpdv){
    if (abs(normal.x)<0.5) {
        dpdu = cross(normal, vec3(1,0,0));
    }else {
        dpdu = cross(normal, vec3(0,1,0));
    }

    dpdv = cross(normal,dpdu);
}

vec3 sampleCube(Intersect ins,Cube cube,out float pdf){
    vec3 x = vec3(cube.rt.x-cube.lb.x,0.0,0.0);
    vec3 y = vec3(0.0,0.0,cube.rt.z-cube.lb.z);
    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );
    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );
    pdf = 1.0/(length(x)*length(y));
    return cube.lb+u1*x+u2*y;
}

Intersect intersectCube(Ray ray,Cube cube){
    Intersect result;
    result.d = MAX_DISTANCE;
    vec3 tMin = (cube.lb - ray.origin) / ray.dir;
    vec3 tMax = (cube.rt- ray.origin) / ray.dir;
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
        result.sc = getSurfaceColor(result.hit,cube.texIndex);
        result.emission = cube.emission;
    }
    return result;
}