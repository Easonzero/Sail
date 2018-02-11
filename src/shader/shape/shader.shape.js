/**
 * Created by eason on 1/21/18.
 */
import {Generator,Export,Plugin} from '../generator';
import cube from './cube.glsl';
import sphere from './sphere.glsl';
import rectangle from './rectangle.glsl';
import cone from './cone.glsl';
import cylinder from './cylinder.glsl';
import disk from './disk.glsl';
import hyperboloid from './hyperboloid.glsl';
import paraboloid from './paraboloid.glsl';

let plugins = {
    "cube":new Plugin("cube",cube),
    "sphere":new Plugin("sphere",sphere),
    "rectangle":new Plugin("rectangle",rectangle),
    "cone":new Plugin("cone",cone),
    "cylinder":new Plugin("cylinder",cylinder),
    "disk":new Plugin("disk",disk),
    "hyperboloid":new Plugin("hyperboloid",hyperboloid),
    "paraboloid":new Plugin("paraboloid",paraboloid)
};

let intersectHead = `Intersect intersectObjects(Ray ray){
    Intersect ins;
    ins.d = MAX_DISTANCE;
    for(int i=0;i<ln+n;i++){
        Intersect tmp;
        tmp.d = MAX_DISTANCE;
        int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
        if(false) {}`;
let intersectTail = `if(tmp.d < ins.d) ins = tmp;}

ins.matCategory = readInt(texParams,vec2(0.0,ins.matIndex),TEX_PARAMS_LENGTH);
ins.into = dot(ins.normal,ray.dir) < -EPSILON;
if(!ins.into) {
    ins.normal = -ins.normal;
}
return ins;}`;

let intersect = new Export("intersect",intersectHead,intersectTail,"category",function(plugin){
    return `${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
    tmp = intersect${plugin.capitalName()}(ray,${plugin.name});
    vec3 n = (${plugin.name}.reverseNormal?-1.0:1.0)*tmp.normal;
    bool faceObj = dot(n,ray.dir)<-EPSILON;
    tmp.emission = faceObj?tmp.emission:BLACK;
    tmp.index = i;`
});

let sampleHead = `
vec3 sampleGeometry(Intersect ins,int i,out vec3 fpdf){
    float u1 = random( vec3( 12.9898, 78.233, 151.7182 ), ins.seed );
    float u2 = random( vec3( 63.7264, 10.873, 623.6736 ), ins.seed );
    fpdf = BLACK;
    int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
    vec3 result = BLACK;if(false){}
`;
let sampleTail = `return result;}`;

let sample = new Export("sample",sampleHead,sampleTail,"category",function(plugin){
    return `float pdf;
        ${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
        result = sample${plugin.capitalName()}(vec2(u1,u2),${plugin.name},pdf);
        vec3 normal = normalFor${plugin.capitalName()}(result,${plugin.name});
        fpdf = ${plugin.name}.emission*max(0.0,dot(normal,ins.hit-result))/pdf;`
});

let testShadow = `
bool testShadow(Ray ray){
    Intersect ins = intersectObjects(ray);
    if(ins.index>=ln&&ins.d>EPSILON&&ins.d<1.0)
        return true;
    return false;
}
`;
export default new Generator("shape",[""],[testShadow],plugins,intersect,sample);