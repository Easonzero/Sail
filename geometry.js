/**
 * Created by eason on 17-4-11.
 */

class Cube{
    constructor(min,max,material){
        this.min = min;
        this.max = max;
        this.material = material;
    }

    gen(){
        return [
            this.min.e(1),this.min.e(2),this.min.e(3),
            this.max.e(1),this.max.e(2),this.max.e(3),
            this.material
        ];
    }
}
Cube.id = 0;

class Sphere{
    constructor(c,r,material){
        this.c = c;
        this.r = r;
        this.material = material;
    }

    gen(){
        return [
            this.c.e(1),this.c.e(2),this.c.e(3),
            this.r,this.material
        ];
    }
}
Cube.id = 1;

class Surface{
    constructor(points){
        if(points.length!==3) return;

        this.points = points;
        this.normal = this.points[1].subtract(this.points[0])
            .cross(this.points[2].subtract(this.points[1]))
            .normalize().x(-1);
    }

    gen(material){
        return [
            this.points[0].e(1),this.points[0].e(2),this.points[0].e(3),
            this.points[1].e(1),this.points[1].e(2),this.points[1].e(3),
            this.points[2].e(1),this.points[2].e(2),this.points[2].e(3),
            this.normal.e(1),this.normal.e(2),this.normal.e(3),
            material
        ];
    }
}
Cube.id = 2;

export {Cube,Sphere,Surface};