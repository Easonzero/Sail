/**
 * Created by eason on 1/21/18.
 */
import {Generator,Plugin} from '../generator';
import path from './path.glsl';

let plugins = {
    "path":new Plugin("path",path)
};

export default new Generator("trace",[""],[""],plugins);