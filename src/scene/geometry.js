/**
 * Created by eason on 17-4-11.
 */
import {ShaderProgram} from '../core/webgl';
import {Vector} from '../utils/matrix';
import {Matte} from "./material";
import {Color} from "../core/color";
import {Ray} from "../core/pickup";

function quadratic(A,B,C) {
    let t0,t1;
    let discrim = B * B - 4.0 * A * C;
    if (discrim < 0.0) return [-1,-1];
    let rootDiscrim = Math.sqrt(discrim);

    let q;
    if (B < 0.0)
        q = -0.5 * (B - rootDiscrim);
    else
        q = -0.5 * (B + rootDiscrim);
    t0 = q / A;
    t1 = C / q;
    if (t0 > t1) [t0,t1]=[t1,t0];
    return [t0,t1];
}

class Object3D{
    constructor(material,texture,emission=[0,0,0],reverseNormal=false){
        this.material = material;
        this.texture = texture;
        this.emission = new Vector(emission);
        this.reverseNormal = reverseNormal?1:0;
        this.texparamsID = 0;
        this.temporaryTranslation = Vector.Zero(3);

        this.light = !this.emission.eql(new Vector([0,0,0]));

        this._pluginName = '';
    }

    get pluginName(){
        return this._pluginName;
    }

    set pluginName(name){}

    static get _n(){return Vector.j};
    static get _s(){return Vector.k.x(-1)};
    static get _t(){return Vector.i};

    boundbox(){
        return false;
    }

    static toObjectSpace(v,offset,n,s,t){
        v = v.subtract(offset);
        return new Vector([v.dot(s),v.dot(t),v.dot(n)]);
    }

    static rayToObjectSpace(ray,offset,n=Object3D._n,s=Object3D._s,t=Object3D._t){
        let origin = Object3D.toObjectSpace(ray.origin,offset,n,s,t);
        let dir = Object3D.toObjectSpace(ray.dir,Vector.Zero(3),n,s,t);

        return new Ray(origin,dir);
    }

    temporaryTranslate(vector){
        this.temporaryTranslation = vector;
    }

