/**
 * Created by eason on 1/23/18.
 */
import {Generator,Plugin} from '../generator';
import gamma from './gamma.glsl';
import none from './none.glsl';
import box from './box.glsl';
import gaussian from './gaussian.glsl'
import mitchell from './mitchell.glsl'
import sinc from './sinc.glsl'
import triangle from './triangle.glsl'

let plugins = {
    "none":new Plugin("none",none),
    "gamma":new Plugin("gamma",gamma),
    "box":new Plugin("box",box),
    "gaussian":new Plugin("gaussian",gaussian),
    "mitchell":new Plugin("mitchell",mitchell),
    "sinc":new Plugin("sinc",sinc),
    "triangle":new Plugin("triangle",triangle)
};

plugins.gaussian.param = function (pluginParams,generatorName) {
    let r = pluginParams.getParam("r");
    let alpha = pluginParams.getParam("alpha")[0];
    return `
    #define FILTER_GAUSSIAN_R ${pluginParams.params.r}
    #define FILTER_GAUSSIAN_ALPHA ${pluginParams.params.alpha}
    #define FILTER_GAUSSIAN_EXPX ${Math.exp(-alpha*r[0]*r[0])}
    #define FILTER_GAUSSIAN_EXPY ${Math.exp(-alpha*r[1]*r[1])}
    `
};

plugins.mitchell.param = function (pluginParams,generatorName) {
    let r = pluginParams.getParam("r");
    return `
    #define FILTER_MITCHELL_R ${pluginParams.params.r}
    #define FILTER_MITCHELL_B ${pluginParams.params.b}
    #define FILTER_MITCHELL_C ${pluginParams.params.c}
    #define FILTER_MITCHELL_INVX ${1/r[0]}
    #define FILTER_MITCHELL_INVY ${1/r[1]}
    `
};

export default new Generator("filter","","",plugins);