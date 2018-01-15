(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	/**
	 * Created by eason on 17-4-13.
	 */

	Matrix.Scale = function (v)
	{
	    if (v.elements.length == 2) {
	        let r = Matrix.I(3);
	        r.elements[0][0] = v.elements[0];
	        r.elements[1][1] = v.elements[1];
	        return r;
	    }

	    if (v.elements.length == 3) {
	        let r = Matrix.I(4);
	        r.elements[0][0] = v.elements[0];
	        r.elements[1][1] = v.elements[1];
	        r.elements[2][2] = v.elements[2];
	        return r;
	    }

	    throw "Invalid length for Scale";
	};

	Matrix.Translation = function (v)
	{
	    if (v.elements.length == 2) {
	        let r = Matrix.I(3);
	        r.elements[2][0] = v.elements[0];
	        r.elements[2][1] = v.elements[1];
	        return r;
	    }

	    if (v.elements.length == 3) {
	        let r = Matrix.I(4);
	        r.elements[0][3] = v.elements[0];
	        r.elements[1][3] = v.elements[1];
	        r.elements[2][3] = v.elements[2];
	        return r;
	    }

	    throw "Invalid length for Translation";
	};

	Matrix.prototype.flatten = function ()
	{
	    let result = [];
	    if (this.elements.length == 0)
	        return [];


	    for (let j = 0; j < this.elements[0].length; j++)
	        for (let i = 0; i < this.elements.length; i++)
	            result.push(this.elements[i][j]);
	    return result;
	};

	Matrix.prototype.ensure4x4 = function()
	{
	    if (this.elements.length == 4 &&
	        this.elements[0].length == 4)
	        return this;

	    if (this.elements.length > 4 ||
	        this.elements[0].length > 4)
	        return null;

	    for (let i = 0; i < this.elements.length; i++) {
	        for (let j = this.elements[i].length; j < 4; j++) {
	            if (i == j)
	                this.elements[i].push(1);
	            else
	                this.elements[i].push(0);
	        }
	    }

	    for (let i = this.elements.length; i < 4; i++) {
	        if (i == 0)
	            this.elements.push([1, 0, 0, 0]);
	        else if (i == 1)
	            this.elements.push([0, 1, 0, 0]);
	        else if (i == 2)
	            this.elements.push([0, 0, 1, 0]);
	        else if (i == 3)
	            this.elements.push([0, 0, 0, 1]);
	    }

	    return this;
	};

	Matrix.prototype.make3x3 = function()
	{
	    if (this.elements.length != 4 ||
	        this.elements[0].length != 4)
	        return null;

	    return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
	        [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
	        [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
	};

	Vector.prototype.flatten = function ()
	{
	    return this.elements;
	};

	Vector.prototype.equal = function (v)
	{
	    return this.e(1)==v.e(1)&&this.e(2)==v.e(2)&&this.e(3)==v.e(3);
	};

	var vs_render = "#version 300 es\nin vec3 vertex;\nout vec2 texCoord;\nvoid main() {\n    texCoord = vertex.xy * 0.5 + 0.5;\n    gl_Position = vec4(vertex, 1.0);\n}";

	var fs_render = "#version 300 es\nprecision highp float;\nuniform sampler2D tex;\nin vec2 texCoord;\nout vec4 color;\nvoid main() {\n    color = texture(tex, texCoord);\n}";

	var vs_trace = "#version 300 es\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nvec3 ortho(vec3 d) {\n\tif (abs(d.x)>0.00001 || abs(d.y)>0.00001) {\n\t\treturn vec3(d.y,-d.x,0.0);\n\t} else  {\n\t\treturn vec3(0.0,d.z,-d.y);\n\t}\n}\nfloat maxComponent(vec3 v){\n    return max(max(v.x,v.y),v.z);\n}\nvoid swap(inout float f1,inout float f2){\n    float tmp = f1;\n    f1 = f2;\n    f2 = tmp;\n}\nin vec3 vertex;\nuniform vec3 eye;\nuniform mat4 matrix;\nout vec3 raydir;\nvoid main() {\n    gl_Position = vec4(vertex, 1.0);\n    raydir = normalize(ensure3byW(matrix*gl_Position)-eye);\n}";

	var fs_trace = "#version 300 es\nprecision highp float;\n#define MAXBOUNCES 5\nuniform vec3 eye;\nuniform int n,ln,tn;\nuniform float textureWeight,timeSinceStart;\nuniform sampler2D objects,texParams;\nuniform sampler2D cache;\nin vec3 raydir;\nout vec4 out_color;\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\n#define OBJECTS_LENGTH 11.0\n#define TEX_PARAMS_LENGTH 6.0\n#define MAX_DISTANCE 1e5\n#define EPSLION 1e-4\n#define PI 3.141592653589793\n#define INVPI 0.3183098861837907\n#define CUBE 1\n#define SPHERE 2\n#define PLANE 3\n#define MATTE 1\n#define MIRROR 2\n#define METAL 3\n#define TRANSPARENT 4\n#define UNIFORM_COLOR 0\n#define CHECKERBOARD 5\n#define CORNELLBOX 6\n#define BLACK vec3(0.0,0.0,0.0)\n#define WHITE vec3(1.0,1.0,1.0)\n#define GREY vec3(0.5,0.5,0.5)\n#define RED vec3(0.75,0.25,0.25)\n#define BLUE vec3(0.1, 0.5, 1.0)\n#define YELLOW vec3(1.0, 0.9, 0.1)\n#define NC 1.0\nfloat random( vec3 scale, float seed ){\n\treturn(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );\n}\nvec2 random2(float seed){\n\treturn vec2(fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453 + seed),\n\t\tfract(cos(dot(gl_FragCoord.xy ,vec2(4.898,7.23))) * 23421.631 + seed));\n}\nvec2 convert(vec2 pos,float width){\n    pos.x = pos.x/width;\n    return pos;\n}\nint readInt(sampler2D tex,vec2 pos,float width){\n    return int(texture(tex,convert(pos,width)).r);\n}\nfloat readFloat(sampler2D tex,vec2 pos,float width){\n    return texture(tex,convert(pos,width)).r;\n}\nbool readBool(sampler2D tex,vec2 pos,float width){\n    return readInt(tex,pos,width)==1;\n}\nvec2 readVec2(sampler2D tex,vec2 pos,float width){\n    vec2 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    return result;\n}\nvec3 readVec3(sampler2D tex,vec2 pos,float width){\n    vec3 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.z = texture(tex,pos).r;\n    return result;\n}\nstruct Cube{\n    vec3 lb;\n    vec3 rt;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n};\nstruct Sphere{\n    vec3 c;\n    float r;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n};\nstruct Plane{\n    vec3 normal;\n    float offset;\n    bool dface;\n    float matIndex;\n    float texIndex;\n    vec3 emission;\n};\nCube parseCube(float index){\n    Cube cube;\n    cube.lb = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    cube.rt = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    cube.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.emission = readVec3(objects,vec2(9.0,index),OBJECTS_LENGTH);\n    return cube;\n}\nSphere parseSphere(float index){\n    Sphere sphere;\n    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    sphere.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.emission = readVec3(objects,vec2(7.0,index),OBJECTS_LENGTH);\n    return sphere;\n}\nPlane parsePlane(float index){\n    Plane plane;\n    plane.normal = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    plane.offset = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    plane.dface = readBool(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    plane.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    plane.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    plane.emission = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);\n    return plane;\n}\nvec3 normalForCube( vec3 hit, Cube cube , float f)\n{\n\tif ( hit.x < cube.lb.x + 0.0001 )\n\t\treturn vec3( -1.0, 0.0, 0.0 ) * f;\n\telse if ( hit.x > cube.rt.x - 0.0001 )\n\t\treturn vec3( 1.0, 0.0, 0.0 ) * f;\n\telse if ( hit.y < cube.lb.y + 0.0001 )\n\t\treturn vec3( 0.0, -1.0, 0.0 ) * f;\n\telse if ( hit.y > cube.rt.y - 0.0001 )\n\t\treturn vec3( 0.0, 1.0, 0.0 ) * f;\n\telse if ( hit.z < cube.lb.z + 0.0001 )\n\t\treturn vec3( 0.0, 0.0, -1.0 ) * f;\n\telse return vec3( 0.0, 0.0, 1.0 ) * f;\n}\nvec3 normalForSphere( vec3 hit, Sphere sphere ){\n\treturn (hit - sphere.c) / sphere.r;\n}\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nvec3 ortho(vec3 d) {\n\tif (abs(d.x)>0.00001 || abs(d.y)>0.00001) {\n\t\treturn vec3(d.y,-d.x,0.0);\n\t} else  {\n\t\treturn vec3(0.0,d.z,-d.y);\n\t}\n}\nfloat maxComponent(vec3 v){\n    return max(max(v.x,v.y),v.z);\n}\nvoid swap(inout float f1,inout float f2){\n    float tmp = f1;\n    f1 = f2;\n    f2 = tmp;\n}\nvoid checkerboard_attr(float texIndex,out float size,out float lineWidth){\n    size = readFloat(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    lineWidth = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 checkerboard(vec3 hit,float texIndex){\n    float size,lineWidth;\n    checkerboard_attr(texIndex,size,lineWidth);\n    float width = 0.5 * lineWidth / size;\n    float fx = hit.x/size-floor(hit.x/size),\n    fy = hit.y/size-floor(hit.y/size),\n    fz = hit.z/size-floor(hit.z/size);\n    bool in_outline = (fx<width||fx>1.0-width)||(fy<width||fy>1.0-width)||(fz<width||fz>1.0-width);\n    if (!in_outline) {\n        return WHITE;\n    } else {\n        return GREY;\n    }\n}\nvoid cornellbox_attr(float texIndex,out vec3 min,out vec3 max){\n    min = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    max = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 cornellbox(vec3 hit,float texIndex){\n    vec3 min,max;\n    cornellbox_attr(texIndex,min,max);\n    if(hit.z==min.z) return BLACK;\n    else if(hit.z==max.z) return WHITE;\n    else if(hit.x==min.x) return RED;\n    else if(hit.x==max.x) return BLUE;\n    else if(hit.y==min.y) return WHITE;\n    else if(hit.y==max.y) return WHITE;\n    if ( hit.x < min.x + 0.0001 )\n    \treturn YELLOW;\n    else if ( hit.x > max.x - 0.0001 )\n    \treturn BLUE;\n    else if ( hit.y < min.y + 0.0001 )\n    \treturn WHITE;\n    else if ( hit.y > max.y - 0.0001 )\n    \treturn WHITE;\n    else if ( hit.z > min.z - 0.0001 )\n    \treturn WHITE;\n    return BLACK;\n}\nvec3 getSurfaceColor(vec3 hit,float texIndex){\n    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);\n    if(texCategory==CHECKERBOARD) return checkerboard(hit,texIndex);\n    else if(texCategory==CORNELLBOX) return cornellbox(hit,texIndex);\n    else if(texCategory==UNIFORM_COLOR) return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    return BLACK;\n}\nstruct Intersect{\n    float d;\n    vec3 hit;\n    vec3 normal;\n    float matIndex;    vec3 sc;    vec3 emission;\n    float seed;    int index;\n};\nIntersect intersectCube(Ray ray,Cube cube){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 tMin = (cube.lb - ray.origin) / ray.dir;\n    vec3 tMax = (cube.rt- ray.origin) / ray.dir;\n    vec3 t1 = min( tMin, tMax );\n    vec3 t2 = max( tMin, tMax );\n    float tNear = max( max( t1.x, t1.y ), t1.z );\n    float tFar = min( min( t2.x, t2.y ), t2.z );\n    float t=-1.0,f;\n    if(tNear>EPSLION&&tNear<tFar) {\n        t = tNear;f = 1.0;\n    }else if(tNear<tFar) {\n        t = tFar;f = -1.0;\n    }\n    if(t > EPSLION){\n        result.d = t;\n        result.hit = ray.origin+t*ray.dir;\n        result.normal = normalForCube(ray.origin+t*ray.dir,cube,f);\n        result.matIndex = cube.matIndex;\n        result.sc = getSurfaceColor(result.hit,cube.texIndex);\n        result.emission = cube.emission;\n    }\n    return result;\n}\nIntersect intersectSphere(Ray ray,Sphere sphere){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 toSphere = ray.origin - sphere.c;\n\tfloat a = dot( ray.dir, ray.dir );\n\tfloat b = 2.0 * dot( toSphere, ray.dir );\n\tfloat c = dot( toSphere, toSphere ) - sphere.r * sphere.r;\n\tfloat det = b * b - 4.0 * a * c;\n\tif ( det > EPSLION ){\n\t    det = sqrt( det );\n\t\tfloat t = (-b - det);\n\t\tif(t < EPSLION) t = (-b + det);\n\t\tt /= 2.0*a;\n\t\tif(t > EPSLION){\n\t        result.d = t;\n    \t\tresult.hit = ray.origin+t*ray.dir;\n    \t\tresult.normal = normalForSphere(ray.origin+t*ray.dir,sphere);\n    \t\tresult.matIndex = sphere.matIndex;\n    \t\tresult.sc = getSurfaceColor(result.hit,sphere.texIndex);\n    \t\tresult.emission = sphere.emission;\n\t\t}\n\t}\n    return result;\n}\nIntersect intersectPlane(Ray ray,Plane plane){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float DN = dot(ray.dir,plane.normal);\n    if(DN==0.0||(!plane.dface&&DN>EPSLION)) return result;\n    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;\n    if(t<EPSLION) return result;\n    result.d = t;\n    result.normal = plane.normal;\n    result.hit = ray.origin+result.d*ray.dir;\n    result.matIndex = plane.matIndex;\n    result.sc = getSurfaceColor(result.hit,plane.texIndex);\n    result.emission = plane.emission;\n    return result;\n}\nIntersect intersectObjects(Ray ray){\n    Intersect ins;\n    ins.d = MAX_DISTANCE;\n    for(int i=0;i<ln+n;i++){\n        Intersect tmp;\n        tmp.d = MAX_DISTANCE;\n        int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);\n        if(category==CUBE){\n            Cube cube = parseCube(float(i)/float(ln+n-1));\n            tmp = intersectCube(ray,cube);\n            tmp.index = i;\n        }else if(category==SPHERE){\n            Sphere sphere = parseSphere(float(i)/float(ln+n-1));\n            tmp = intersectSphere(ray,sphere);\n            tmp.index = i;\n        }else if(category==PLANE){\n            Plane plane = parsePlane(float(i)/float(ln+n-1));\n            tmp = intersectPlane(ray,plane);\n            tmp.index = i;\n        }\n        if(tmp.d<ins.d){\n            ins = tmp;\n        }\n    }\n    return ins;\n}\nbool testShadow(Ray ray){\n    Intersect ins = intersectObjects(ray);\n    if(ins.index>=ln&&ins.d>EPSLION&&ins.d<1.0)\n        return true;\n    return false;\n}\nvoid getCoordinate(vec3 normal,out vec3 sdir,out vec3 tdir){\n\tif ( abs( normal.x ) == 0.0 ){\n\t\tsdir = cross( normal, vec3( 1, 0, 0 ) );\n\t} else {\n\t    sdir = cross( normal, vec3( 0, 1, 0 ) );\n\t}\n\ttdir = cross( normal, sdir );\n}\nvec3 toLocalityCoordinate(vec3 sdir,vec3 tdir,vec3 normal,vec3 w){\n    return vec3(dot(w,sdir),dot(w,tdir),dot(w,normal));\n}\nvec3 toWorldCoordinate(vec3 sdir,vec3 tdir,vec3 normal,vec3 w){\n    return w.x*sdir+w.y*tdir+w.z*normal;\n}\nvec3 uniformlyRandomDirection( float seed ){\n\tfloat u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3( r * cos( angle ), r * sin( angle ), z );\n}\nvec3 uniformlyRandomVector( float seed ){\n\treturn uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));\n}\nvec3 cosWeightHemisphere(float seed){\n    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat r = sqrt(u);\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3(r*cos(angle),r*sin(angle),sqrt(1.-u));\n}\nvec3 sampleRectangle(Intersect ins,vec3 min,vec3 x,vec3 y,out float pdf){\n     float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );\n     float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );\n     pdf = 1.0/(length(x)*length(y));\n     return min+u1*x+u2*y;\n}\nvec3 sampleGeometry(Intersect ins,int i,out vec3 fpdf){\n    fpdf = BLACK;\n    int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);\n    vec3 result = BLACK;\n    if(category==CUBE){\n        float pdf;\n        Cube cube = parseCube(float(i)/float(ln+n-1));\n        vec3 x = vec3(cube.rt.x-cube.lb.x,0.0,0.0);\n        vec3 y = vec3(0.0,0.0,cube.rt.z-cube.lb.z);\n        result = sampleRectangle(ins,cube.lb,x,y,pdf);\n        vec3 normal = normalForCube(result,cube,1.0);\n        fpdf = cube.emission*max(0.0,dot(normal,ins.hit-result))/pdf;\n    }else if(category==SPHERE){\n    }\n    else if(category==PLANE){\n    }\n    return result;\n}\nstruct Lambertian{\n    float kd;\n    vec3 cd;\n};\nvec3 lambertian_f(Lambertian l,const vec3 wi,const vec3 wo){\n    return l.kd * l.cd * PI;\n}\nvec3 lambertian_sample_f(Lambertian l,float seed,out vec3 wi, vec3 wo, out float pdf){\n\twi = cosWeightHemisphere(seed);\n\tpdf = PI;\n\treturn lambertian_f(l,wi,wo);\n}\nstruct Reflective{\n    float kr;\n    vec3 cr;\n};\nvec3 reflective_f(Reflective r,const vec3 wi,const vec3 wo){\n    return r.kr*r.cr;\n}\nvec3 reflective_sample_f(Reflective r,out vec3 wi, vec3 wo, out float pdf){\n\twi = vec3(-wo.x,-wo.y,wo.z);\n\tpdf = 1.0;\n\treturn reflective_f(r,wi,wo);\n}\nstruct Ward{\n    float ax, ay;\n    float invax2, invay2;\n    float const2;\n    vec3 rs;\n};\nvec3 ward_f(Ward w,const vec3 wi,const vec3 wo){\n    return w.rs;\n}\nvec3 ward_sample_f(Ward w,float seed,out vec3 wi, vec3 wo, out float pdf){\n    vec3 h;\n    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat phi = atan(w.ay*tan(2.0*PI*u2)/w.ax);\n\tfloat cosPhi = cos(phi);\n\tfloat sinPhi = sqrt(1.0-cosPhi*cosPhi);\n\tfloat theta = atan(sqrt(-log(u1)/(cosPhi*cosPhi*w.invax2 + sinPhi*sinPhi*w.invay2)));\n\th.z = cos(theta);\n\tfloat cosTheta2 = h.z*h.z;\n\tfloat sinTheta = sqrt(1.0-cosTheta2);\n\tfloat tanTheta2 = (1.0-cosTheta2)/cosTheta2;\n\th.x = cosPhi*sinTheta;\n\th.y = sinPhi*sinTheta;\n\tif(dot(wo,h)<EPSLION) h=-h;\n\twi = reflect(-wo,h);\n\tif(wi.z<=0.f) wi.z = -wi.z;\n\tpdf = 1.0;\treturn ward_f(w,wi,wo);\n}\nstruct Refractive{\n    vec3 rc;\n    float F0;\n    float nt;\n};\nvec3 refractive_sample_f(Refractive r,float seed,out vec3 wi, vec3 wo, out float pdf){\n    bool into = wo.z < EPSLION;\n    float nnt = into ? NC / r.nt : r.nt / NC;\n    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n    vec3 n = vec3(0,0,1.0);\n    float ddn = dot(wo,n);\n\tfloat sin2t = (1.0 - ddn * ddn) * nnt * nnt;\n\tfloat sint = sqrt(sin2t);\n\tfloat cost = sqrt(1.0 - sin2t);\n\tvec3 refr = n * (-1.0 * cost) + normalize(-wo + n * ddn) * sint;\n\tfloat c = 1.0 - (into ? ddn : dot(refr,n) * -1.0);\n    float Fe = r.F0 + (1.0 - r.F0) * c * c * c * c * c;\n    float Fr = 1.0 - Fe;\n    if (u < Fe){\n        wi = vec3(-wo.x,-wo.y,wo.z);\n        pdf = Fe;\n        return Fe * r.rc;\n    }\n    else{\n        wi = refr;\n        pdf = Fr;\n        return Fr * r.rc;\n    }\n}\nvoid matte_attr(float matIndex,out Lambertian l){\n    l.kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 matte(Intersect ins,vec3 wo,out vec3 wi){\n    vec3 f;\n    float pdf;\n    Lambertian diffuse_brdf;\n    matte_attr(ins.matIndex,diffuse_brdf);\n    diffuse_brdf.cd = ins.sc;\n    f = lambertian_sample_f(diffuse_brdf,ins.seed,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 matte_f(Intersect ins,vec3 wo,vec3 wi){\n    Lambertian diffuse_brdf;\n    matte_attr(ins.matIndex,diffuse_brdf);\n    diffuse_brdf.cd = ins.sc;\n    return lambertian_f(diffuse_brdf,wi,wo);\n}\nvoid mirror_attr(float matIndex,out Reflective r){\n    r.kr = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 mirror(Intersect ins,vec3 wo,out vec3 wi){\n    vec3 f;\n    float pdf;\n    Reflective specular_brdf;\n    mirror_attr(ins.matIndex,specular_brdf);\n    specular_brdf.cr = ins.sc;\n    f = reflective_sample_f(specular_brdf,wi,wo,pdf);\n    return f/pdf;\n}\nvoid metal_attr(float matIndex,out Ward w){\n    w.ax = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    w.ay = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n    w.invax2 = readFloat(texParams,vec2(3.0,matIndex),TEX_PARAMS_LENGTH);\n    w.invay2 = readFloat(texParams,vec2(4.0,matIndex),TEX_PARAMS_LENGTH);\n    w.const2 = readFloat(texParams,vec2(5.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 metal(Intersect ins,vec3 wo,out vec3 wi){\n    vec3 f;\n    float pdf;\n    Ward ward_brdf;\n    metal_attr(ins.matIndex,ward_brdf);\n    ward_brdf.rs = ins.sc;\n    f = ward_sample_f(ward_brdf,ins.seed,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 metal_f(Intersect ins,vec3 wo,vec3 wi){\n    Ward ward_brdf;\n    metal_attr(ins.matIndex,ward_brdf);\n    ward_brdf.rs = ins.sc;\n    return ward_f(ward_brdf,wi,wo);\n}\nvoid transparent_attr(float matIndex,out Refractive r){\n    r.nt = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    r.F0 = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 transparent(Intersect ins,vec3 wo,out vec3 wi){\n    vec3 f;\n    float pdf;\n    Refractive refractive_brdf;\n    transparent_attr(ins.matIndex,refractive_brdf);\n    refractive_brdf.rc = ins.sc;\n    f = refractive_sample_f(refractive_brdf,ins.seed,wi,wo,pdf);\n    return f/pdf;\n}\nvec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){\n    int matCategory = readInt(texParams,vec2(0.0,ins.matIndex),TEX_PARAMS_LENGTH);\n    vec3 sdir,tdir,f,direct = BLACK,_fpdf;\n    getCoordinate(ins.normal,sdir,tdir);\n    wo = toLocalityCoordinate(sdir,tdir,ins.normal,wo);\n    if(matCategory == MATTE){\n        fpdf = matte(ins,wo,wi);\n        f = matte_f(ins,wo,wi);\n    }else if(matCategory == MIRROR)\n        fpdf = mirror(ins,wo,wi);\n    else if(matCategory == METAL){\n        fpdf = metal(ins,wo,wi);\n        f = metal_f(ins,wo,wi);\n    }else if(matCategory == TRANSPARENT)\n        fpdf = transparent(ins,wo,wi);\n    wi = toWorldCoordinate(sdir,tdir,ins.normal,wi);\n    if(ins.index>=ln&&matCategory!=MIRROR&&matCategory!=TRANSPARENT)\n        for(int i=0;i<ln;i++){\n            vec3 light = sampleGeometry(ins,i,_fpdf);\n            vec3 toLight = light - ins.hit;\n            float d = length(toLight);\n            if(!testShadow(Ray(ins.hit + ins.normal * 0.0001, toLight)))\n                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);\n        }\n    return ins.emission+direct;\n}\nvoid trace(inout Ray ray,out vec3 e,int maxDeepth){\n    vec3 fpdf = WHITE;e = BLACK;\n    int deepth=0;\n    while(deepth<maxDeepth){\n        ++deepth;\n        Intersect ins = intersectObjects(ray);\n        ins.seed = timeSinceStart + float(deepth);\n        if(ins.d==MAX_DISTANCE) break;\n        float p = maxComponent(fpdf);\n        if(++deepth>maxDeepth){\n            if(random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed )<p) fpdf/=p;\n            else{\n                e += ins.emission*fpdf;\n                break;\n            }\n        }\n        vec3 wi;\n        vec3 _fpdf;\n        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;\n        fpdf *= _fpdf;\n        ray.origin = ins.hit;\n        ray.dir = wi;\n    }\n}\nvoid main() {\n    int deepth;\n    vec3 e;\n    Ray ray = Ray(eye,raydir);\n    trace(ray,e,MAXBOUNCES);\n    vec3 texture = texture( cache, gl_FragCoord.xy/512.0 ).rgb;\n    out_color = vec4(mix(e, texture, textureWeight),1.0);\n}\n";

	/**
	 * Created by eason on 17-3-21.
	 */

	/**
	 * Created by eason on 17-3-15.
	 */
	class ShaderProgram {
	    constructor(vshader,fshader,hasFrameBuffer=false) {
	        this.uniforms = {};
	        this.hasFrameBuffer = hasFrameBuffer;
	        this.textures = {};
	        this.run = false;

	        this.vertexBuffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	            -1, -1,
	            -1, +1,
	            +1, -1,
	            +1, +1
	        ]), gl.STATIC_DRAW);

	        if(hasFrameBuffer){
	            this.framebuffer = gl.createFramebuffer();

	            if(!ShaderProgram.frameCache) {
	                ShaderProgram.frameCache = [];

	                let type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;

	                gl.activeTexture(gl.TEXTURE0);
	                for(let i = 0; i < 2; i++) {
	                    ShaderProgram.frameCache.push(WebglHelper.createTexture());
	                    WebglHelper.setTexture(
	                        ShaderProgram.frameCache[i],0,
	                        512,512,gl.RGB,gl.RGB,type,null
	                    );
	                }
	            }
	        }

	        this.program = WebglHelper.createProgram(vshader, fshader);

	        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
	        gl.enableVertexAttribArray(this.vertexAttribute);
	    }

	    render(uniforms=true,textures=true){
	        gl.useProgram(this.program);

	        if(!this.run) {
	            this._updateUniforms();
	            this._updateTextures();
	            this._updateVBO();
	            this.run = true;
	        }else{
	            if(uniforms) this._updateUniforms();
	            if(textures) this._updateTextures();
	        }

	        if(this.hasFrameBuffer){
	            gl.activeTexture(gl.TEXTURE0);
	            gl.bindTexture(gl.TEXTURE_2D, ShaderProgram.frameCache[0]);
	            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ShaderProgram.frameCache[1], 0);
	        }

	        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

	        if(this.hasFrameBuffer){
	            ShaderProgram.frameCache.reverse();
	        }
	    }

	    _updateUniforms(){
	        for(let entry of Object.entries(this.uniforms)) {
	            let location = gl.getUniformLocation(this.program, entry[0]);
	            if(location == null||!entry[1]) continue;
	            if(entry[1] instanceof Vector) {
	                gl.uniform3fv(location, new Float32Array([entry[1].elements[0], entry[1].elements[1], entry[1].elements[2]]));
	            } else if(entry[1] instanceof Matrix) {
	                gl.uniformMatrix4fv(location, false, new Float32Array(entry[1].flatten()));
	            } else if(entry[1][0]=='int'){
	                gl.uniform1i(location, entry[1][1]);
	            } else if(entry[1][0]=='float'){
	                gl.uniform1f(location, entry[1][1]);
	            } else {
	                gl.uniform1f(location, entry[1]);
	            }
	        }
	    }

	    _updateTextures(){
	        for(let entry of Object.entries(this.textures)) {
	            let location = gl.getUniformLocation(this.program, entry[0]);
	            if(location == null) continue;

	            gl.uniform1i(location,entry[1]);
	        }
	    }

	    _updateVBO(){
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	        gl.vertexAttribPointer(this.vertexAttribute, 2, gl.FLOAT, false, 0, 0);
	    }
	}

	ShaderProgram.OBJECTS_LENGTH = 12;
	ShaderProgram.TEXPARAMS_LENGTH = 7;

	class WebglHelper {
	    static createTexture(){
	        return gl.createTexture();
	    }

	    static setTexture(texture,unitID,width,height,internalFormat,format,type,data,npot){
	        gl.activeTexture(gl.TEXTURE0+unitID);

	        gl.bindTexture(gl.TEXTURE_2D, texture);
	        if(npot){
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	        }else{
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	        }
	        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
	    }

	    static clearScreen(){
	        gl.clearColor(0.0,0.0,0.0,1.0);
	        gl.clear(gl.COLOR_BUFFER_BIT);
	    }

	    static createProgram(vshader, fshader){
	        let vertexShader = WebglHelper.loadShader(gl.VERTEX_SHADER, vshader);
	        let fragmentShader = WebglHelper.loadShader(gl.FRAGMENT_SHADER, fshader);
	        if (!vertexShader || !fragmentShader) {
	            return null;
	        }

	        let program = gl.createProgram();
	        if (!program) {
	            return null;
	        }

	        gl.attachShader(program, vertexShader);
	        gl.attachShader(program, fragmentShader);

	        gl.linkProgram(program);

	        let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
	        if (!linked) {
	            let error = gl.getProgramInfoLog(program);
	            console.log('Failed to link program: ' + error);
	            gl.deleteProgram(program);
	            gl.deleteShader(fragmentShader);
	            gl.deleteShader(vertexShader);
	            return null;
	        }
	        return program;
	    }

	    static loadShader(type, source) {
	        let shader = gl.createShader(type);
	        if (shader == null) {
	            console.log('unable to create shader');
	            return null;
	        }
	        gl.shaderSource(shader, source);

	        gl.compileShader(shader);

	        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	        if (!compiled) {
	            let error = gl.getShaderInfoLog(shader);
	            console.log('Failed to compile shader: ' + error);
	            gl.deleteShader(shader);
	            return null;
	        }

	        return shader;
	    }

	    static initWebgl(canvas){
	        window.gl = null;

	        try {
	            gl = canvas.getContext("webgl2");
	        }
	        catch(e) {}
	        if (!gl) {
	            alert("WebGL2初始化失败，可能是因为您的浏览器不支持。");
	            gl = null;
	        }
	        return gl;
	    }
	}

	/**
	 * Created by eason on 17-3-21.
	 */
	class Tracer {
	    constructor(){
	        this.shader = new ShaderProgram(vs_trace,fs_trace,true);
	        this.timeStart = new Date();

	        this.shader.textures.cache = 0;
	        this.shader.textures.objects = 1;
	        this.shader.textures.texParams = 2;

	        this.objects_tex = {};
	        this.params_tex = {};
	    }

	    update(data){
	        let data_objects = new Float32Array(data.objects);//物体数据
	        let data_texparams = new Float32Array(data.texparams);//材质参数

	        let n = parseInt(data.objects.length/ShaderProgram.OBJECTS_LENGTH);
	        let tn = parseInt(data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH);

	        this.objects_tex = WebglHelper.createTexture();
	        this.params_tex = WebglHelper.createTexture();
	        WebglHelper.setTexture(
	            this.objects_tex,1,
	            ShaderProgram.OBJECTS_LENGTH, n,
	            gl.R32F,gl.RED,gl.FLOAT,data_objects,true
	        );
	        WebglHelper.setTexture(
	            this.params_tex,2,
	            ShaderProgram.TEXPARAMS_LENGTH, tn,
	            gl.R32F,gl.RED,gl.FLOAT,data_texparams,true
	        );

	        this.shader.uniforms.n = ['int',data.n];
	        this.shader.uniforms.ln = ['int',data.ln];
	        this.shader.uniforms.tn = ['int',tn];
	    }

	    render(modelviewProjection,eye,sampleCount){
	        this.shader.uniforms.eye = eye;
	        this.shader.uniforms.matrix = Matrix.Translation(
	            Vector.create([(Math.random() * 2 - 1), (Math.random() * 2 - 1), 0]).multiply(1/512)
	        ).multiply(modelviewProjection).inverse();
	        this.shader.uniforms.textureWeight = sampleCount===0?0.0001:sampleCount / (sampleCount + 1);
	        this.shader.uniforms.timeSinceStart = (new Date() - this.timeStart) * 0.001;

	        this.shader.render();
	    }
	}

	/**
	 * Created by eason on 17-3-21.
	 */
	class Renderer {
	    constructor(canvas){
	        WebglHelper.initWebgl(canvas);

	        this.shader = new ShaderProgram(vs_render,fs_render);

	        this.tracer = new Tracer();

	        this.data={objects:[],texparams:[],ln:0,n:0};
	    }

	    update(scene){
	        for(let light of scene.lights){
	            this.data.objects.push(...light.gen(this.data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH));
	            this.data.texparams.push(...light.genTexparams());
	        }
	        for(let object of scene.objects){
	            this.data.objects.push(...object.gen(this.data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH));
	            this.data.texparams.push(...object.genTexparams());
	        }
	        this.data.ln = scene.lights.length;
	        this.data.n = scene.objects.length;
	        this.tracer.update(this.data);
	    }

	    render(scene){
	        WebglHelper.clearScreen();
	        this.tracer.render(scene.mat,scene.eye,scene.sampleCount);
	        this.shader.render();
	        scene.sampleCount++;
	    }
	}

	/**
	 * Created by eason on 17-4-12.
	 */
	class Camera {
	    constructor(eye, center, up=[0,1,0]){
	        this.eye = $V(eye);
	        this.center = $V(center);
	        this.up = $V(up);

	        this.makePerspective();
	        this.makeLookAt();
	    }

	    makePerspective(fovy=55, aspect=1, znear=10, zfar=100){
	        let top = znear * Math.tan(fovy * Math.PI / 360.0);
	        let bottom = -top;
	        let left = bottom * aspect;
	        let right = top * aspect;

	        let X = 2*znear/(right-left);
	        let Y = 2*znear/(top-bottom);
	        let A = (right+left)/(right-left);
	        let B = (top+bottom)/(top-bottom);
	        let C = -(zfar+znear)/(zfar-znear);
	        let D = -2*zfar*znear/(zfar-znear);

	        this.projection = $M([
	            [X, 0, A, 0],
	            [0, Y, B, 0],
	            [0, 0, C, D],
	            [0, 0, -1, 0]
	        ]);
	    }

	    makeLookAt(){
	        let z = this.eye.subtract(this.center).toUnitVector();
	        let x = this.up.cross(z).toUnitVector();
	        let y = z.cross(x).toUnitVector();
	        x = x.x(-1);

	        let m = $M([
	            [x.e(1), x.e(2), x.e(3), 0],
	            [y.e(1), y.e(2), y.e(3), 0],
	            [z.e(1), z.e(2), z.e(3), 0],
	            [0, 0, 0, 1]
	        ]);

	        let t = $M([
	            [1, 0, 0, -this.eye.e(1)],
	            [0, 1, 0, -this.eye.e(2)],
	            [0, 0, 1, -this.eye.e(3)],
	            [0, 0, 0, 1]
	        ]);

	        this.modelview = m.x(t);
	    }

	    update(){
	        this.makeLookAt();
	    }
	}

	/**
	 * Created by eason on 17-4-11.
	 */
	class Cube{
	    constructor(min,max,material,texture,emission=[0,0,0]){
	        this.min = $V(min);
	        this.max = $V(max);
	        this.material = material;
	        this.texture = texture;
	        this.emission = $V(emission);

	        if(this.emission.equal($V([0,0,0]))){
	            this.light = false;
	        }else this.light = true;
	    }

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp = [
	            1,
	            this.min.e(1),this.min.e(2),this.min.e(3),
	            this.max.e(1),this.max.e(2),this.max.e(3),
	            texparamID,texparamID+1,
	            this.emission.e(1),this.emission.e(2),this.emission.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Sphere{
	    constructor(c,r,material,texture,emission=[0,0,0]){
	        this.c = $V(c);
	        this.r = r;
	        this.material = material;
	        this.texture = texture;
	        this.emission = $V(emission);

	        if(this.emission.equal($V([0,0,0]))){
	            this.light = false;
	        }else this.light = true;
	    }

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp = [
	            2,
	            this.c.e(1),this.c.e(2),this.c.e(3),
	            this.r,texparamID,texparamID+1,
	            this.emission.e(1),this.emission.e(2),this.emission.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Plane{
	    constructor(normal,offset,dface=false,material,texture,emission=[0,0,0]){
	        this.normal = $V(normal).toUnitVector();
	        this.offset = offset;
	        this.dface = dface?1:0;
	        this.material = material;
	        this.texture = texture;
	        this.emission = $V(emission);

	        if(this.emission.equal($V([0,0,0]))){
	            this.light = false;
	        }else this.light = true;
	    }

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp = [
	            3,
	            this.normal.e(1),this.normal.e(2),this.normal.e(3),
	            this.offset,this.dface,texparamID,texparamID+1,
	            this.emission.e(1),this.emission.e(2),this.emission.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	/**
	 * Created by eason on 17-4-12.
	 */
	class Scene {
	    constructor(){
	        this.camera = {};
	        this.lights = [];
	        this.objects = [];
	        this.sampleCount = 0;
	    }

	    get mat(){
	        return this.camera.projection.x(this.camera.modelview);
	    }

	    get eye(){
	        return this.camera.eye;
	    }

	    add(something){
	        if(something instanceof Camera){
	            this.camera = something;
	        }else if(something instanceof Cube||
	            something instanceof Sphere||
	            something instanceof Plane){
	            if(something.light) this.lights.push(something);
	            else this.objects.push(something);
	        }
	    }

	    update(){
	        this.camera.update();
	        scene.sampleCount = 0;
	    }
	}

	/**
	 * Created by eason on 17-5-12.
	 */

	class Matte{
	    constructor(kd=1){
	        if(kd<=0) kd=1;
	        this.kd = kd;
	    }

	    gen(){
	        let tmp = [
	            1,this.kd
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Mirror{
	    constructor(kr=1.0){
	        if(kr<=0) kr=0.5;
	        this.kr = kr;
	    }

	    gen(){
	        let tmp = [
	            2,this.kr
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Metal{
	    constructor(ax=1,ay=1){
	        this.ax = ax;
	        this.ay = ay;
	        this.invax2 = 1/(ax*ax);
	        this.invay2 = 1/(ay*ay);
	        this.const2 = 4*Math.PI*ax*ay;
	    }

	    gen(){
	        let tmp = [
	            3,this.ax,this.ay,this.invax2,this.invay2,this.const2
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Transparent{
	    constructor(nt){
	        this.nt = nt;
	        this.F0 = (1.0 - nt) * (1.0 - nt) / ((1.0 + nt) * (1.0 + nt));
	    }

	    gen(){
	        let tmp = [
	            4,this.nt,this.F0
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	/**
	 * Created by eason on 17-5-12.
	 */
	class Color{
	    static create(color){
	        return new UniformColor(color);
	    }
	}

	class UniformColor{
	    constructor(color){
	        this.color = $V(color);
	    }

	    gen(){
	        let tmp = [
	            0,this.color.e(1),this.color.e(2),this.color.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Checkerboard{
	    constructor(size=0.3,lineWidth=0.03){
	        if(size<=0) size=0.3;
	        if(lineWidth<0) lineWidth=0.03;

	        this.size = size;
	        this.lineWidth = lineWidth;
	    }

	    gen(){
	        let tmp = [
	            5,this.size,this.lineWidth
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class CornellBox{
	    constructor(min,max){
	        this.min = $V(min);
	        this.max = $V(max);
	    }

	    gen(){
	        let tmp = [
	            6,this.min.e(1),this.min.e(2),this.min.e(3),
	            this.max.e(1),this.max.e(2),this.max.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.TEXPARAMS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	/**
	 * Created by eason on 17-4-26.
	 */
	function addEvent(obj,xEvent,fn) {
	    if(obj.attachEvent){
	        obj.attachEvent('on'+xEvent,fn);
	    }else{
	        obj.addEventListener(xEvent,fn,false);
	    }
	}

	function elementPos(element) {
	    let x = 0, y = 0;
	    while(element.offsetParent) {
	        x += element.offsetLeft;
	        y += element.offsetTop;
	        element = element.offsetParent;
	    }
	    return { x: x, y: y };
	}

	function eventPos(event) {
	    return {
	        x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
	        y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
	    };
	}

	function canvasMousePos(event,canvas) {
	    let mousePos = eventPos(event);
	    let canvasPos = elementPos(canvas);
	    return {
	        x: mousePos.x - canvasPos.x,
	        y: mousePos.y - canvasPos.y
	    };
	}

	class Control{
	    constructor(canvas,scene){
	        this.scene = scene;
	        this.canvas = canvas;

	        this.mouseDown = false;
	        this.R = this.scene.camera.eye.distanceFrom(this.scene.camera.center);
	        this.angleX = Math.asin((this.scene.camera.eye.e(2)-this.scene.camera.center.e(2))/this.R);
	        this.angleY = Math.acos((this.scene.camera.eye.e(3)-this.scene.camera.center.e(3))/(this.R*Math.cos(this.angleX)));
	        if(this.scene.camera.eye.e(1)-this.scene.camera.center.e(1)<0) this.angleY = -this.angleY;

	        this.onmousedown();
	        this.onmousemove();
	        this.onmouseup();
	        this.onmousewheel();
	    }

	    __onmousedown(fn){
	        return (event)=>{
	            let mouse = canvasMousePos(event,this.canvas);
	            this.oldX = mouse.x;
	            this.oldY = mouse.y;
	            if(mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
	                this.mouseDown = true;
	                fn();
	            }

	            return true;
	        };
	    }

	    __onmousemove(fn){
	        return (event)=>{
	            let mouse = canvasMousePos(event,this.canvas);
	            if(this.mouseDown) {
	                this.angleY += -(this.oldX-mouse.x) * 0.01;
	                this.angleX += -(this.oldY-mouse.y) * 0.01;

	                this.angleX = Math.max(this.angleX, -Math.PI / 2 + 0.01);
	                this.angleX = Math.min(this.angleX, Math.PI / 2 - 0.01);

	                this.scene.camera.eye = $V([
	                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
	                    this.R * Math.sin(this.angleX),
	                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
	                ]).add(this.scene.camera.center);

	                this.oldX = mouse.x;
	                this.oldY = mouse.y;

	                fn();
	                this.scene.update();
	            }
	        };
	    }

	    __onmouseup(fn){
	        return (event)=>{
	            this.mouseDown = false;
	            fn();
	        }
	    }

	    __onmousewheel(fn){
	        return (event)=>{
	            let ev = event || window.event;
	            let down = true;
	            down = ev.wheelDelta?ev.wheelDelta<0:ev.detail>0;
	            if(!down){
	                this.R*=0.9;
	                this.scene.camera.eye = $V([
	                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
	                    this.R * Math.sin(this.angleX),
	                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
	                ]).add(this.scene.camera.center);
	            }else{
	                this.R*=1.1;
	                this.scene.camera.eye = $V([
	                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
	                    this.R * Math.sin(this.angleX),
	                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
	                ]).add(this.scene.camera.center);
	            }
	            fn();
	            this.scene.update();
	            if(ev.preventDefault){
	                ev.preventDefault();
	            }
	            return false;
	        }
	    }

	    onmousedown(fn=()=>{}){
	        addEvent(document,'mousedown',this.__onmousedown(fn));
	    }

	    onmousemove(fn=()=>{}){
	        addEvent(document,'mousemove',this.__onmousemove(fn));
	    }

	    onmouseup(fn=()=>{}){
	        addEvent(document,'mouseup',this.__onmouseup(fn));
	    }

	    onmousewheel(fn=()=>{}){
	        addEvent(this.canvas,'mousewheel',this.__onmousewheel(fn));
	        addEvent(this.canvas,'DOMMouseScroll',this.__onmousewheel(fn));
	    }
	}

	/**
	 * Created by eason on 17-4-12.
	 */

	window.Sail = {
	    Renderer:Renderer,
	    Scene:Scene,
	    Cube:Cube,
	    Sphere:Sphere,
	    Plane:Plane,
	    Camera:Camera,
	    Control:Control,
	    Matte:Matte,
	    Mirror:Mirror,
	    Metal:Metal,
	    Transparent:Transparent,
	    Color:Color,
	    Checkerboard:Checkerboard,
	    CornellBox:CornellBox
	};

})));
