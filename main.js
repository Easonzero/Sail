/**
 * Created by eason on 17-2-16.
 */
import {Renderer} from './renderer';

let canvas = document.getElementById('canvas');

let renderer = new Renderer(canvas);

function tick(){
    requestAnimationFrame(tick);
    renderer.render();
}

tick();