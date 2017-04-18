#include "define.glsl"
#include "utility.glsl"
#include "ray.glsl"
#include "geometry.glsl"

struct Intersect{
    float d;
    vec3 hit;
    vec3 normal;
    int material;
};

Intersect intersectFace(Ray ray,Face face){
    Intersect result;
    result.d = MAX_DISTANCE;

    float Amod = modMatrix(mat3(
        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,
        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,
        ray.dir.x,ray.dir.y,ray.dir.z
    ));

    float t = modMatrix(mat3(
        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,
        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,
        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z
    ))/Amod;

    if(t<0.0||t>=MAX_DISTANCE) return result;

    float c = modMatrix(mat3(
        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,
        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,
        ray.dir.x,ray.dir.y,ray.dir.z
    ))/Amod;

    if(c>1.0||c<0.0) return result;

    float b = modMatrix(mat3(
        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,
        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,
        ray.dir.x,ray.dir.y,ray.dir.z
    ))/Amod;

    if(c+b>1.0||b<0.0) return result;

    result.d = t;
    result.hit = ray.origin+t*ray.dir;
    result.normal = face.normal_1+b*(face.normal_2-face.normal_1)+c*(face.normal_3-face.normal_1);
    result.material = face.material;

    return result;
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
    if(tNear>0.0&&tNear<tFar) {
        result.d = tNear;
        result.hit = ray.origin+tNear*ray.dir;
        result.normal = normalForCube(ray.origin+tNear*ray.dir,cube);
        result.material = cube.material;
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
	float discriminant = b * b - 4.0 * a * c;
	if ( discriminant > 0.0 ){
		float t = (-b - sqrt( discriminant ) ) / (2.0 * a);
		if ( t > 0.0 ){
		    result.d = t;
		    result.hit = ray.origin+t*ray.dir;
		    result.normal = normalForSphere(ray.origin+t*ray.dir,sphere);
		    result.material = sphere.material;
		}
	}
    return result;
}

Intersect intersectPlane(Ray ray,Plane plane){
    Intersect result;
    result.d = MAX_DISTANCE;
    float DN = dot(ray.dir,plane.normal);
    if(DN==0.0) return result;
    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;
    if(t<0.0001) return result;
    result.d = t;
    result.normal = plane.normal;
    result.hit = ray.origin+result.d*ray.dir;
    result.material = plane.material;
    return result;
}

Intersect intersectObjects(sampler2D objects,int n,Ray ray){
    Intersect ins;
    ins.d = MAX_DISTANCE;
    for(int i=0;i<n;i++){
        Intersect tmp;
        tmp.d = MAX_DISTANCE;
        int category = int(texture(objects,vec2(0.0,float(i)/float(n-1))).r);
        if(category==FACE){
            Face face = parseFace(objects,float(i)/float(n-1));
            tmp = intersectFace(ray,face);
        }else if(category==CUBE){
            Cube cube = parseCube(objects,float(i)/float(n-1));
            tmp = intersectCube(ray,cube);
        }else if(category==SPHERE){
            Sphere sphere = parseSphere(objects,float(i)/float(n-1));
            tmp = intersectSphere(ray,sphere);
        }else if(category==PLANE){
            Plane plane = parsePlane(objects,float(i)/float(n-1));
            tmp = intersectPlane(ray,plane);
        }

        if(tmp.d<ins.d){
            ins = tmp;
        }
    }
    return ins;
}