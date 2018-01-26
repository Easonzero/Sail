/**
 * Created by eason on 1/21/18.
 */
import {Generator,Plugin} from '../generator';
import pathtrace from './pathtrace.glsl';

let plugins = {
    "pathtrace":new Plugin("pathtrace",pathtrace)
};

export default new Generator("trace",[""],[""],plugins);