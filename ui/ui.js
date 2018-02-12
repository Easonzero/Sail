function initEditor(){
    codeMirror = CodeMirror.fromTextArea(editor, {
        lineNumbers: true,
        mode:  "text/javascript",
        theme:'duotone-light'
    });

    codeMirror.setSize(512,512);
    codeMirror.getDoc().setValue(
`scene = new Sail.Scene();
let camera = new Sail.Camera(
    [2.78,2.73,-6],[2.78,2.73,2.79]
);

let matte = new Sail.Matte(0.7);
let metal = new Sail.Metal(0,0.01,0.1);
let mirror = new Sail.Mirror(1.0);
let glass = new Sail.Glass(1,1,1.5);
let checkerboard = new Sail.Checkerboard();

scene.add(new Sail.Rectangle(
    [2.13,5.48,2.27],[3.43,5.48,3.32],
    matte,Sail.Color.BLACK,
    [6,6,6]
));
    
scene.add(new Sail.Cornellbox());

scene.add(new Sail.Sphere(
    [1.5,1.25,2.70],1.2,
    mirror,Sail.Color.WHITE
));
    
scene.add(new Sail.Sphere(
    [3.9,1.25,1.70],1.2,
    glass,Sail.Color.WHITE
));
    
scene.add(camera);

scene.filter = 'gamma';
scene.filter.addParam('c','2.2');
scene.trace = 'path';`);
}

function run(){
    let code = codeMirror.getDoc().getValue();
    eval(code);
    control = new Sail.Control(canvas,scene);
    renderer.update(scene);
}

let codeMirror;
let editor = document.getElementById('editor');

initEditor();

let canvas = document.getElementById('canvas');
let renderer = new Sail.Renderer(canvas);
let scene,control;

run();

function tick(){
    requestAnimationFrame(tick);
    renderer.render(scene);
}

tick();