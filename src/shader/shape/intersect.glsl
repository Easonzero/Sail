#include "../const/define.glsl"
#include "../util/utility.glsl"
#include "primitive.glsl"
#include "../texture/texture.glsl"

struct Intersect{
    float d;
    vec3 hit;
    vec3 normal;
    float matIndex;//材质索引
    vec3 sc;//表面颜色
    vec3 emission;
    float seed;//随机种子
    int index;
};

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
    if(tNear>EPSILON&&tNear<tFar) {
        t = tNear;f = 1.0;
    }else if(tNear<tFar) {
        t = tFar;f = -1.0;
    }
    if(t > EPSILON){
        result.d = t;
        result.hit = ray.origin+t*ray.dir;
        result.normal = normalForCube(ray.origin+t*ray.dir,cube,f);
        result.matIndex = cube.matIndex;
        result.sc = getSurfaceColor(result.hit,cube.texIndex);
        result.emission = cube.emission;
    }
    return result;
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
    		result.matIndex = sphere.matIndex;
    		result.sc = getSurfaceColor(result.hit,sphere.texIndex);
    		result.emission = sphere.emission;
		}
	}
    return result;
}

Intersect intersectPlane(Ray ray,Plane plane){
    Intersect result;
    result.d = MAX_DISTANCE;
    float DN = dot(ray.dir,plane.normal);
    if(DN==0.0||(!plane.dface&&DN>EPSILON)) return result;
    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;
    if(t<EPSILON) return result;
    result.d = t;
    result.normal = plane.normal;
    result.hit = ray.origin+result.d*ray.dir;
    result.matIndex = plane.matIndex;
    result.sc = getSurfaceColor(result.hit,plane.texIndex);
    result.emission = plane.emission;
    return result;
}

Intersect intersectObjects(Ray ray){
    Intersect ins;
    ins.d = MAX_DISTANCE;
    for(int i=0;i<ln+n;i++){
        Intersect tmp;
        tmp.d = MAX_DISTANCE;
        int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
        if(category==CUBE){
            Cube cube = parseCube(float(i)/float(ln+n-1));
            tmp = intersectCube(ray,cube);
            tmp.index = i;
        }else if(category==SPHERE){
            Sphere sphere = parseSphere(float(i)/float(ln+n-1));
            tmp = intersectSphere(ray,sphere);
            tmp.index = i;
        }else if(category==PLANE){
            Plane plane = parsePlane(float(i)/float(ln+n-1));
            tmp = intersectPlane(ray,plane);
            tmp.index = i;
        }

        if(tmp.d<ins.d){
            ins = tmp;
        }
    }
    return ins;
}

bool testShadow(Ray ray){
    Intersect ins = intersectObjects(ray);
    if(ins.index>=ln&&ins.d>EPSILON&&ins.d<1.0)
        return true;
    return false;
}