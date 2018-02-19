/**
 * Created by eason on 1/23/18.
 */
import {Generator,Plugin} from '../generator';
import window from './window.glsl';
import gamma from './gamma.glsl';
import color from './color.glsl';
import normal from './normal.glsl';
import position from './position.glsl';
import {Box_param} from './box'
import {Gaussian_param} from './gaussian'
import {Mitchell_param} from './mitchell'
import {Sinc_param} from './sinc'
import {Triangle_param} from './triangle'

let plugins = {
    "color":new Plugin("color",color),
    "gamma":new Plugin("gamma",gamma),
    "box":new Plugin("box",window),
    "gaussian":new Plugin("gaussian",window),
    "mitchell":new Plugin("mitchell",window),
    "sinc":new Plugin("sinc",window),
    "triangle":new Plugin("triangle",window),
    "normal":new Plugin("normal",normal),
    "position":new Plugin("position",position)
};
let windowWidth = 4;

plugins.box.param = Box_param(windowWidth);

plugins.gaussian.param = Gaussian_param(windowWidth);

plugins.mitchell.param = Mitchell_param(windowWidth);

plugins.sinc.param = Sinc_param(windowWidth);

plugins.triangle.param = Triangle_param(windowWidth);

export default new Generator("filter",[""],[""],plugins);