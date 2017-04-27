/**
 * Created by eason on 17-4-16.
 */
import {OBJParser} from './parser.obj';

let ParserMap = {
  'OBJ':  OBJParser
};

class Parser{
    static parse(name,data){
        name = name.toUpperCase();
        let tmp = ParserMap[name].initTmp();
        let line = '';

        for(let c of data){
            if(c=='\n'){
                line = line.replace(/(^\s*)|(\s*$)/g,'');
                ParserMap[name].dowithLine(line,tmp);
                line = '';
            }else
                line+=c;
        }

        return ParserMap[name].assemble(tmp);
    }
}

export {Parser};