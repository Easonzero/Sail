/**
 * Created by eason on 1/20/18.
 */
import {Generator} from '../generator';
import define from './define.glsl';
import struct from './struct.glsl';

export default new Generator("const",[define],[struct]);