/**
 * Created by eason on 17-4-11.
 */
import {ShaderProgram} from '../core/webgl';

class Object3D{
    constructor(surfaces,material,texture){
        this.surfaces = surfaces;
        this.material = material;
        this.texture = texture;
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp=[];
        let i=1;
        for(let surface of this.surfaces){
            tmp.push(
                0,
                surface.points[0].e(1),surface.points[0].e(2),surface.points[0].e(3),
                surface.points[1].e(1),surface.points[1].e(2),surface.points[1].e(3),
                surface.points[2].e(1),surface.points[2].e(2),surface.points[2].e(3),
                surface.normals[0].e(1),surface.normals[0].e(2),surface.normals[0].e(3),
                surface.normals[1].e(1),surface.normals[1].e(2),surface.normals[1].e(3),
                surface.normals[2].e(1),surface.normals[2].e(2),surface.normals[2].e(3),
                texparamID,texparamID+i
            );
            i++;
        }
        return tmp;
    }
}

class Cube{
    constructor(min,max,material,texture){
        this.min = $V(min);
        this.max = $V(max);
        this.material = material;
        this.texture = texture;
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3),
            texparamID,texparamID+1
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.OBJECTS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Sphere{
    constructor(c,r,material,texture){
        this.c = $V(c);
        this.r = r;
        this.material = material;
        this.texture = texture;
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),
            this.r,texparamID,texparamID+1
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.OBJECTS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Plane{
    constructor(normal,offset,dface=false,material,texture){
        this.normal = $V(normal).toUnitVector();
        this.offset = offset;
        this.dface = dface?1:0;
        this.material = material;
        this.texture = texture;
    }

    genTexparams(){
        let tmp = [];
        tmp.push(...this.material.gen());
        tmp.push(...this.texture.gen());
        return tmp;
    }

    gen(texparamID){
        let tmp = [
            3,
            this.normal.e(1),this.normal.e(2),this.normal.e(3),
            this.offset,this.dface,texparamID,texparamID+1
        ];
        let l = tmp.length;
        tmp.length = ShaderProgram.OBJECTS_LENGTH;
        return tmp.fill(0,l,tmp.length);
    }
}

class Surface{
    constructor(points,normals){
        if(points.length!==3) return;
        this.points = [];
        for(let point of points){
            this.points.push($V(point));
        }
        this.normals = [];
        if(normals instanceof Array&&normals.length==3){
            for(let normal of normals){
                this.normals.push($V(normal));
            }
        }else{
            let n = this.calSurfaceNormal();
            this.normals.push(n,n,n);
        }
    }

    calSurfaceNormal(){
        return this.points[1].subtract(this.points[0])
            .cross(this.points[2].subtract(this.points[1]))
            .toUnitVector().x(-1);
    }
}

export {Surface,Cube,Sphere,Plane,Object3D};