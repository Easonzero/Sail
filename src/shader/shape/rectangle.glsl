struct Rectangle{
    vec3 min;
    vec3 max;
    float matIndex;
    float texIndex;
    vec3 emission;
    bool reverseNormal;
};

Rectangle parseRectangle(float index){
    Rectangle rectangle;
    rectangle.min = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);
    rectangle.max = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);
    rectangle.reverseNormal = readBool(objects,vec2(7.0,index),OBJECTS_LENGTH);
    rectangle.matIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);
    rectangle.texIndex = readFloat(objects,vec2(9.0,index),OBJECTS_LENGTH)/float(tn-1);
    rectangle.emission = readVec3(objects,vec2(10.0,index),OBJECTS_LENGTH);
    return rectangle;
}

vec3 normalForRectangle(vec3 hit,Rectangle rectangle){
    vec3 x = vec3(rectangle.max.x-rectangle.min.x,0.0,0.0);
    vec3 y = vec3(0.0,(rectangle.max-rectangle.min).yz);
    vec3 normal = normalize(cross(x,y));
    return (rectangle.reverseNormal?-1.0:1.0)*normal;
}

Intersect intersectRectangle(Ray ray,Rectangle rectangle){
    Intersect result;
    result.d = MAX_DISTANCE;

    result.dpdu = vec3(rectangle.max.x-rectangle.min.x,0.0,0.0);
    result.dpdv = vec3(0.0,(rectangle.max-rectangle.min).yz);
    result.normal = normalize(cross(result.dpdu,result.dpdv));

    float maxX = length(result.dpdu);
    float maxY = length(result.dpdv);
    vec3 ss = result.dpdu/maxX,ts = cross(result.normal,ss);

    ray.dir = worldToLocal(ray.dir,result.normal,ss,ts);
    ray.origin = worldToLocal(ray.origin - rectangle.min,result.normal,ss,ts);

    if(ray.dir.z == 0.0) return result;

    float t = -ray.origin.z/ray.dir.z;
    if(t < EPSILON) return result;

    vec3 hit = ray.origin+t*ray.dir;
    if(hit.x > maxX || hit.y > maxY ||
        hit.x < -EPSILON || hit.y < -EPSILON) return result;

    result.d = t;
    result.matIndex = rectangle.matIndex;
    result.sc = getSurfaceColor(hit,rectangle.texIndex);
    result.emission = rectangle.emission;

    result.hit = localToWorld(hit,result.normal,ss,ts)+rectangle.min;
    return result;
}

vec3 sampleRectangle(Intersect ins,Rectangle rectangle,out float pdf){
    vec3 x = vec3(rectangle.max.x-rectangle.min.x,0.0,0.0);
    vec3 y = vec3(0.0,(rectangle.max-rectangle.min).yz);
    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );
    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );
    pdf = 1.0/(length(x)*length(y));
    return rectangle.min+x*u1+y*u2;
}