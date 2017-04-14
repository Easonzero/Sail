/**
 * Created by eason on 17-4-11.
 */
import {ShaderProgram} from './webgl';
class Object{
    constructor(){
        this.surfaces = [];
        this.material = 0;
    }

    gen(){
        let tmp=[];
        for(let surface of this.surfaces){
            tmp.push(
                0,
                surface.points[0].e(1),surface.points[0].e(2),surface.points[0].e(3),
                surface.points[1].e(1),surface.points[1].e(2),surface.points[1].e(3),
                surface.points[2].e(1),surface.points[2].e(2),surface.points[2].e(3),
                surface.normal.e(1),surface.normal.e(2),surface.normal.e(3),
                this.material
            );
        }
        return tmp;
    }
}

class Cube{
    constructor(min,max,material){
        this.min = $V(min);
        this.max = $V(max);
        this.material = material;
    }

    gen(){
        let tmp = [
            1,
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3),
            this.material
        ];
        tmp.length = ShaderProgram.DATA_LENGTH;
        return tmp.fill(this.material,8,tmp.length);
    }
}

class Sphere{
    constructor(c,r,material){
        this.c = $V(c);
        this.r = r;
        this.material = material;
    }

    gen(){
        let tmp = [
            2,
            this.c.e(1),this.c.e(2),this.c.e(3),
            this.r,this.material
        ];
        tmp.length = ShaderProgram.DATA_LENGTH;
        return tmp.fill(this.material,6,tmp.length);
    }
}

class Plane{
    constructor(normal,offset,material){
        this.normal = $V(normal).toUnitVector();
        this.offset = offset;
        this.material = material;
    }

    gen(){
        let tmp = [
            3,
            this.normal.e(1),this.normal.e(2),this.normal.e(3),
            this.offset, this.material
        ];
        tmp.length = ShaderProgram.DATA_LENGTH;
        return tmp.fill(this.material,6,tmp.length);
    }
}

class Surface{
    constructor(points){
        if(points.length!==3) return;
        this.points = [];
        for(let point of points){
            this.points.push($V(point));
        }

        this.normal = this.points[1].subtract(this.points[0])
            .cross(this.points[2].subtract(this.points[1]))
            .toUnitVector().x(-1);
    }
}

export {Cube,Sphere,Plane,Object};