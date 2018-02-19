import {Vector} from "../utils/matrix";

class Ray{
    constructor(origin,dir){
        this.origin = origin;
        this.dir = dir;
    }

    static generate(eye,inmp,x,y){
        let dir = inmp.multiply(new Vector([x, y, 0, 1])).divideByW().ensure3().subtract(eye);
        return new Ray(eye,dir);
    }

    testBoundBox(boundbox){
        let tMin = boundbox.min.subtract(this.origin).componentDivide(this.dir);
        let tMax = boundbox.max.subtract(this.origin).componentDivide(this.dir);
        let t1 = Vector.min(tMin, tMax);
        let t2 = Vector.max(tMin, tMax);
        let tNear = t1.maxComponent();
        let tFar = t2.minComponent();

        if(tNear<-MINVALUE&&tFar<-MINVALUE) return false;

        return tNear < tFar;
    }

    intersectBoundBox(boundbox){
        let tMin = boundbox.min.subtract(this.origin).componentDivide(this.dir);
        let tMax = boundbox.max.subtract(this.origin).componentDivide(this.dir);
        let t1 = Vector.min(tMin, tMax);
        let t2 = Vector.max(tMin, tMax);
        let tNear = t1.maxComponent();
        let tFar = t2.minComponent();
        if(tNear > MINVALUE && tNear < tFar) {
            return tNear;
        }else if(tNear < tFar) return tFar;
        return MAXVALUE;
    }
}

class Pickup{
    constructor(scene){
        this.scene = scene;
    }

    pick(x,y){
        let ray = Ray.generate(
            this.scene.eye,
            this.scene.mat.inverse(),
            (x / 512) * 2 - 1,
            1 - (y / 512) * 2
        );
        this.scene.select = null;
        let near = MAXVALUE;
        for(let object of this.scene.objects){
            let boundbox = object.boundbox();
            if(boundbox&&ray.testBoundBox(boundbox)){
                let t = object.intersect(ray);
                if(t < near){
                    near = t;
                    this.scene.select = object;
                }
            }
        }
        return near < MAXVALUE;
    }

    movingBegin(x,y){
        let boundbox = scene.select.boundbox();
        let ray = Ray.generate(
            this.scene.eye,
            this.scene.mat.inverse(),
            (x / 512) * 2 - 1,
            1 - (y / 512) * 2
        );
        let t = ray.intersectBoundBox(boundbox);

        if(t < MAXVALUE){
            let hit = ray.origin.add(ray.dir.x(t));
            if(Math.abs(hit.elements[0] - boundbox.min.elements[0]) < MINVALUE) this.movementNormal = new Vector([-1, 0, 0]);
            else if(Math.abs(hit.elements[0] - boundbox.max.elements[0]) < MINVALUE) this.movementNormal = new Vector([1, 0, 0]);
            else if(Math.abs(hit.elements[1] - boundbox.min.elements[1]) < MINVALUE) this.movementNormal = new Vector([0, -1, 0]);
            else if(Math.abs(hit.elements[1] - boundbox.max.elements[1]) < MINVALUE) this.movementNormal = new Vector([0, 1, 0]);
            else if(Math.abs(hit.elements[2] - boundbox.min.elements[2]) < MINVALUE) this.movementNormal = new Vector([0, 0, -1]);
            else this.movementNormal = new Vector([0, 0, 1]);

            this.movementDistance = this.movementNormal.dot(hit);
            this.originalHit = hit;
            this.scene.moving = true;
            return true;
        }
        return false;
    }

    moving(x,y){
        let ray = Ray.generate(
            this.scene.eye,
            this.scene.mat.inverse(),
            (x / 512) * 2 - 1,
            1 - (y / 512) * 2
        );

        let t = (this.movementDistance - this.movementNormal.dot(ray.origin)) / this.movementNormal.dot(ray.dir);
        let hit = ray.origin.add(ray.dir.multiply(t));
        this.scene.select.temporaryTranslate(hit.subtract(this.originalHit));
        this.originalHit = hit;
    }

    movingEnd(x,y){
        let ray = Ray.generate(
            this.scene.eye,
            this.scene.mat.inverse(),
            (x / 512) * 2 - 1,
            1 - (y / 512) * 2
        );

        let t = (this.movementDistance - this.movementNormal.dot(ray.origin)) / this.movementNormal.dot(ray.dir);

        let hit = ray.origin.add(ray.dir.multiply(t));
        this.scene.select.temporaryTranslate(hit.subtract(this.originalHit));
        this.scene.moving = false;
    }
}

export {Pickup,Ray};