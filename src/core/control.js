/**
 * Created by eason on 17-4-26.
 */
import {Vector} from '../utils/matrix'
import {Pickup} from "./pickup";

function addEvent(obj,xEvent,fn) {
    if(obj.attachEvent){
        obj.attachEvent('on'+xEvent,fn);
    }else{
        obj.addEventListener(xEvent,fn,false);
    }
}

function delEvent(obj,xEvent,fn) {
    if(obj.attachEvent){
        obj.detachEvent('on'+xEvent,fn);
    }
    else
        obj.removeEventListener(xEvent,fn,false);
}

function elementPos(element) {
    let x = 0, y = 0;
    while(element.offsetParent) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
    }
    return { x: x, y: y };
}

function eventPos(event) {
    return {
        x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
    };
}

function canvasMousePos(event,canvas) {
    let mousePos = eventPos(event);
    let canvasPos = elementPos(canvas);
    return {
        x: mousePos.x - canvasPos.x,
        y: mousePos.y - canvasPos.y
    };
}

class Control{
    static init(canvas){
        Control.canvas = canvas;

        Control.onmousedown();
        Control.onmousemove();
        Control.onmouseup();
        Control.onmousewheel();
    }

    static update(scene){
        Control.scene = scene;

        Control.pick = new Pickup(scene);

        Control.mouseDown = false;
        Control.R = Control.scene.camera.eye.distanceFrom(Control.scene.camera.center);
        Control.angleX = Math.asin((Control.scene.camera.eye.e(2)-Control.scene.camera.center.e(2))/Control.R);
        Control.angleY = Math.acos((Control.scene.camera.eye.e(3)-Control.scene.camera.center.e(3))/(Control.R*Math.cos(Control.angleX)));
        if(Control.scene.camera.eye.e(1)-Control.scene.camera.center.e(1)<0) Control.angleY = -Control.angleY;
    }

    static __onmousedown(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,Control.canvas);
            Control.oldX = mouse.x;
            Control.oldY = mouse.y;
            if(mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
                Control.mouseDown = true;
                if(scene.select!==null)
                    Control.mouseDown = !Control.pick.movingBegin(mouse.x,mouse.y);
                if(Control.mouseDown)
                    Control.mouseDown = !Control.pick.pick(mouse.x,mouse.y);

                fn();
            }
            return true;
        };
    }

    static __onmousemove(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,Control.canvas);
            if(Control.mouseDown) {
                Control.angleY += -(Control.oldX-mouse.x) * 0.01;
                Control.angleX += -(Control.oldY-mouse.y) * 0.01;

                Control.angleX = Math.max(Control.angleX, -Math.PI / 2 + 0.01);
                Control.angleX = Math.min(Control.angleX, Math.PI / 2 - 0.01);

                Control.scene.camera.eye = new Vector([
                    Control.R * Math.sin(Control.angleY) * Math.cos(Control.angleX),
                    Control.R * Math.sin(Control.angleX),
                    Control.R * Math.cos(Control.angleY) * Math.cos(Control.angleX)
                ]).add(Control.scene.camera.center);
                fn();
                Control.oldX = mouse.x;
                Control.oldY = mouse.y;
                Control.scene.update();
            }else{
                if(Control.scene.moving){
                    Control.pick.moving(mouse.x,mouse.y);
                }
            }
        };
    }

    static __onmouseup(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,Control.canvas);
            Control.mouseDown = false;
            if(Control.scene.moving){
                Control.pick.movingEnd(mouse.x,mouse.y);
            }

            fn();
        }
    }

    static __onmousewheel(fn){
        return (event)=>{
            let ev = event || window.event;
            let down = true;
            down = ev.wheelDelta?ev.wheelDelta<0:ev.detail>0;
            if(!down){
                Control.R*=0.9;
                Control.scene.camera.eye = new Vector([
                    Control.R * Math.sin(Control.angleY) * Math.cos(Control.angleX),
                    Control.R * Math.sin(Control.angleX),
                    Control.R * Math.cos(Control.angleY) * Math.cos(Control.angleX)
                ]).add(Control.scene.camera.center);
            }else{
                Control.R*=1.1;
                Control.scene.camera.eye = new Vector([
                    Control.R * Math.sin(Control.angleY) * Math.cos(Control.angleX),
                    Control.R * Math.sin(Control.angleX),
                    Control.R * Math.cos(Control.angleY) * Math.cos(Control.angleX)
                ]).add(Control.scene.camera.center);
            }
            fn();
            Control.scene.update();
            if(ev.preventDefault){
                ev.preventDefault();
            }
            return false;
        }
    }

    static onmousedown(fn=()=>{}){
        addEvent(document,'mousedown',Control.__onmousedown(fn));
    }

    static onmousemove(fn=()=>{}){
        addEvent(document,'mousemove',Control.__onmousemove(fn));
    }

    static onmouseup(fn=()=>{}){
        addEvent(document,'mouseup',Control.__onmouseup(fn));
    }

    static onmousewheel(fn=()=>{}){
        addEvent(Control.canvas,'mousewheel',Control.__onmousewheel(fn));
        addEvent(Control.canvas,'DOMMouseScroll',Control.__onmousewheel(fn));
    }
}

export {Control}