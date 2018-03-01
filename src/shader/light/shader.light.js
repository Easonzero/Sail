import {Generator,Export,Plugin} from '../generator';
import area from './area.glsl';
import point from './point.glsl';

let plugins = {
    "area":new Plugin("area",area),
    "point":new Plugin("point",point)
};

let head = `vec3 light_sample(Intersect ins){
    vec3 fpdf = BLACK;
    int index = randomInt(ins.seed,0,ln);
    int lightCategory = readInt(lights,vec2(0.0,index),TEX_PARAMS_LENGTH);
    if(false){}`;
let tail = `return fpdf;}`;

let ep = new Export("lightSampleP",head,tail,"lightCategory",function(plugin){
    return `${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(index)/float(ln-1));
        fpdf = ${plugin.name}_sample(${plugin.name},ins.seed,ins.hit,ins.normal);`
});

let testShadow = `
bool testShadow(Ray ray){
    Intersect ins = intersectObjects(ray);
    if(ins.d>EPSILON&&ins.d<ONEMINUSEPSILON)
        return true;
    return false;
}
`;

export default new Generator("light",[testShadow],[""],plugins,ep);