    translate(){
        this.temporaryTranslation = Vector.Zero(3);
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

class Cube extends Object3D{
    constructor(min,max,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.min = new Vector(min);
        this.max = new Vector(max);

        this._pluginName = "cube";
    }

    boundbox(){
        return {
            min:this.min,
            max:this.max
        }
    }

    intersect(ray){
        let tMin = this.min.subtract(ray.origin).componentDivide(ray.dir);
        let tMax = this.max.subtract(ray.origin).componentDivide(ray.dir);
        let t1 = Vector.min(tMin, tMax);
        let t2 = Vector.max(tMin, tMax);
        let tNear = t1.maxComponent();
        let tFar = t2.minComponent();
        if(tNear > MINVALUE && tNear < tFar) {
            return tNear;
        }else if(tNear < tFar) return tFar;
        return MAXVALUE;
    }

    translate(){
        this.min = this.min.add(this.temporaryTranslation);
        this.max = this.max.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

class Sphere extends Object3D{
    constructor(c,r,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.c = new Vector(c);
        this.r = r;
        this.material = material;

        this._pluginName = "sphere";
    }

    boundbox(){
        let r = new Vector([this.r,this.r,this.r]);
        return {
            min:this.c.subtract(r),
            max:this.c.add(r)
        }
    }

    intersect(_ray){
        let ray = Object3D.rayToObjectSpace(_ray,this.c);
        let a = ray.dir.dot(ray.dir);
        let b = 2.0*ray.origin.dot(ray.dir);
        let c = ray.origin.dot(ray.origin) - this.r * this.r;

        let t;
        let [t1,t2] = quadratic(a,b,c);
        if(t2 < MINVALUE) return MAXVALUE;

        t = t1;
        if(t1 < MINVALUE) t = t2;

        return t;
    }

    translate(){
        this.c = this.c.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),this.r
        ];
        return super.gen(tmp,texparamID);
    }
}

class Rectangle extends Object3D{
    constructor(min,max,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.min = new Vector(min);
        this.max = new Vector(max);

        this._pluginName = "rectangle";
    }

    boundbox(){
        let max = this.max.dup();
        let min = this.min.dup();
        if(this.max.e(1)===this.min.e(1)) {
            max.elements[0]+=0.05;
            min.elements[0]-=0.05;
        }
        if(this.max.e(2)===this.min.e(2)) {
            max.elements[1] += 0.05;
            min.elements[1]-=0.05;
        }
        if(this.max.e(3)===this.min.e(3)) {
            max.elements[2]+=0.05;
            min.elements[2]-=0.05;
        }

        return {
            min:min,
            max:max
        }
    }

    intersect(_ray){
        let x = new Vector([this.max.e(1)-this.min.e(1),0,0]);
        let y = new Vector([0,this.max.e(2)-this.min.e(2),this.max.e(3)-this.min.e(3)]);

        let lx = x.length();
        let ly = y.length();

        let s = x.divide(lx);
        let t = y.divide(ly);
        let n = s.cross(t);

        let ray = Object3D.rayToObjectSpace(_ray,this.min,n,s,t);

        if(ray.dir.e(3) === 0.0) return MAXVALUE;

        let tt = -ray.origin.e(3)/ray.dir.e(3);
        if(tt < MINVALUE) return MAXVALUE;

        let hit = ray.origin.add(ray.dir.x(tt));

        if(hit.x > lx || hit.y > ly ||
            hit.x < -MINVALUE || hit.y < -MINVALUE) return MAXVALUE;

        return tt;
    }

    translate(){
        this.min = this.min.add(this.temporaryTranslation);
        this.max = this.max.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            3,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cone extends Object3D{
    constructor(position,height,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.height = height;
        this.radius = radius;

        this._pluginName = "cone";
    }

    boundbox(){
        return {
            min:this.position.subtract(new Vector([this.radius,0,this.radius])),
            max:this.position.add(new Vector([this.radius,this.height,this.radius]))
        }
    }

    intersect(_ray){
        let ray = Object3D.rayToObjectSpace(_ray,this.position);
        let k = this.radius / this.height;
        k = k * k;
        let a = ray.dir.e(1) * ray.dir.e(1) + ray.dir.e(2) * ray.dir.e(2) - k * ray.dir.e(3) * ray.dir.e(3);
        let b = 2.0 * (ray.dir.e(1) * ray.origin.e(1) + ray.dir.e(2) * ray.origin.e(2) - k * ray.dir.e(3) * (ray.origin.e(3) - this.height));
        let c = ray.origin.e(1) * ray.origin.e(1) + ray.origin.e(2) * ray.origin.e(2) - k * (ray.origin.e(3) - this.height) * (ray.origin.e(3) - this.height);

        let t;
        let [t1,t2] = quadratic(a,b,c);

        if(t2 < -MINVALUE) return MAXVALUE;

        t = t1;
        if(t1 < MINVALUE) t = t2;

        let hit = ray.origin.add(ray.dir.x(t));

        if (hit.e(3) < -MINVALUE || hit.e(3) > this.height){
            if (t === t2) return MAXVALUE;
            t = t2;

            hit = ray.origin.add(ray.dir.x(t));
            if (hit.e(3) < -MINVALUE || hit.e(3) > this.height) return MAXVALUE;
        }

        if(t >= MAXVALUE) return MAXVALUE;

        return t;
    }

    translate(){
        this.position = this.position.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            4,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.height,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cylinder extends Object3D{
    constructor(position,height,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.height = height;
        this.radius = radius;

        this._pluginName = "cylinder";
    }

    boundbox(){
        return {
            min:this.position.subtract(new Vector([this.radius,0,this.radius])),
            max:this.position.add(new Vector([this.radius,this.height,this.radius]))
        }
    }

    intersect(_ray){
        let ray = Object3D.rayToObjectSpace(_ray,this.position);
        let a = ray.dir.e(1) * ray.dir.e(1) + ray.dir.e(2) * ray.dir.e(2);
        let b = 2.0 * (ray.dir.e(1) * ray.origin.e(1) + ray.dir.e(2) * ray.origin.e(2));
        let c = ray.origin.e(1) * ray.origin.e(1) + ray.origin.e(2) * ray.origin.e(2) - this.radius * this.radius;


        let t;
        let [t1,t2] = quadratic(a,b,c);

        if(t2 < MINVALUE) return MAXVALUE;

        t = t1;
        if(t1 < MINVALUE) t = t2;

        let hit = ray.origin.add(ray.dir.x(t));

        if (hit.e(3) < -MINVALUE || hit.e(3) > this.height){
            if (t === t2) return MAXVALUE;
            t = t2;

            hit = ray.origin.add(ray.dir.x(t));
            if (hit.e(3) < -MINVALUE || hit.e(3) > this.height) return MAXVALUE;
        }

        if(t >= MAXVALUE) return MAXVALUE;

        return t;
    }

    translate(){
        this.position = this.position.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            5,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.height,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Disk extends Object3D{
    constructor(position,radius,innerRadius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.radius = radius;
        this.innerRadius = innerRadius;

        this._pluginName = "disk";
    }

    boundbox(){
        return {
            min:this.position.subtract(new Vector([this.radius,0.05,this.radius])),
            max:this.position.add(new Vector([this.radius,0.05,this.radius]))
        }
    }

    intersect(_ray){
        let ray = Object3D.rayToObjectSpace(_ray,this.position);

        if (ray.dir.e(3) === 0.0) return MAXVALUE;
        let t = -ray.origin.e(3) / ray.dir.e(3);
        if (t <= MINVALUE) return MAXVALUE;

        let hit = ray.origin.add(ray.dir.x(t));
        let dist2 = hit.e(1) * hit.e(1) + hit.e(2) * hit.e(2);
        if (dist2 > this.radius * this.radius || dist2 < this.innerRadius * this.innerRadius)
            return MAXVALUE;

        if(t >= MAXVALUE) return MAXVALUE;

        return t;
    }

    translate(){
        this.position = this.position.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            6,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.radius,this.innerRadius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Hyperboloid extends Object3D{
    constructor(position,p1,p2,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.p1 = new Vector(p1);
        this.p2 = new Vector(p2);

        let r1 = Math.sqrt(p1[0]*p1[0]+p1[1]*p1[1]);
        let r2 = Math.sqrt(p2[0]*p2[0]+p2[1]*p2[1]);
        this.rMax = Math.max(r1,r2);
        this.zMin = Math.min(p1[2],p2[2]);
        this.zMax = Math.max(p1[2],p2[2]);

        this._pluginName = "hyperboloid";

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

    boundbox(){
        return {
            min:this.position.subtract(new Vector([this.rMax,-this.zMin,this.rMax])),
            max:this.position.add(new Vector([this.rMax,this.zMax,this.rMax]))
        }
    }

    intersect(_ray){
        let ray = Object3D.rayToObjectSpace(_ray,this.position);
        let a = this.ah * ray.dir.e(1) * ray.dir.e(1) + this.ah * ray.dir.e(2) * ray.dir.e(2) - this.ch * ray.dir.e(3) * ray.dir.e(3);
        let b = 2.0 * (this.ah * ray.dir.e(1) * ray.origin.e(1) + this.ah * ray.dir.e(2) * ray.origin.e(2) - this.ch * ray.dir.e(3) * ray.origin.e(3));
        let c = this.ah * ray.origin.e(1) * ray.origin.e(1) + this.ah * ray.origin.e(2) * ray.origin.e(2) - this.ch * ray.origin.e(3) * ray.origin.e(3) - 1.0;

        let t;
        let [t1,t2] = quadratic(a,b,c);
        if(t2 < -MINVALUE) return MAXVALUE;

        t = t1;
        if(t1 < MINVALUE) t = t2;

        let hit = ray.origin.add(ray.dir.x(t));
        if (hit.e(3) < this.zMin || hit.e(3) > this.zMax){
            if (t === t2) return MAXVALUE;
            t = t2;

            hit = ray.origin.add(ray.dir.x(t));
            if (hit.e(3) < this.zMin || hit.e(3) > this.zMax) return MAXVALUE;
        }

        if(t >= MAXVALUE) return MAXVALUE;

        return t;
    }

    translate(){
        this.position = this.position.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
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

class Paraboloid extends Object3D{
    constructor(position,z0,z1,radius,material,texture,emission,reverseNormal){
        super(material,texture,emission,reverseNormal);

        this.position = new Vector(position);
        this.z0 = z0;
        this.z1 = z1;
        this.radius = radius;

        this.zMin = Math.min(z0,z1);
        this.zMax = Math.max(z0,z1);

        this._pluginName = "paraboloid";
    }

    boundbox(){
        return {
            min:this.position.subtract(new Vector([this.radius,-this.zMin,this.radius])),
            max:this.position.add(new Vector([this.radius,this.zMax,this.radius]))
        }
    }

    intersect(_ray){
        let ray = Object3D.rayToObjectSpace(_ray,this.position);
        let k = this.zMax / (this.radius * this.radius);
        let a = k * (ray.dir.e(1) * ray.dir.e(1) + ray.dir.e(2) * ray.dir.e(2));
        let b = 2.0 * k * (ray.dir.e(1) * ray.origin.e(1) + ray.dir.e(2) * ray.origin.e(2)) - ray.dir.e(3);
        let c = k * (ray.origin.e(1) * ray.origin.e(1) + ray.origin.e(2) * ray.origin.e(2)) - ray.origin.e(3);

        let t;
        let [t1,t2] = quadratic(a,b,c);
        if(t2 < -MINVALUE) return MAXVALUE;

        t = t1;
        if(t1 < MINVALUE) t = t2;

        let hit = ray.origin.add(ray.dir.x(t));
        if (hit.e(3) < this.zMin || hit.e(3) > this.zMax){
            if (t === t2) return MAXVALUE;
            t = t2;

            hit = ray.origin.add(ray.dir.x(t));
            if (hit.e(3) < this.zMin || hit.e(3) > this.zMax) return MAXVALUE;
        }

        if(t >= MAXVALUE) return MAXVALUE;

        return t;

    }

    translate(){
        this.position = this.position.add(this.temporaryTranslation);
        super.translate();
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        this.translate();
        let tmp = [
            8,
            this.position.e(1),this.position.e(2),this.position.e(3),
            this.z0,this.z1,this.radius
        ];
        return super.gen(tmp,texparamID);
    }
}

class Cornellbox extends Object3D{
    constructor(min=[0,0,-5],max=[5.560,5.488,5.592]){
        super(new Matte(1),Color.BLACK);
        this.min = new Vector(min);
        this.max = new Vector(max);
        this._pluginName = "cornellbox"
    }

    scale(k){
        this.min = this.min.x(k);
        this.max = this.max.x(k);
    }

    gen(texparamID=this.texparamID){
        this.texparamID = texparamID;
        let tmp = [
            9,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3)
        ];
        return super.gen(tmp,texparamID);
    }
}

export {Object3D,Cube,Sphere,Rectangle,Cone,Cylinder,Disk,Hyperboloid,Paraboloid,Cornellbox};