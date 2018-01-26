/**
 * Created by eason on 1/21/18.
 */
class PluginParams{
    constructor(name){
        this.name = name;
        this.params = {};
    }

    addParam(name,value){
        this.params[name] = value;
    }

    getParam(name){
        let result = this.params[name].match(/-?\d+\.\d+?/g);
        for(let i in result){
            result[i] = parseFloat(result[i]);
        }
        return result;
    }

    getParamName(name,generatorName){
       return `${generatorName}_${this.name}_${name}`.toUpperCase();
    }
}

class Plugin {
    constructor(name, fn) {
        this.name = name;
        this.fn = fn;
    }

    capitalName() {
        let name = "";
        for(let c of this.name){
            if(c==this.name[0]) c=this.name[0].toUpperCase();
            name += c;
        }
        return name;
    }

    defineName() {
        return this.name.toUpperCase();
    }

    equal(name){
        return this.name === name;
    }

    param(pluginParam,generatorName){
        let params = '';
        for(let param of Object.entries(pluginParam.params)){
            params += `#define ${pluginParam.getParamName(param[0],generatorName)} ${param[1]}\n`;
        }
        return params;
    }
}

class Export{
    constructor(name,head,tail,flag,callfn){
        this.name = name;
        this.head = head;
        this.tail = tail;
        this.flag = flag;
        this.callfn = callfn;
    }

    condition(defineName){
        return `else if(${this.flag}==${defineName}) `;
    }
}

class Generator{
    constructor(name,head,tail,plugins,...exports){
        this.plugins = plugins;
        this._name = name;
        this.exports = exports;
        this._head = head;
        this._tail = tail;
    }

    set head(head){}

    get head(){
        let head = "";
        for(let e of this._head)
            head += e + '\n';
        return head;
    }

    set tail(tail){}

    get tail(){
        let tail = "";
        for(let e of this._tail)
            tail += e + '\n';
        return tail;
    }

    set name(name){}

    get name(){
        return this._name;
    }

    generate(...pluginParams){
        let result = this.head + '\n';
        for(let pluginParam of pluginParams){
            result += this.plugins[pluginParam.name].param(pluginParam,this.name);
            result += this.plugins[pluginParam.name].fn + '\n';
        }
        for(let e of this.exports){
            result += e.head;
            for(let pluginParam of pluginParams){
                result += e.condition(this.plugins[pluginParam.name].defineName());
                result += `{${e.callfn(this.plugins[pluginParam.name])}}`;
            }
            result += e.tail + '\n';
        }
        result += this.tail + '\n';
        return result;
    }

    query(plugin){
        return Object.keys(this.plugins).includes(plugin);
    }
}

export{PluginParams,Plugin,Export,Generator};