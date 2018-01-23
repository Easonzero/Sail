/**
 * Created by eason on 1/20/18.
 */
import {Generator,Plugin} from '../generator';
import random from './random.glsl';
import sampler from './sampler.glsl';
import texhelper from './texhelper.glsl';
import utility from './utility.glsl';

let plugins = {
    "random":new Plugin("random",random),
    "sampler":new Plugin("sampler",sampler),
    "texhelper":new Plugin("texhelper",texhelper),
    "utility":new Plugin("utility",utility)
};

export default new Generator("util","","",plugins);