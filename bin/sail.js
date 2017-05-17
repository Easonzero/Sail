(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	/**
	 * Created by eason on 17-4-13.
	 */
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

	var vs_render = "#version 300 es\nin vec3 vertex;\nout vec2 texCoord;\nvoid main() {\n    texCoord = vertex.xy * 0.5 + 0.5;\n    gl_Position = vec4(vertex, 1.0);\n}";

	var fs_render = "#version 300 es\nprecision highp float;\nuniform sampler2D tex;\nin vec2 texCoord;\nout vec4 color;\nvoid main() {\n    color = texture(tex, texCoord);\n}";

	var vs_trace = "#version 300 es\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nvec3 ortho(vec3 d) {\n\tif (abs(d.x)>0.00001 || abs(d.y)>0.00001) {\n\t\treturn vec3(d.y,-d.x,0.0);\n\t} else  {\n\t\treturn vec3(0.0,d.z,-d.y);\n\t}\n}\nfloat maxComponent(vec3 v){\n    return max(max(v.x,v.y),v.z);\n}\nvoid swap(inout float f1,inout float f2){\n    float tmp = f1;\n    f1 = f2;\n    f2 = tmp;\n}\nfloat frDielectric(float cosThetaI, float etaI, float etaT) {\n    cosThetaI = clamp(cosThetaI, -1.0, 1.0);\n    bool entering = cosThetaI > 0.0;\n    if (!entering) {\n        swap(etaI, etaT);\n        cosThetaI = abs(cosThetaI);\n    }\n    float sinThetaI = sqrt(max(0.0, 1.0 - cosThetaI * cosThetaI));\n    float sinThetaT = etaI / etaT * sinThetaI;\n    if (sinThetaT >= 1.0) return 1.0;\n    float cosThetaT = sqrt(max(0.0, 1.0 - sinThetaT * sinThetaT));\n    float Rparl = ((etaT * cosThetaI) - (etaI * cosThetaT)) /\n                  ((etaT * cosThetaI) + (etaI * cosThetaT));\n    float Rperp = ((etaI * cosThetaI) - (etaT * cosThetaT)) /\n                  ((etaI * cosThetaI) + (etaT * cosThetaT));\n    return (Rparl * Rparl + Rperp * Rperp) / 2.0;\n}\nvec3 frConductor(float cosThetaI, const vec3 etai,\n                     const vec3 etat, const vec3 k){\n    cosThetaI = clamp(cosThetaI, -1.0, 1.0);\n    vec3 eta = etat / etai;\n    vec3 etak = k / etai;\n    float cosThetaI2 = cosThetaI * cosThetaI;\n    float sinThetaI2 = 1.0 - cosThetaI2;\n    vec3 eta2 = eta * eta;\n    vec3 etak2 = etak * etak;\n    vec3 t0 = eta2 - etak2 - sinThetaI2;\n    vec3 a2plusb2 = sqrt(t0 * t0 + 4.0 * eta2 * etak2);\n    vec3 t1 = a2plusb2 + cosThetaI2;\n    vec3 a = sqrt(0.5 * (a2plusb2 + t0));\n    vec3 t2 = 2.0 * cosThetaI * a;\n    vec3 Rs = (t1 - t2) / (t1 + t2);\n    vec3 t3 = cosThetaI2 * a2plusb2 + sinThetaI2 * sinThetaI2;\n    vec3 t4 = t2 * sinThetaI2;\n    vec3 Rp = Rs * (t3 - t4) / (t3 + t4);\n    return 0.5 * (Rp + Rs);\n}\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\nin vec3 vertex;\nuniform vec3 eye;\nuniform vec3 test;\nuniform mat4 matrix;\nout vec3 rayd;\nvoid main() {\n    gl_Position = vec4(vertex, 1.0);\n    rayd = normalize(ensure3byW(matrix*gl_Position)-eye);\n}";

	var fs_trace = "#version 300 es\nprecision highp float;\n#define EBOUNCES 3\n#define LBOUNCES 2\n#define MAXLIGHTSNUM 4\n#define RR_THRESH 0.5\nuniform vec3 eye;\nuniform int on,ln,tn,pn;\nuniform float textureWeight,timeSinceStart;\nuniform sampler2D objects,pCache,texParams;\nuniform sampler2D cCache;\nuniform sampler2D tex1,tex2,tex3,tex4;\nin vec3 rayd;\nout vec4 out_color;\n#define OBJECTS_LENGTH 10.0\n#define PCACHE_LENGTH 2.0\n#define TEX_PARAMS_LENGTH 5.0\n#define MAX_DISTANCE 100000.0\n#define PI 3.141592653589793\n#define INVPI 0.3183098861837907\n#define FACE 0\n#define CUBE 1\n#define SPHERE 2\n#define PLANE 3\n#define POINT_LIGHT 0\n#define RECT_LIGHT 1\n#define SPOT_LIGHT 2\n#define DIRECT_LIGHT 3\n#define AMBIENT_LIGHT 4\n#define MATTE 1\n#define REFLECTIVE 2\n#define UNIFORM_COLOR 0\n#define CHECKERBOARD 5\n#define BLACK vec3(0.0,0.0,0.0)\n#define WHITE vec3(1.0,1.0,1.0)\n#define GREY vec3(0.5,0.5,0.5)\nfloat random( vec3 scale, float seed ){\n\treturn(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );\n}\nvec2 random2(float seed){\n\treturn vec2(fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453 + seed),\n\t\tfract(cos(dot(gl_FragCoord.xy ,vec2(4.898,7.23))) * 23421.631 + seed));\n}\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nvec3 ortho(vec3 d) {\n\tif (abs(d.x)>0.00001 || abs(d.y)>0.00001) {\n\t\treturn vec3(d.y,-d.x,0.0);\n\t} else  {\n\t\treturn vec3(0.0,d.z,-d.y);\n\t}\n}\nfloat maxComponent(vec3 v){\n    return max(max(v.x,v.y),v.z);\n}\nvoid swap(inout float f1,inout float f2){\n    float tmp = f1;\n    f1 = f2;\n    f2 = tmp;\n}\nfloat frDielectric(float cosThetaI, float etaI, float etaT) {\n    cosThetaI = clamp(cosThetaI, -1.0, 1.0);\n    bool entering = cosThetaI > 0.0;\n    if (!entering) {\n        swap(etaI, etaT);\n        cosThetaI = abs(cosThetaI);\n    }\n    float sinThetaI = sqrt(max(0.0, 1.0 - cosThetaI * cosThetaI));\n    float sinThetaT = etaI / etaT * sinThetaI;\n    if (sinThetaT >= 1.0) return 1.0;\n    float cosThetaT = sqrt(max(0.0, 1.0 - sinThetaT * sinThetaT));\n    float Rparl = ((etaT * cosThetaI) - (etaI * cosThetaT)) /\n                  ((etaT * cosThetaI) + (etaI * cosThetaT));\n    float Rperp = ((etaI * cosThetaI) - (etaT * cosThetaT)) /\n                  ((etaI * cosThetaI) + (etaT * cosThetaT));\n    return (Rparl * Rparl + Rperp * Rperp) / 2.0;\n}\nvec3 frConductor(float cosThetaI, const vec3 etai,\n                     const vec3 etat, const vec3 k){\n    cosThetaI = clamp(cosThetaI, -1.0, 1.0);\n    vec3 eta = etat / etai;\n    vec3 etak = k / etai;\n    float cosThetaI2 = cosThetaI * cosThetaI;\n    float sinThetaI2 = 1.0 - cosThetaI2;\n    vec3 eta2 = eta * eta;\n    vec3 etak2 = etak * etak;\n    vec3 t0 = eta2 - etak2 - sinThetaI2;\n    vec3 a2plusb2 = sqrt(t0 * t0 + 4.0 * eta2 * etak2);\n    vec3 t1 = a2plusb2 + cosThetaI2;\n    vec3 a = sqrt(0.5 * (a2plusb2 + t0));\n    vec3 t2 = 2.0 * cosThetaI * a;\n    vec3 Rs = (t1 - t2) / (t1 + t2);\n    vec3 t3 = cosThetaI2 * a2plusb2 + sinThetaI2 * sinThetaI2;\n    vec3 t4 = t2 * sinThetaI2;\n    vec3 Rp = Rs * (t3 - t4) / (t3 + t4);\n    return 0.5 * (Rp + Rs);\n}\nvec2 convert(vec2 pos,float width){\n    pos.x = pos.x/width;\n    return pos;\n}\nint readInt(sampler2D tex,vec2 pos,float width){\n    return int(texture(tex,convert(pos,width)).r);\n}\nfloat readFloat(sampler2D tex,vec2 pos,float width){\n    return texture(tex,convert(pos,width)).r;\n}\nbool readBool(sampler2D tex,vec2 pos,float width){\n    return readInt(tex,pos,width)==1;\n}\nvec2 readVec2(sampler2D tex,vec2 pos,float width){\n    vec2 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    return result;\n}\nvec3 readVec3(sampler2D tex,vec2 pos,float width){\n    vec3 result;\n    pos = convert(pos,width);\n    result.x = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.y = texture(tex,pos).r;\n    pos.x += 1.0/width;\n    result.z = texture(tex,pos).r;\n    return result;\n}\nvec3 readTexture(sampler2D tex,vec2 pos){\n    float index = readFloat(texParams,pos,TEX_PARAMS_LENGTH)/float(pn-1);\n    vec2 tv = readVec2(pCache,vec2(0.0,index),PCACHE_LENGTH);\n    return texture(tex,tv).rgb;\n}\nvec3 readCacheVec3(vec2 pos){\n    float index = readFloat(texParams,pos,TEX_PARAMS_LENGTH)/float(pn-1);\n    return readVec3(pCache,vec2(0.0,index),PCACHE_LENGTH);\n}\nstruct Face {\n    vec3 vec_1;\n    vec3 vec_2;\n    vec3 vec_3;\n    vec3 normal_1;\n    vec3 normal_2;\n    vec3 normal_3;\n    float matIndex;\n    float texIndex;\n};\nstruct Cube{\n    vec3 lb;\n    vec3 rt;\n    float matIndex;\n    float texIndex;\n};\nstruct Sphere{\n    vec3 c;\n    float r;\n    float matIndex;\n    float texIndex;\n};\nstruct Plane{\n    vec3 normal;\n    float offset;\n    bool dface;\n    float matIndex;\n    float texIndex;\n};\nCube parseCube(float index){\n    Cube cube;\n    cube.lb = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    cube.rt = readVec3(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    cube.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    cube.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    return cube;\n}\nFace parseFace(float index){\n    Face face;\n    face.vec_1 = readCacheVec3(vec2(1.0,index));\n    face.vec_2 = readCacheVec3(vec2(2.0,index));\n    face.vec_3 = readCacheVec3(vec2(3.0,index));\n    face.normal_1 = readCacheVec3(vec2(4.0,index));\n    face.normal_2 = readCacheVec3(vec2(5.0,index));\n    face.normal_3 = readCacheVec3(vec2(6.0,index));\n    face.matIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    face.texIndex = readFloat(objects,vec2(8.0,index),OBJECTS_LENGTH)/float(tn-1);\n    return face;\n}\nSphere parseSphere(float index){\n    Sphere sphere;\n    sphere.c = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    sphere.r = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    sphere.matIndex = readFloat(objects,vec2(5.0,index),OBJECTS_LENGTH)/float(tn-1);\n    sphere.texIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    return sphere;\n}\nPlane parsePlane(float index){\n    Plane plane;\n    plane.normal = readVec3(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    plane.offset = readFloat(objects,vec2(4.0,index),OBJECTS_LENGTH);\n    plane.dface = readBool(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    plane.matIndex = readFloat(objects,vec2(6.0,index),OBJECTS_LENGTH)/float(tn-1);\n    plane.texIndex = readFloat(objects,vec2(7.0,index),OBJECTS_LENGTH)/float(tn-1);\n    return plane;\n}\nvec3 normalForCube( vec3 hit, Cube cube )\n{\n\tif ( hit.x < cube.lb.x + 0.0001 )\n\t\treturn vec3( -1.0, 0.0, 0.0 );\n\telse if ( hit.x > cube.rt.x - 0.0001 )\n\t\treturn vec3( 1.0, 0.0, 0.0 );\n\telse if ( hit.y < cube.lb.y + 0.0001 )\n\t\treturn vec3( 0.0, -1.0, 0.0 );\n\telse if ( hit.y > cube.rt.y - 0.0001 )\n\t\treturn vec3( 0.0, 1.0, 0.0 );\n\telse if ( hit.z < cube.lb.z + 0.0001 )\n\t\treturn vec3( 0.0, 0.0, -1.0 );\n\telse return vec3( 0.0, 0.0, 1.0 );\n}\nvec3 normalForSphere( vec3 hit, Sphere sphere ){\n\treturn (hit - sphere.c) / sphere.r;\n}\nvoid checkerboard_attr(float texIndex,out float size,out float lineWidth){\n    size = readFloat(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    lineWidth = readFloat(texParams,vec2(2.0,texIndex),TEX_PARAMS_LENGTH);\n}\nvec3 checkerboard(vec3 hit,float texIndex){\n    float size,lineWidth;\n    checkerboard_attr(texIndex,size,lineWidth);\n    float width = 0.5 * lineWidth / size;\n    float fx = hit.x/size-floor(hit.x/size),\n    fy = hit.y/size-floor(hit.y/size),\n    fz = hit.z/size-floor(hit.z/size);\n    bool in_outline = (fx<width||fx>1.0-width)||(fy<width||fy>1.0-width)||(fz<width||fz>1.0-width);\n    if (!in_outline) {\n        return WHITE;\n    } else {\n        return GREY;\n    }\n}\nvec3 getSurfaceColor(vec3 hit,float texIndex){\n    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);\n    if(texCategory==CHECKERBOARD) return checkerboard(hit,texIndex);\n    else if(texCategory==UNIFORM_COLOR){\n        return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);\n    }else{\n        if(texCategory==1){\n            return readTexture(tex1,vec2(1.0,texIndex));\n        }else if(texCategory==2){\n            return readTexture(tex2,vec2(1.0,texIndex));\n        }else if(texCategory==3){\n            return readTexture(tex3,vec2(1.0,texIndex));\n        }else if(texCategory==4){\n            return readTexture(tex4,vec2(1.0,texIndex));\n        }else{\n            return readTexture(tex1,vec2(1.0,texIndex));\n        }\n    }\n}\nstruct Intersect{\n    float d;\n    vec3 hit;\n    vec3 normal;\n    float matIndex;\n    vec3 sc;\n    float seed;\n};\nIntersect intersectFace(Ray ray,Face face){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float Amod = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ));\n    float t = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z\n    ))/Amod;\n    if(t<0.0||t>=MAX_DISTANCE) return result;\n    float c = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ))/Amod;\n    if(c>1.0||c<0.0) return result;\n    float b = modMatrix(mat3(\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ))/Amod;\n    if(c+b>1.0||b<0.0) return result;\n    result.d = t;\n    result.hit = ray.origin+t*ray.dir;\n    result.normal = face.normal_1+b*(face.normal_2-face.normal_1)+c*(face.normal_3-face.normal_1);\n    result.matIndex = face.matIndex;\n    result.sc = getSurfaceColor(result.hit,face.texIndex);\n    return result;\n}\nIntersect intersectCube(Ray ray,Cube cube){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 tMin = (cube.lb - ray.origin) / ray.dir;\n    vec3 tMax = (cube.rt- ray.origin) / ray.dir;\n    vec3 t1 = min( tMin, tMax );\n    vec3 t2 = max( tMin, tMax );\n    float tNear = max( max( t1.x, t1.y ), t1.z );\n    float tFar = min( min( t2.x, t2.y ), t2.z );\n    if(tNear>0.0&&tNear<tFar) {\n        result.d = tNear;\n        result.hit = ray.origin+tNear*ray.dir;\n        result.normal = normalForCube(ray.origin+tNear*ray.dir,cube);\n        result.matIndex = cube.matIndex;\n        result.sc = getSurfaceColor(result.hit,cube.texIndex);\n    }\n    return result;\n}\nIntersect intersectSphere(Ray ray,Sphere sphere){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 toSphere = ray.origin - sphere.c;\n\tfloat a = dot( ray.dir, ray.dir );\n\tfloat b = 2.0 * dot( toSphere, ray.dir );\n\tfloat c = dot( toSphere, toSphere ) - sphere.r * sphere.r;\n\tfloat discriminant = b * b - 4.0 * a * c;\n\tif ( discriminant > 0.0 ){\n\t\tfloat t = (-b - sqrt( discriminant ) ) / (2.0 * a);\n\t\tif ( t > 0.0 ){\n\t\t    result.d = t;\n\t\t    result.hit = ray.origin+t*ray.dir;\n\t\t    result.normal = normalForSphere(ray.origin+t*ray.dir,sphere);\n\t\t    result.matIndex = sphere.matIndex;\n\t\t    result.sc = getSurfaceColor(result.hit,sphere.texIndex);\n\t\t}\n\t}\n    return result;\n}\nIntersect intersectPlane(Ray ray,Plane plane){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float DN = dot(ray.dir,plane.normal);\n    if(DN==0.0||(!plane.dface&&DN>0.0)) return result;\n    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;\n    if(t<0.0001) return result;\n    result.d = t;\n    result.normal = plane.normal;\n    result.hit = ray.origin+result.d*ray.dir;\n    result.matIndex = plane.matIndex;\n    result.sc = getSurfaceColor(result.hit,plane.texIndex);\n    return result;\n}\nIntersect intersectObjects(Ray ray){\n    Intersect ins;\n    ins.d = MAX_DISTANCE;\n    for(int i=0;i<on;i++){\n        Intersect tmp;\n        tmp.d = MAX_DISTANCE;\n        int category = int(texture(objects,vec2(0.0,float(i)/float(on+ln-1))).r);\n        if(category==FACE){\n            Face face = parseFace(float(i)/float(on+ln-1));\n            tmp = intersectFace(ray,face);\n        }else if(category==CUBE){\n            Cube cube = parseCube(float(i)/float(on+ln-1));\n            tmp = intersectCube(ray,cube);\n        }else if(category==SPHERE){\n            Sphere sphere = parseSphere(float(i)/float(on+ln-1));\n            tmp = intersectSphere(ray,sphere);\n        }else if(category==PLANE){\n            Plane plane = parsePlane(float(i)/float(on+ln-1));\n            tmp = intersectPlane(ray,plane);\n        }\n        if(tmp.d<ins.d){\n            ins = tmp;\n        }\n    }\n    return ins;\n}\nbool testShadow(Ray ray){\n    Intersect ins = intersectObjects(ray);\n    if(ins.d>0.0&&ins.d<1.0)\n        return true;\n    return false;\n}\nvoid getCoordinate(vec3 normal,out vec3 sdir,out vec3 tdir){\n\tif ( abs( normal.x ) < 0.00001 ){\n\t\tsdir = cross( normal, vec3( 1, 0, 0 ) );\n\t} else {\n\t    sdir = cross( normal, vec3( 0, 1, 0 ) );\n\t}\n\ttdir = cross( normal, sdir );\n}\nvec3 toLocalityCoordinate(vec3 sdir,vec3 tdir,vec3 normal,vec3 w){\n    return vec3(dot(w,sdir),dot(w,tdir),dot(w,normal));\n}\nvec3 toWorldCoordinate(vec3 sdir,vec3 tdir,vec3 normal,vec3 w){\n    return w.x*sdir+w.y*tdir+w.z*normal;\n}\nvec3 uniformlyRandomDirection( float seed ){\n\tfloat u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3( r * cos( angle ), r * sin( angle ), z );\n}\nvec3 uniformlyRandomVector( float seed ){\n\treturn uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));\n}\nvec3 cosWeightHemisphere(float seed){\n    float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat angle = 2.0 * PI * v;\n\treturn vec3(u*cos(angle),u*sin(angle),cos(asin(u)));\n}\nvec3 cone(vec3 dir, float extent,float seed) {\n\tdir = normalize(dir);\n\tvec3 o1 = normalize(ortho(dir));\n\tvec3 o2 = normalize(cross(dir, o1));\n\tvec2 r =  random2( seed );\n\tr.x=r.x*2.*PI;\n\tr.y=1.0-r.y*extent;\n\tfloat oneminus = sqrt(1.0-r.y*r.y);\n\treturn cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;\n}\nstruct Light {\n    int category;\n    float intensity;\n    vec3 color;\n    vec3 pos;\n    vec3 attrs;\n};\nLight parseLight(float index){\n    Light light;\n    light.category = readInt(objects,vec2(0.0,index),OBJECTS_LENGTH);\n    light.intensity = readFloat(objects,vec2(1.0,index),OBJECTS_LENGTH);\n    light.color = readVec3(objects,vec2(2.0,index),OBJECTS_LENGTH);\n    light.pos = readVec3(objects,vec2(5.0,index),OBJECTS_LENGTH);\n    light.attrs = readVec3(objects,vec2(8.0,index),OBJECTS_LENGTH);\n    return light;\n}\nRay sampleLightRay(Light light,float seed){\n    if(light.category==POINT_LIGHT){\n        return Ray(light.pos,uniformlyRandomDirection(seed));\n    }\n    return Ray(vec3(0,0,0),vec3(0,0,0));\n}\nvec3 sampleLightPos(Light light,float seed){\n    if(light.category==POINT_LIGHT){\n        return light.pos+uniformlyRandomVector(seed)*0.5;\n    }\n    return light.pos;\n}\nstruct Lambertian{\n    float kd;\n    vec3 cd;\n};\nvec3 lambertian_f(Lambertian l,vec3 wi,vec3 wo){\n    return l.kd * l.cd * INVPI;\n}\nvec3 lambertian_sample_f(Lambertian l,float seed,out vec3 wi, vec3 wo, out float pdf){\n\twi = cosWeightHemisphere(seed);\n\tpdf = wi.z * INVPI;\n\treturn lambertian_f(l,wi,wo);\n}\nstruct Reflective{\n    float kr;\n    vec3 cr;\n};\nvec3 reflective_f(Reflective r,vec3 normal,vec3 wi,vec3 wo){\n    return r.kr*r.cr / abs(wi.z);\n}\nvec3 reflective_sample_f(Reflective r,vec3 normal,out vec3 wi, vec3 wo, out float pdf){\n\twi = vec3(-wo.x,-wo.y,wo.z);\n\twi = normalize(wi);\n\tpdf = 1.0;\n\treturn reflective_f(r,normal,wi,wo);\n}\nvoid matte_attr(float matIndex,out float kd){\n    kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 matte(Intersect ins,inout Ray ray){\n    vec3 wo = -ray.dir;\n    vec3 wi,f;\n    float pdf;\n    vec3 sdir,tdir;\n    float kd;\n    matte_attr(ins.matIndex,kd);\n    getCoordinate(ins.normal,sdir,tdir);\n    wo = toLocalityCoordinate(sdir,tdir,ins.normal,wo);\n    Lambertian diffuse_brdf = Lambertian(kd,ins.sc);\n    f = lambertian_sample_f(diffuse_brdf,ins.seed,wi,wo,pdf);\n    wi = toWorldCoordinate(sdir,tdir,ins.normal,wi);\n    ray = Ray(ins.hit,wi);\n    float ndotwi = max(dot(ins.normal,wi),0.0);\n    return f*ndotwi/pdf;\n}\nvoid reflective_attr(float matIndex,out float kd,out float kr){\n    kd = readFloat(texParams,vec2(1.0,matIndex),TEX_PARAMS_LENGTH);\n    kr = readFloat(texParams,vec2(2.0,matIndex),TEX_PARAMS_LENGTH);\n}\nvec3 reflective(Intersect ins,inout Ray ray){\n    vec3 wo = -ray.dir;\n    vec3 wi,fd,fr;\n    float pdf;\n    vec3 sdir,tdir;\n    float kd,kr;\n    reflective_attr(ins.matIndex,kd,kr);\n    getCoordinate(ins.normal,sdir,tdir);\n    wo = toLocalityCoordinate(sdir,tdir,ins.normal,wo);\n    Reflective specular_brdf = Reflective(kr,ins.sc);\n    fr = reflective_sample_f(specular_brdf,ins.normal,wi,wo,pdf);\n    vec3 f = fr;\n    if(pdf<0.0001) return vec3(0.0);\n    wi = toWorldCoordinate(sdir,tdir,ins.normal,wi);\n    ray = Ray(ins.hit,wi);\n    float ndotwi = max(dot(ins.normal,wi),0.0);\n    return f*ndotwi/pdf;\n}\nvec3 shade(Intersect ins,inout Ray ray){\n    vec3 result;\n    int matCategory = readInt(texParams,vec2(0.0,ins.matIndex),TEX_PARAMS_LENGTH);\n    if(matCategory == MATTE){\n        result = matte(ins,ray);\n    }else if(matCategory == REFLECTIVE){\n        result = reflective(ins,ray);\n    }\n    return result;\n}\nstruct RecordInfo{\n    vec3 fpdf;\n    vec3 hit;\n};\nvoid trace(inout int deepth,inout Ray ray,inout vec3 fpdf,bool rr){\n    Intersect ins = intersectObjects(ray);\n    ins.seed = timeSinceStart + float(deepth);\n    if(ins.d==MAX_DISTANCE) {\n        deepth=max(EBOUNCES,LBOUNCES);\n        return;\n    }\n    vec3 wi;\n    vec3 _fpdf = shade(ins,ray);\n    if(_fpdf==BLACK) return;\n    fpdf *= _fpdf;\n    if(rr){\n        float beta = maxComponent(fpdf);\n        if(beta<RR_THRESH&&deepth>1){\n            float p = max(0.05,beta);\n            if(random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed ) < p){\n                deepth=max(EBOUNCES,LBOUNCES);\n                return;\n            }else{\n                fpdf /= 1.0-p;\n            }\n        }\n    }\n    deepth++;\n}\nvoid main() {\n    vec3 color = BLACK;\n    RecordInfo record[EBOUNCES];\n    vec3 ffpdf = WHITE,bfpdf;\n    Ray fray = Ray(eye,rayd),bray;\n    for(int deepth=0;deepth<EBOUNCES;){\n        trace(deepth,fray,ffpdf,false);\n        record[deepth-1].fpdf = ffpdf;\n        record[deepth-1].hit = fray.origin;\n    }\n    for(int i=0;i<ln&&i<MAXLIGHTSNUM;i++){\n        Light light = parseLight(float(on+i)/float(on+ln-1));\n        bray = sampleLightRay(light,timeSinceStart + float(i));\n        bfpdf = WHITE;\n        for(int deepth=0;deepth<LBOUNCES;){\n            trace(deepth,bray,bfpdf,false);\n            for(int i=0;i<EBOUNCES;i++){\n                if(!testShadow(Ray(record[i].hit,bray.origin-record[i].hit)))\n                    color+=record[i].fpdf*bfpdf*light.color*light.intensity;\n            }\n        }\n    }\n    color /= float(ln*LBOUNCES*EBOUNCES);\n    vec3 texture = texture( cCache, gl_FragCoord.xy / 512.0 ).rgb;\n    out_color = vec4(mix(color, texture, textureWeight),1.0);\n}\n";

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

	ShaderProgram.OBJECTS_LENGTH = 11;
	ShaderProgram.PCATCH_LENGTH = 3;
	ShaderProgram.TEXPARAMS_LENGTH = 6;

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

	        this.shader.textures.cCache = 0;
	        this.shader.textures.objects = 1;
	        this.shader.textures.texParams = 2;

	        this.objects_tex = {};
	        this.params_tex = {};
	        this.pcache_tex = {};
	    }

	    update(data){
	        let data_objects = new Float32Array(data.objects);
	        let data_texparams = new Float32Array(data.texparams);

	        let on = parseInt(data.objects.length/ShaderProgram.OBJECTS_LENGTH-data.ln);
	        let tn = parseInt(data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH);

	        this.objects_tex = WebglHelper.createTexture();
	        this.params_tex = WebglHelper.createTexture();
	        WebglHelper.setTexture(
	            this.objects_tex,1,
	            ShaderProgram.OBJECTS_LENGTH, on+data.ln,
	            gl.R32F,gl.RED,gl.FLOAT,data_objects,true
	        );
	        WebglHelper.setTexture(
	            this.params_tex,2,
	            ShaderProgram.TEXPARAMS_LENGTH, tn,
	            gl.R32F,gl.RED,gl.FLOAT,data_texparams,true
	        );

	        this.shader.uniforms.on = ['int',on];
	        this.shader.uniforms.ln = ['int',data.ln];
	        this.shader.uniforms.tn = ['int',tn];

	        if(data.pcache.length!=0){
	            this.shader.textures.pCatch = 3;
	            let data_pcache = new Float32Array(data.pcache);
	            let pn = parseInt(data.pcache.length/ShaderProgram.PCATCH_LENGTH);
	            this.pcache_tex = WebglHelper.createTexture();
	            WebglHelper.setTexture(
	                this.pcache_tex,3,
	                ShaderProgram.TEXPARAMS_LENGTH, pn,
	                gl.R32F,gl.RED,gl.FLOAT,data_pcache,true
	            );
	            this.shader.uniforms.tn = ['int',pn];
	        }
	    }

	    render(modelviewProjection,eye,sampleCount){
	        this.shader.uniforms.eye = eye;
	        this.shader.uniforms.matrix = Matrix.Translation(
	            Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]
	            ).multiply(1 / 512)).multiply(modelviewProjection).inverse();
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

	        this.data={objects:[],pcache:[],texparams:[],ln:0};
	    }

	    update(scene,pcache=[]){
	        this.data.pcache = pcache;
	        this.data.ln=scene.lights.length;
	        for(let object of scene.objects){
	            this.data.objects.push(...object.gen(this.data.texparams.length/ShaderProgram.TEXPARAMS_LENGTH));
	            this.data.texparams.push(...object.genTexparams());
	        }
	        for(let light of scene.lights){
	            this.data.objects.push(...light.gen());
	        }
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
	class Object3D{
	    constructor(surfaces,material,texture){
	        this.surfaces = surfaces;
	        this.material = material;
	        this.texture = texture;
	    }

	    genTexparams(){
	        let tmp = [];
	        tmp.push(...this.material.gen());
	        tmp.push(...this.texture.gen());
	        return tmp;
	    }

	    gen(texparamID){
	        let tmp=[];
	        let i=1;
	        for(let surface of this.surfaces){
	            tmp.push(
	                0,
	                surface.points[0].e(1),surface.points[0].e(2),surface.points[0].e(3),
	                surface.points[1].e(1),surface.points[1].e(2),surface.points[1].e(3),
	                surface.points[2].e(1),surface.points[2].e(2),surface.points[2].e(3),
	                surface.normals[0].e(1),surface.normals[0].e(2),surface.normals[0].e(3),
	                surface.normals[1].e(1),surface.normals[1].e(2),surface.normals[1].e(3),
	                surface.normals[2].e(1),surface.normals[2].e(2),surface.normals[2].e(3),
	                texparamID,texparamID+i
	            );
	            i++;
	        }
	        return tmp;
	    }
	}

	class Cube{
	    constructor(min,max,material,texture){
	        this.min = $V(min);
	        this.max = $V(max);
	        this.material = material;
	        this.texture = texture;
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
	            texparamID,texparamID+1
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Sphere{
	    constructor(c,r,material,texture){
	        this.c = $V(c);
	        this.r = r;
	        this.material = material;
	        this.texture = texture;
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
	            this.r,texparamID,texparamID+1
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Plane{
	    constructor(normal,offset,dface=false,material,texture){
	        this.normal = $V(normal).toUnitVector();
	        this.offset = offset;
	        this.dface = dface?1:0;
	        this.material = material;
	        this.texture = texture;
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
	            this.offset,this.dface,texparamID,texparamID+1
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class Surface{
	    constructor(points,normals){
	        if(points.length!==3) return;
	        this.points = [];
	        for(let point of points){
	            this.points.push($V(point));
	        }
	        this.normals = [];
	        if(normals instanceof Array&&normals.length==3){
	            for(let normal of normals){
	                this.normals.push($V(normal));
	            }
	        }else{
	            let n = this.calSurfaceNormal();
	            this.normals.push(n,n,n);
	        }
	    }

	    calSurfaceNormal(){
	        return this.points[1].subtract(this.points[0])
	            .cross(this.points[2].subtract(this.points[1]))
	            .toUnitVector().x(-1);
	    }
	}

	/**
	 * Created by eason on 17-4-12.
	 */
	class Light {
	    constructor(color, intensity){
	        this.color = $V(color);
	        this.intensity = intensity;
	    }
	}

	class DirectionalLight extends Light{
	    constructor(color, intensity, direction){
	        super(color,intensity);
	        this.direction = $V(direction).toUnitVector();
	    }

	    gen(){
	        let tmp = [
	            3,
	            this.intensity,
	            this.color.e(1),this.color.e(2),this.color.e(3),
	            this.direction.e(1),this.direction.e(2),this.direction.e(3)
	        ];
	        let l = tmp.length;
	        tmp.length = ShaderProgram.OBJECTS_LENGTH;
	        return tmp.fill(0,l,tmp.length);
	    }
	}

	class PointLight extends Light{
	    constructor(color, intensity, pos){
	        super(color,intensity);
	        this.pos = $V(pos);
	    }

	    gen(){
	        let tmp = [
	            0,
	            this.intensity,
	            this.color.e(1),this.color.e(2),this.color.e(3),
	            this.pos.e(1),this.pos.e(2),this.pos.e(3)
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
	            something instanceof Plane||
	            something instanceof Object3D){
	            this.objects.push(something);
	        }else if(something instanceof Light){
	            this.lights.push(something);
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

	class Reflective{
	    constructor(kd=0.5,kr=0.5){
	        if(kd<=0) kd=0.5;
	        if(kr<=0) kr=0.5;
	        this.kd = kd;
	        this.kr = kr;
	    }

	    gen(){
	        let tmp = [
	            2,this.kd,this.kr
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

	/**
	 * Created by eason on 17-4-16.
	 */
	class OBJParser{
	    static getVector(data,s,format='float'){
	        let v = data.split(s);
	        for(let i=0;i<v.length;i++){
	            v[i] = format=='int'?parseInt(v[i]):parseFloat(v[i]);
	        }
	        return v;
	    }

	    static assemble(tmp){
	        return new Object3D(tmp.f,0);
	    }

	    static dowithLine(line,tmp){
	        if(line.startsWith('f')&&line.includes('/')){
	            let datas = line.substring(2,line.length).split(' ');
	            for(let i=0;i<datas.length;i++){
	                datas[i] = OBJParser.getVector(datas[i],'/','int');
	            }
	            let surface = new Surface(
	                [tmp.v[datas[0][0]-1],tmp.v[datas[1][0]-1],tmp.v[datas[2][0]-1]],
	                [tmp.vn[datas[0][2]-1],tmp.vn[datas[1][2]-1],tmp.vn[datas[2][2]-1]]
	            );
	            tmp.f.push(surface);
	        }else if(line.startsWith('f')){
	            let data = OBJParser.getVector(line.substring(2,line.length),' ','int');
	            let surface = new Surface(
	                [tmp.v[data[0]-1],tmp.v[data[1]-1],tmp.v[data[2]-1]]
	            );
	            tmp.f.push(surface);
	        }else if(line.startsWith('vn')){
	            tmp.vn.push(OBJParser.getVector(line.substring(3,line.length),' '));
	        }else if(line.startsWith('vt')){
	            tmp.vt.push(OBJParser.getVector(line.substring(3,line.length),' '));
	        }else if(line.startsWith('v')){
	            tmp.v.push(OBJParser.getVector(line.substring(2,line.length),' '));
	        }
	    }

	    static initTmp(){
	        return {v:[],vt:[],vn:[],f:[]}
	    }
	}

	/**
	 * Created by eason on 17-4-16.
	 */
	let ParserMap = {
	  'OBJ':  OBJParser
	};

	class Parser{
	    static parse(name,data){
	        name = name.toUpperCase();
	        let tmp = ParserMap[name].initTmp();
	        let line = '';

	        for(let c of data){
	            if(c=='\n'){
	                line = line.replace(/(^\s*)|(\s*$)/g,'');
	                ParserMap[name].dowithLine(line,tmp);
	                line = '';
	            }else
	                line+=c;
	        }

	        return ParserMap[name].assemble(tmp);
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
	                this.angleY += (this.oldX-mouse.x) * 0.01;
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
	    Object:Object3D,
	    Camera:Camera,
	    DirectionalLight:DirectionalLight,
	    PointLight:PointLight,
	    Parser:Parser,
	    Control:Control,
	    Matte:Matte,
	    Reflective:Reflective,
	    Color:Color,
	    Checkerboard:Checkerboard
	};

})));
