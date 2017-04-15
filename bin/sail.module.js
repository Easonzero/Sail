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

var vs_trace = "#version 300 es\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\nin vec3 vertex;\nuniform vec3 eye;\nuniform vec3 test;\nuniform mat4 matrix;\nout vec3 rayd;\nvoid main() {\n    gl_Position = vec4(vertex, 1.0);\n    rayd = normalize(ensure3byW(matrix*gl_Position)-eye);\n}";

var fs_trace = "#version 300 es\nprecision highp float;\n#define BOUNCES 5\nfloat random( vec3 scale, float seed ){\n\treturn(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );\n}\nvec3 cosineWeightedDirection( float seed, vec3 normal ){\n\tfloat u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat r = sqrt( u );   float angle = 6.283185307179586 * v;\n\tvec3 sdir, tdir;\n\tif ( abs( normal.x ) < .5 )\n\t{\n\t\tsdir = cross( normal, vec3( 1, 0, 0 ) );\n\t} else {\n\t    sdir = cross( normal, vec3( 0, 1, 0 ) );\n\t}\n\ttdir = cross( normal, sdir );\n\treturn r*cos( angle )*sdir + r*sin(angle)*tdir + sqrt(1.-u)*normal;\n}\nvec3 uniformlyRandomDirection( float seed ){\n\tfloat u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );\n\tfloat v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );\n\tfloat z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );\n\tfloat angle = 6.283185307179586 * v;\n\treturn vec3( r * cos( angle ), r * sin( angle ), z );\n}\nvec3 uniformlyRandomVector( float seed ){\n\treturn uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));\n}\nstruct Ray{\n    vec3 origin;\n    vec3 dir;\n};\n#define DATA_LENGTH 13.0\n#define LIGHT_LENGTH 10.0\n#define MAX_DISTANCE 100000.0\n#define FACE 0\n#define CUBE 1\n#define SPHERE 2\n#define PLANE 3\n#define POINT_LIGHT 0\n#define RECT_LIGHT 1\n#define SPOT_LIGHT 2\n#define DIRECT_LIGHT 3\n#define AMBIENT_LIGHT 4\n#define SHINY 0\n#define CHECKERBOARD 1\n#define BLACK vec3(0.0,0.0,0.0)\n#define WHITE vec3(1.0,1.0,1.0)\n#define GREY vec3(0.5,0.5,0.5)\nvec3 ensure3byW(vec4 vec){\n    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);\n}\nfloat modMatrix(mat3 mat){\n    return dot(cross(mat[0],mat[1]),mat[2]);\n}\nstruct Face {\n    vec3 vec_1;\n    vec3 vec_2;\n    vec3 vec_3;\n    vec3 normal;\n    int material;\n};\nstruct Cube{\n    vec3 lb;\n    vec3 rt;\n    int material;\n};\nstruct Sphere{\n    vec3 c;\n    float r;\n    int material;\n};\nstruct Plane{\n    vec3 normal;\n    float offset;\n    int material;\n};\nCube parseCube(sampler2D data,float index){\n    Cube cube;\n    for(int i=0;i<3;i++){\n        cube.lb[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;\n        cube.rt[i] = texture(data,vec2(float(i+4)/DATA_LENGTH,index)).r;\n    }\n    cube.material = int(texture(data,vec2(float(7)/DATA_LENGTH,index)).r);\n    return cube;\n}\nFace parseFace(sampler2D data,float index){\n    Face face;\n    for(int i=0;i<3;i++){\n        face.vec_1[i] = texture(data,vec2(float(1+i)/DATA_LENGTH,index)).r;\n        face.vec_2[i] = texture(data,vec2(float(4+i)/DATA_LENGTH,index)).r;\n        face.vec_3[i] = texture(data,vec2(float(7+i)/DATA_LENGTH,index)).r;\n        face.normal[i] = texture(data,vec2(float(10+i)/DATA_LENGTH,index)).r;\n    }\n    face.material = int(texture(data,vec2(float(13)/DATA_LENGTH,index)).r);\n    return face;\n}\nSphere parseSphere(sampler2D data,float index){\n    Sphere sphere;\n    for(int i=0;i<3;i++){\n        sphere.c[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;\n    }\n    sphere.r = texture(data,vec2(float(4)/DATA_LENGTH,index)).r;\n    sphere.material = int(texture(data,vec2(float(5)/DATA_LENGTH,index)).r);\n    return sphere;\n}\nPlane parsePlane(sampler2D data,float index){\n    Plane plane;\n    for(int i=0;i<3;i++){\n        plane.normal[i] = texture(data,vec2(float(i+1)/DATA_LENGTH,index)).r;\n    }\n    plane.offset = texture(data,vec2(float(4)/DATA_LENGTH,index)).r;\n    plane.material = int(texture(data,vec2(float(5)/DATA_LENGTH,index)).r);\n    return plane;\n}\nvec3 normalForCube( vec3 hit, Cube cube )\n{\n\tif ( hit.x < cube.lb.x + 0.0001 )\n\t\treturn vec3( -1.0, 0.0, 0.0 );\n\telse if ( hit.x > cube.rt.x - 0.0001 )\n\t\treturn vec3( 1.0, 0.0, 0.0 );\n\telse if ( hit.y < cube.lb.y + 0.0001 )\n\t\treturn vec3( 0.0, -1.0, 0.0 );\n\telse if ( hit.y > cube.rt.y - 0.0001 )\n\t\treturn vec3( 0.0, 1.0, 0.0 );\n\telse if ( hit.z < cube.lb.z + 0.0001 )\n\t\treturn vec3( 0.0, 0.0, -1.0 );\n\telse return vec3( 0.0, 0.0, 1.0 );\n}\nvec3 normalForSphere( vec3 hit, Sphere sphere ){\n\treturn (hit - sphere.c) / sphere.r;\n}\nstruct Intersect{\n    float d;\n    vec3 hit;\n    vec3 normal;\n    int material;\n};\nIntersect intersectFace(Ray ray,Face face){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float Amod = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ));\n    float t = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z\n    ))/Amod;\n    if(t<0.0||t>=MAX_DISTANCE) return result;\n    float c = modMatrix(mat3(\n        face.vec_1.x-face.vec_2.x,face.vec_1.y-face.vec_2.y,face.vec_1.z-face.vec_2.z,\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ))/Amod;\n    if(c>1.0||c<0.0) return result;\n    float b = modMatrix(mat3(\n        face.vec_1.x-ray.origin.x,face.vec_1.y-ray.origin.y,face.vec_1.z-ray.origin.z,\n        face.vec_1.x-face.vec_3.x,face.vec_1.y-face.vec_3.y,face.vec_1.z-face.vec_3.z,\n        ray.dir.x,ray.dir.y,ray.dir.z\n    ))/Amod;\n    if(c+b>1.0||b<0.0) return result;\n    result.d = t;\n    result.hit = ray.origin+t*ray.dir;\n    result.normal = face.normal;\n    result.material = face.material;\n    return result;\n}\nIntersect intersectCube(Ray ray,Cube cube){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 tMin = (cube.lb - ray.origin) / ray.dir;\n    vec3 tMax = (cube.rt- ray.origin) / ray.dir;\n    vec3 t1 = min( tMin, tMax );\n    vec3 t2 = max( tMin, tMax );\n    float tNear = max( max( t1.x, t1.y ), t1.z );\n    float tFar = min( min( t2.x, t2.y ), t2.z );\n    if(tNear>0.0&&tNear<tFar) {\n        result.d = tNear;\n        result.hit = ray.origin+tNear*ray.dir;\n        result.normal = normalForCube(ray.origin+tNear*ray.dir,cube);\n        result.material = cube.material;\n    }\n    return result;\n}\nIntersect intersectSphere(Ray ray,Sphere sphere){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    vec3 toSphere = ray.origin - sphere.c;\n\tfloat a = dot( ray.dir, ray.dir );\n\tfloat b = 2.0 * dot( toSphere, ray.dir );\n\tfloat c = dot( toSphere, toSphere ) - sphere.r * sphere.r;\n\tfloat discriminant = b * b - 4.0 * a * c;\n\tif ( discriminant > 0.0 ){\n\t\tfloat t = (-b - sqrt( discriminant ) ) / (2.0 * a);\n\t\tif ( t > 0.0 ){\n\t\t    result.d = t;\n\t\t    result.hit = ray.origin+t*ray.dir;\n\t\t    result.normal = normalForSphere(ray.origin+t*ray.dir,sphere);\n\t\t    result.material = sphere.material;\n\t\t}\n\t}\n    return result;\n}\nIntersect intersectPlane(Ray ray,Plane plane){\n    Intersect result;\n    result.d = MAX_DISTANCE;\n    float DN = dot(ray.dir,plane.normal);\n    if(DN==0.0) return result;\n    float t = (plane.offset*dot(plane.normal,plane.normal)-dot(ray.origin,plane.normal))/DN;\n    if(t<0.0001) return result;\n    result.d = t;\n    result.normal = plane.normal;\n    result.hit = ray.origin+result.d*ray.dir;\n    result.material = plane.material;\n    return result;\n}\nIntersect intersectObjects(sampler2D objects,int n,Ray ray){\n    Intersect ins;\n    ins.d = MAX_DISTANCE;\n    for(int i=0;i<n;i++){\n        Intersect tmp;\n        tmp.d = MAX_DISTANCE;\n        int category = int(texture(objects,vec2(0.0,float(i)/float(n-1))).r);\n        if(category==FACE){\n            Face face = parseFace(objects,float(i)/float(n-1));\n            tmp = intersectFace(ray,face);\n        }else if(category==CUBE){\n            Cube cube = parseCube(objects,float(i)/float(n-1));\n            tmp = intersectCube(ray,cube);\n        }else if(category==SPHERE){\n            Sphere sphere = parseSphere(objects,float(i)/float(n-1));\n            tmp = intersectSphere(ray,sphere);\n        }else if(category==PLANE){\n            Plane plane = parsePlane(objects,float(i)/float(n-1));\n            tmp = intersectPlane(ray,plane);\n        }\n        if(tmp.d<ins.d){\n            ins = tmp;\n        }\n    }\n    return ins;\n}\nstruct Material{\n    vec3 diffuse;\n    vec3 specular;\n    float glossiness;\n    float roughness;\n};\nMaterial shiny(){\n    return Material(WHITE,GREY,0.4,250.0);\n}\nMaterial checkerboard(vec3 pos){\n    vec3 diffuse;\n    float glossiness;\n    if (int(floor(pos.z) + floor(pos.x)) % 2 != 0) {\n        diffuse = WHITE;\n        glossiness = 0.1;\n    } else {\n        diffuse = BLACK;\n        glossiness = 0.7;\n    }\n    return Material(diffuse,WHITE,glossiness,150.0);\n}\nMaterial queryMaterial(int material,vec3 pos){\n    Material result;\n    if(material == SHINY){\n        result = shiny();\n    }else if(material == CHECKERBOARD){\n        result = checkerboard(pos);\n    }\n    return result;\n}\nstruct Light {\n    int category;\n    vec3 color;\n    float intensity;\n    vec3 pos;\n    vec3 attrs;\n};\nLight parseLight(sampler2D data,float index){\n    Light light;\n    light.category = int(texture(data,vec2(float(0)/LIGHT_LENGTH,index)).r);\n    light.intensity = texture(data,vec2(float(4)/LIGHT_LENGTH,index)).r;\n    for(int i=0;i<3;i++){\n        light.color[i] = texture(data,vec2(float(1+i)/LIGHT_LENGTH,index)).r;\n        light.pos[i] = texture(data,vec2(float(5+i)/LIGHT_LENGTH,index)).r;\n        light.attrs[i] = texture(data,vec2(float(8+i)/LIGHT_LENGTH,index)).r;\n    }\n    return light;\n}\nbool testShadow(sampler2D data,int n,Light light,vec3 hit){\n    vec3 ld;\n    Intersect ins;\n    if(light.category==DIRECT_LIGHT){\n        ld = -light.pos*MAX_DISTANCE;\n    }else if(light.category==POINT_LIGHT){\n        ld = light.pos-hit;\n    }\n    ins = intersectObjects(data,n,Ray(hit,ld));\n    if(ins.d>0.0&&ins.d<1.0)\n        return true;\n    return false;\n}\nvec3 calcolor(Material material,Light light,Intersect ins,vec3 rd){\n    vec3 result = BLACK;\n    vec3 ld;\n    if(light.category==DIRECT_LIGHT){\n        ld = -light.pos;\n    }else if(light.category==POINT_LIGHT){\n        ld = normalize(light.pos-ins.hit);\n    }\n    result = material.diffuse*light.intensity*light.color*max(dot(ins.normal,ld),0.00001) +\n        material.specular*light.intensity*light.color*pow(clamp(dot(normalize(rd), ld), 0.0, 1.0), material.roughness);\n    return result;\n}\nuniform vec3 eye;\nuniform int on;\nuniform int ln;\nuniform float textureWeight;\nuniform float timeSinceStart;\nuniform sampler2D tex;\nuniform sampler2D objects;\nuniform sampler2D lights;\nin vec3 rayd;\nout vec4 out_color;\nvoid main() {\n    Ray ray = Ray(eye,rayd);\n    vec3 color = BLACK;\n    for(int depth=0;depth<BOUNCES;depth++){\n        Intersect ins = intersectObjects(objects,on,ray);\n        if(ins.d==MAX_DISTANCE) break;\n        Material material = queryMaterial(ins.material,ins.hit);\n        vec3 rd = reflect(ray.dir,ins.normal);\n        for(int i=0;i<ln;i++){\n            Light light = parseLight(lights,float(i)/float(ln-1));\n            light.pos += uniformlyRandomVector(timeSinceStart-53.0)*0.1;\n            if(!testShadow(objects,on,light,ins.hit))\n                color+=calcolor(material,light,ins,rd);\n        }\n        ray = Ray(ins.hit,normalize(rd + uniformlyRandomVector(timeSinceStart + float(depth)) * material.glossiness));\n    }\n    vec3 texture = texture( tex, gl_FragCoord.xy / 512.0 ).rgb;\n    out_color = vec4(mix(color, texture, textureWeight),1.0);\n}";

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

