function initEditor(){
    codeMirror = CodeMirror.fromTextArea(editor, {
        lineNumbers: true,
        mode:  "text/javascript",
        theme:'duotone-light'
    });

    codeMirror.setSize(512,512);
    codeMirror.getDoc().setValue(
`scene = new Sail.Scene();
//create camera;
let camera = new Sail.Camera(
    [2.78,2.73,-6],[2.78,2.73,2.79]
);
//create textures and materials
let matte = new Sail.Matte(0.7);
let metal = new Sail.Metal(0,0.01,0.1);
let mirror = new Sail.Mirror(1.0);
let glass = new Sail.Glass(1,1,1.5);
let checkerboard = new Sail.Checkerboard();
let checkerboard2 = new Sail.Checkerboard();
//add areaLight
scene.add(new Sail.AreaLight(
new Sail.Rectangle(
    [2.13,5.48,2.27],[3.43,5.48,3.32],
    matte,Sail.Color.BLACK
),[1.5,1.5,1.5]));
//add cornellBox    
scene.add(new Sail.Cornellbox());
//add objects
scene.add(new Sail.Sphere(
    [1.5,1.25,2.70],1.2,
    mirror,Sail.Color.WHITE
));
scene.add(new Sail.Sphere(
    [3.9,1.25,1.70],1.2,
    glass,Sail.Color.WHITE
));
//add camera    
scene.add(camera);
//declare renderer setting
//the format of params' value must be float
scene.filter = 'gamma';
scene.filter.addParam('c','2.2');
scene.trace = 'path';`);
}

function run(){
    let code = codeMirror.getDoc().getValue();
    eval(code);
    Sail.Control.update(scene);
    renderer.update(scene);
}

let codeMirror;
let editor = document.getElementById('editor');

initEditor();

let canvas = document.getElementById('canvas');
let renderer = new Sail.Renderer(canvas);
let scene;

Sail.Control.init(canvas);

run();

function tick(){
    requestAnimationFrame(tick);
    renderer.render(scene);
}

tick();

