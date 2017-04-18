/**
 * Created by eason on 17-4-16.
 */
import {Object3D,Surface} from '../scene/geometry';

class OBJParser{
    static getVector(data,s,format='float'){
        let v = data.split(s);
        for(let i=0;i<v.length;i++){
            v[i] = format=='int'?parseInt(v[i]):parseFloat(v[i]);
        }
        return v;
    }

    static assemble(tmp){
        return new Object3D(tmp.f,0);
    }

    static dowithLine(line,tmp){
        if(line.startsWith('f')&&line.includes('/')){
            let datas = line.substring(2,line.length).split(' ');
            for(let i=0;i<datas.length;i++){
                datas[i] = OBJParser.getVector(datas[i],'/','int');
            }
            let surface = new Surface(
                [tmp.v[datas[0][0]-1],tmp.v[datas[1][0]-1],tmp.v[datas[2][0]-1]],
                [tmp.vn[datas[0][2]-1],tmp.vn[datas[1][2]-1],tmp.vn[datas[2][2]-1]]
            );
            tmp.f.push(surface);
        }else if(line.startsWith('f')){
            let data = OBJParser.getVector(line.substring(2,line.length),' ','int');
            let surface = new Surface(
                [tmp.v[data[0]-1],tmp.v[data[1]-1],tmp.v[data[2]-1]]
            );
            tmp.f.push(surface);
        }else if(line.startsWith('vn')){
            tmp.vn.push(OBJParser.getVector(line.substring(3,line.length),' '));
        }else if(line.startsWith('vt')){
            tmp.vt.push(OBJParser.getVector(line.substring(3,line.length),' '));
        }else if(line.startsWith('v')){
            tmp.v.push(OBJParser.getVector(line.substring(2,line.length),' '));
        }
    }

    static initTmp(){
        return {v:[],vt:[],vn:[],f:[]}
    }
}

export {OBJParser};