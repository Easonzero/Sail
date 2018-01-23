/**
 * Created by eason on 1/21/18.
 */
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
        this.name = name;
        this.exports = exports;
        this.head = head;
        this.tail = tail;
    }

    generate(...names){
        let result = this.head + '\n';
        for(let name of names){
            result += this.plugins[name].fn + '\n';
        }
        for(let e of this.exports){
            result += e.head;
            for(let name of names){
                result += e.condition(this.plugins[name].defineName());
                result += `{${e.callfn(this.plugins[name])}}`;
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

export{Plugin,Export,Generator};