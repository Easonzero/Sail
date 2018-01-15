/**
 * Created by eason on 17-4-12.
 */
class Camera {
    constructor(eye, center, up=[0,1,0]){
        this.eye = $V(eye);
        this.center = $V(center);
        this.up = $V(up);

        this.makePerspective();
        this.makeLookAt();
    }

    makePerspective(fovy=55, aspect=1, znear=10, zfar=100){
        let top = znear * Math.tan(fovy * Math.PI / 360.0);
        let bottom = -top;
        let left = bottom * aspect;
        let right = top * aspect;

        let X = 2*znear/(right-left);
        let Y = 2*znear/(top-bottom);
        let A = (right+left)/(right-left);
        let B = (top+bottom)/(top-bottom);
        let C = -(zfar+znear)/(zfar-znear);
        let D = -2*zfar*znear/(zfar-znear);

        this.projection = $M([
            [X, 0, A, 0],
            [0, Y, B, 0],
            [0, 0, C, D],
            [0, 0, -1, 0]
        ]);
    }

    makeLookAt(){
        let z = this.eye.subtract(this.center).toUnitVector();
        let x = this.up.cross(z).toUnitVector();
        let y = z.cross(x).toUnitVector();
        x = x.x(-1);

        let m = $M([
            [x.e(1), x.e(2), x.e(3), 0],
            [y.e(1), y.e(2), y.e(3), 0],
            [z.e(1), z.e(2), z.e(3), 0],
            [0, 0, 0, 1]
        ]);

        let t = $M([
            [1, 0, 0, -this.eye.e(1)],
            [0, 1, 0, -this.eye.e(2)],
            [0, 0, 1, -this.eye.e(3)],
            [0, 0, 0, 1]
        ]);

        this.modelview = m.x(t);
    }

    update(){
        this.makeLookAt();
    }
}

export { Camera };