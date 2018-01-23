/**
 * Created by eason on 1/23/18.
 */
import {Generator,Plugin} from '../generator';
import gamma from './gamma.glsl';

let plugins = {
    "gamma":new Plugin("gamma",gamma)
};

export default new Generator("filter","","",plugins);