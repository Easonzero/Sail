struct Boundbox{
    vec3 max;
    vec3 min;
};

bool testBoundbox(Ray ray,Boundbox box){
    vec3 tMin = (box.min-ray.origin)/ray.dir;
    vec3 tMax = (box.max-ray.origin)/ray.dir;
    vec3 t1 = min( tMin, tMax );
    vec3 t2 = max( tMin, tMax );
    float tNear = max( max( t1.x, t1.y ), t1.z );
    float tFar = min( min( t2.x, t2.y ), t2.z );

    if(tNear<0.0&&tFar<0.0) return false;

    return tNear < tFar;
}