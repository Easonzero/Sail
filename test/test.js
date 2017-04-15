/**
 * Created by eason on 17-2-16.
 */
let canvas = document.getElementById('canvas');

let renderer = new Sail.Renderer(canvas);
let scene = new Sail.Scene();
let camera = new Sail.Camera([3.0, 2.0, 4.0],[-1.0, 0.5, 0.0]);
let pointLight1 = new Sail.PointLight([0.49, 0.07, 0.07],1,[-2.0, 2.5, 0.0]);
let pointLight2 = new Sail.PointLight([0.07, 0.07, 0.49],1,[1.5, 2.5, 1.5]);
let pointLight3 = new Sail.PointLight([0.07, 0.49, 0.071],1,[1.5, 2.5, -1.5]);
let pointLight4 = new Sail.PointLight([0, 0.21, 0.35],1,[0.0, 3.5, 0.0]);

scene.add(new Sail.Plane([0,1,0],0,1));
scene.add(new Sail.Sphere([0.0, 1.1, -0.25],1.1,0));
scene.add(new Sail.Sphere([-1.0, 0.5, 1.5],0.5,0));
scene.add(camera);
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(pointLight3);
scene.add(pointLight4);

function tick(){
    requestAnimationFrame(tick);
    renderer.update(scene);
    renderer.render();
}

tick();