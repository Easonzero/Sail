import {Generator,Export,Plugin} from '../generator';
import area from './area.glsl';

let plugins = {
    "area":new Plugin("area",area)
};

let head = `vec3 light_sample(Intersect ins){
    vec3 fpdf = BLACK;
    int index = randomInt(ins.seed,0,ln);
    int lightCategory = readInt(lights,vec2(0.0,index),TEX_PARAMS_LENGTH);
    if(false){}`;
let tail = `return fpdf;}`;

let ep = new Export("lightSampleP",head,tail,"lightCategory",function(plugin){
    return `${plugin.capitalName()} ${plugin.name} = parse${plugin.capitalName()}(float(index)/float(ln-1));
        fpdf = ${plugin.name}_sample(${plugin.name},random2(ins.seed),ins.hit,ins.normal);`
});

export default new Generator("light",[""],[""],plugins,ep);