ShaderProgram.DATA_LENGTH = 14;
ShaderProgram.LIGHT_LENGTH = 11;

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
        gl.clearColor(0.0,0.0,1.0,1.0);
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
        this.sampleCount = 0;
        this.timeStart = new Date();

        this.shader.textures.tex = 0;
        this.shader.textures.objects = 1;
        this.shader.textures.lights = 2;

        this.data_objects_tex = {};
        this.data_lights_tex = {};
    }

    update(objects,lights,modelviewProjection,eye){
        this.sampleCount++;

        let data_objects = new Float32Array(objects);
        let data_lights = new Float32Array(lights);

        let on = parseInt(objects.length/ShaderProgram.DATA_LENGTH);
        let ln = parseInt(lights.length/ShaderProgram.LIGHT_LENGTH);

        this.data_objects_tex = WebglHelper.createTexture();
        this.data_lights_tex = WebglHelper.createTexture();
        WebglHelper.setTexture(
            this.data_objects_tex,1,
            ShaderProgram.DATA_LENGTH, on,
            gl.R32F,gl.RED,gl.FLOAT,data_objects,true
        );
        WebglHelper.setTexture(
            this.data_lights_tex,2,
            ShaderProgram.LIGHT_LENGTH, ln,
            gl.R32F,gl.RED,gl.FLOAT,data_lights,true
        );

        this.shader.uniforms.eye = eye;
        this.shader.uniforms.matrix = Matrix.Translation(
            Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]
        ).multiply(1 / 512)).multiply(modelviewProjection).inverse();
        this.shader.uniforms.on = ['int',on];
        this.shader.uniforms.ln = ['int',ln];
        this.shader.uniforms.textureWeight = this.sampleCount / (this.sampleCount + 1);
        this.shader.uniforms.timeSinceStart = (new Date() - this.timeStart) * 0.001;
    }

    render(){
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
    }

    update(scene){
        let data_objects=[],data_lights=[];
        for(let object of scene.objects){
            data_objects.push(...object.gen());
        }
        for(let light of scene.lights){
            data_lights.push(...light.gen());
        }
        this.tracer.update(data_objects,data_lights,scene.mat, scene.eye);
    }

    render(){
        WebglHelper.clearScreen();
        this.tracer.render();
        this.shader.render();
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
class Object$1{
    constructor(){
        this.surfaces = [];
        this.material = 0;
    }

    gen(){
        let tmp=[];
        for(let surface of this.surfaces){
            tmp.push(
                0,
                surface.points[0].e(1),surface.points[0].e(2),surface.points[0].e(3),
                surface.points[1].e(1),surface.points[1].e(2),surface.points[1].e(3),
                surface.points[2].e(1),surface.points[2].e(2),surface.points[2].e(3),
                surface.normal.e(1),surface.normal.e(2),surface.normal.e(3),
                this.material
            );
        }
        return tmp;
    }
}

class Cube{
    constructor(min,max,material){
        this.min = $V(min);
        this.max = $V(max);
        this.material = material;
    }

    gen(){
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3),
            this.material
        ];
        tmp.length = ShaderProgram.DATA_LENGTH;
        return tmp.fill(this.material,8,tmp.length);
    }
}

