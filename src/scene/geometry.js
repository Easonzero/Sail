/**
 * Created by eason on 17-4-11.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from '../utils/matrix';

class Object{
    constructor(material,texture,emission=[0,0,0],reverseNormal=false){
        this.material = material;
        this.texture = texture;
        this.emission = new Vector(emission);
        this.reverseNormal = reverseNormal?1:0;

        this.light = !this.emission.eql(new Vector([0,0,0]));
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(data,texparamID){
        data.push(
            this.reverseNormal,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        );
        let l = data.length;
        data.length = ShaderProgram.OBJECTS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Cube extends Object{
    constructor(min,max,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.min = new Vector(min);
        this.max = new Vector(max);
    }

    get pluginName(){
        return "cube";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

class Sphere extends Object{
    constructor(c,r,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.c = new Vector(c);
        this.r = r;
        this.material = material;
    }

    get pluginName(){
        return "sphere";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),this.r
        ];
        return super.gen(tmp,texparamID);
    }
}

class Rectangle extends Object{
    constructor(min,max,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.min = new Vector(min);
        this.max = new Vector(max);
    }

    get pluginName(){
        return "rectangle";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            3,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cone extends Object{
    constructor(position,height,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.height = height;
        this.radius = radius;
    }

    get pluginName(){
        return "cone";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            4,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.height,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cylinder extends Object{
    constructor(position,height,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.height = height;
        this.radius = radius;
    }

    get pluginName(){
        return "cylinder";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            5,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.height,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Disk extends Object{
    constructor(position,radius,innerRadius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.radius = radius;
        this.innerRadius = innerRadius;
    }

    get pluginName(){
        return "disk";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            6,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.radius,this.innerRadius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Hyperboloid extends Object{
    constructor(position,p1,p2,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.p1 = new Vector(p1);
        this.p2 = new Vector(p2);
        let pp = this.p1;
        if(this.p2.e(3) === 0){
            this.p1 = this.p2;
            this.p2 = pp;
        }
        pp = this.p1;
        let xy1, xy2,n=0;
        do {
            pp = pp.add(this.p2.subtract(this.p1).x(2));
            xy1 = pp.e(1) * pp.e(1) + pp.e(2) * pp.e(2);
            xy2 = this.p2.e(1) * this.p2.e(1) + this.p2.e(2) * this.p2.e(2);
            this.ah = (1 / xy1 - (pp.e(3) * pp.e(3)) / (xy1 * this.p2.e(3) * this.p2.e(3))) /
            (1 - (xy2 * pp.e(3) * pp.e(3)) / (xy1 * this.p2.e(3) * this.p2.e(3)));
            this.ch = (this.ah * xy2 - 1) / (this.p2.e(3) * this.p2.e(3));
            n++;
        } while (!isFinite(this.ah)|| isNaN(this.ah) && n<20);

        if(!isFinite(this.ah)|| isNaN(this.ah)){
            throw "the p1,p2 of hyperboloid is illegal";
        }
    }

    get pluginName(){
        return "hyperboloid";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            7,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.p1.e(1),this.p1.e(2),this.p1.e(3),
            this.p2.e(1),this.p2.e(2),this.p2.e(3),
            this.ah,this.ch
        ];
        return super.gen(tmp,texparamID);
    }
}

class Paraboloid extends Object{
    constructor(position,z0,z1,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.z0 = z0;
        this.z1 = z1;
        this.radius = radius;
    }

    get pluginName(){
        return "paraboloid";
    }

    set pluginName(name){}


    gen(texparamID){
        let tmp = [
            8,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.z0,this.z1,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

export {Cube,Sphere,Rectangle,Cone,Cylinder,Disk,Hyperboloid,Paraboloid};