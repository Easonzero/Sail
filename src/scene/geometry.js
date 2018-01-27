/**
 * Created by eason on 17-4-11.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from '../utils/matrix';

class Object{
    constructor(material,texture,emission=[0,0,0]){
        this.material = material;
        this.texture = texture;
        this.emission = new Vector(emission);

        this.light = !this.emission.eql(new Vector([0,0,0]));
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(data){
        let l = data.length;
        data.length = ShaderProgram.OBJECTS_LENGTH;
        return data.fill(0,l,data.length);
    }
}

class Cube extends Object{
    constructor(min,max,material,texture,emission){
        super(material,texture,emission);

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
            this.max.e(1),this.max.e(2),this.max.e(3),
            texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Sphere extends Object{
    constructor(c,r,material,texture,emission){
        super(material,texture,emission);

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
            this.c.e(1),this.c.e(2),this.c.e(3),
            this.r,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Plane extends Object{
    constructor(normal,offset,dface=false,material,texture,emission){
        super(material,texture,emission);
        this.normal = new Vector(normal).toUnitVector();
        this.offset = offset;
        this.dface = dface?1:0;
    }

    get pluginName(){
        return "plane";
    }

    set pluginName(name){}

    gen(texparamID){
        let tmp = [
            3,
            this.normal.e(1),this.normal.e(2),this.normal.e(3),
            this.offset,this.dface,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Cone extends Object{
    constructor(position,height,radius,material,texture,emission){
        super(material,texture,emission);
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
            this.height,this.radius,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Cylinder extends Object{
    constructor(position,height,radius,material,texture,emission){
        super(material,texture,emission);
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
            this.height,this.radius,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Disk extends Object{
    constructor(position,height,radius,innerRadius,material,texture,emission){
        super(material,texture,emission);
        this.position = new Vector(position);
        this.height = height;
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
            this.height,this.radius,this.innerRadius,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Hyperboloid extends Object{
    constructor(position,p1,p2,material,texture,emission){
        super(material,texture,emission);
        this.position = new Vector(position);
        this.p1 = new Vector(p1);
        this.p2 = new Vector(p2);

        let pp = p1;
        if(p2.e(3) === 0){
            this.p1 = this.p2;
            this.p2 = pp;
        }
        let xy1, xy2;
        do {
            pp = pp.add(p2.subtract(p1).x(2));
            xy1 = pp.e(1) * pp.e(1) + pp.e(2) * pp.e(2);
            xy2 = p2.e(1) * p2.e(1) + p2.e(2) * p2.e(2);
            this.ah = (1 / xy1 - (pp.e(3) * pp.e(3)) / (xy1 * p2.e(3) * p2.e(3))) /
            (1 - (xy2 * pp.e(3) * pp.e(3)) / (xy1 * p2.e(3) * p2.e(3)));
            this.ch = (ah * xy2 - 1) / (p2.e(3) * p2.e(3));
        } while (isFinite(ah)|| isNaN(ah));
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
            this.ah,this.ch,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

class Paraboloid extends Object{
    constructor(position,z0,z1,radius,material,texture,emission){
        super(material,texture,emission);
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
            this.z0,this.z1,this.radius,texparamID,texparamID+1,
            this.emission.e(1),this.emission.e(2),this.emission.e(3)
        ];
        return super.gen(tmp);
    }
}

export {Cube,Sphere,Plane,Cone,Cylinder,Disk,Hyperboloid,Paraboloid};