class Sphere{
    constructor(c,r,material){
        this.c = $V(c);
        this.r = r;
        this.material = material;
    }

    gen(){
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),
            this.r,this.material
        ];
        tmp.length = ShaderProgram.DATA_LENGTH;
        return tmp.fill(this.material,6,tmp.length);
    }
}

class Plane{
    constructor(normal,offset,material){
        this.normal = $V(normal).toUnitVector();
        this.offset = offset;
        this.material = material;
    }

    gen(){
        let tmp = [
            3,
            this.normal.e(1),this.normal.e(2),this.normal.e(3),
            this.offset, this.material
        ];
        tmp.length = ShaderProgram.DATA_LENGTH;
        return tmp.fill(this.material,6,tmp.length);
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
            this.color.e(1),this.color.e(2),this.color.e(3),
            this.intensity,
            this.direction.e(1),this.direction.e(2),this.direction.e(3)
        ];
        tmp.length = ShaderProgram.LIGHT_LENGTH;
        return tmp.fill(this.intensity,8,tmp.length);
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
            this.color.e(1),this.color.e(2),this.color.e(3),
            this.intensity,
            this.pos.e(1),this.pos.e(2),this.pos.e(3)
        ];
        tmp.length = ShaderProgram.LIGHT_LENGTH;
        return tmp.fill(this.intensity,8,tmp.length);
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
            something instanceof Object$1){
            this.objects.push(something);
        }else if(something instanceof Light){
            this.lights.push(something);
        }
    }

    update(){
        this.camera.update();
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
    Object:Object$1,
    Camera:Camera,
    DirectionalLight:DirectionalLight,
    PointLight:PointLight
};
