/**
 * Created by eason on 1/21/18.
 */
import {Generator,Export,Plugin} from '../generator';
import cube from './cube.glsl';
import sphere from './sphere.glsl';
import plane from './plane.glsl';
import cone from './cone.glsl';
import cylinder from './cylinder.glsl';
import disk from './disk.glsl';
import hyperboloid from './hyperboloid.glsl';
import paraboloid from './paraboloid.glsl';

let plugins = {
    "cube":new Plugin("cube",cube),
    "sphere":new Plugin("sphere",sphere),
    "plane":new Plugin("plane",plane),
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
let intersectTail = `if(tmp.d<ins.d) ins = tmp;}return ins;}`;

let intersect = new Export("intersect",intersectHead,intersectTail,"category",function(plugin){
    return `${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
    tmp = intersect${plugin.capitalName()}(ray,${plugin.name});
    tmp.index = i;`
});

let sampleHead = `
    vec3 sampleGeometry(Intersect ins,int i,out vec3 fpdf){
    fpdf = BLACK;
    int category = int(texture(objects,vec2(0.0,float(i)/float(ln+n-1))).r);
    vec3 result = BLACK;if(false){}
`;
let sampleTail = `return result;}`;

let sample = new Export("sample",sampleHead,sampleTail,"category",function(plugin){
    return `float pdf;
        ${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(i)/float(ln+n-1));
        result = sample${plugin.capitalName()}(ins,${plugin.name},pdf);
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