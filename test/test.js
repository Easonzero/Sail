/**
 * Created by eason on 17-2-16.
 */
let canvas = document.getElementById('canvas');

let renderer = new Sail.Renderer(canvas);
let scene = new Sail.Scene();
let camera = new Sail.Camera([0.0, 0.0, 4.5],[0, 0, 0]);

let pointLight = new Sail.PointLight([0.9, 0.9, 0.9],1,[0,0.5,0]);

let matte = new Sail.Matte(1.0);
let reflective = new Sail.Reflective(0.3,0.7);
let checkerboard = new Sail.Checkerboard(0.3,0.03);
scene.add(new Sail.Plane([0,1,0],-1.9,false,matte,checkerboard));
scene.add(new Sail.Plane([0,-1,0],-1.9,false,matte,checkerboard));
scene.add(new Sail.Plane([1,0,0],-1.9,false,matte,checkerboard));
scene.add(new Sail.Plane([-1,0,0],-1.9,false,matte,checkerboard));
scene.add(new Sail.Plane([0,0,1],-1.9,false,matte,checkerboard));
scene.add(new Sail.Plane([0,0,-1],-5,false,matte,checkerboard));


//scene.add(new Sail.Cube([-1.0,0.0, -1.25],[1.0,1.0, 0.25],1));
scene.add(new Sail.Sphere([0, -1.0, 0],0.6,reflective,Sail.Color.create([1,1,1])));

scene.add(camera);
scene.add(pointLight);

let control = new Sail.Control(canvas,scene);

renderer.update(scene);

function tick(){
    requestAnimationFrame(tick);
    renderer.render(scene);
}

tick();