/**
 * Created by eason on 17-4-26.
 */
function addEvent(obj,xEvent,fn) {
    if(obj.attachEvent){
        obj.attachEvent('on'+xEvent,fn);
    }else{
        obj.addEventListener(xEvent,fn,false);
    }
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
    constructor(canvas,scene){
        this.scene = scene;
        this.canvas = canvas;

        this.mouseDown = false;
        this.angleX = 0;
        this.angleY = 0;
        this.R = this.scene.camera.eye.distanceFrom(this.scene.camera.center);

        this.onmousedown();
        this.onmousemove();
        this.onmouseup();
        this.onmousewheel();
    }

    __onmousedown(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,this.canvas);
            this.oldX = mouse.x;
            this.oldY = mouse.y;
            if(mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
                this.mouseDown = true;
                this.angleX = Math.asin((this.scene.camera.eye.e(2)-this.scene.camera.center.e(2))/this.R);
                this.angleY = Math.acos((this.scene.camera.eye.e(3)-this.scene.camera.center.e(3))/(this.R*Math.cos(this.angleX)));
                if(this.scene.camera.eye.e(1)-this.scene.camera.center.e(1)<0) this.angleY = -this.angleY;
                fn();
                this.scene.update();
            }

            return true;
        };
    }

    __onmousemove(fn){
        return (event)=>{
            let mouse = canvasMousePos(event,this.canvas);
            if(this.mouseDown) {
                this.angleY += (this.oldX-mouse.x) * 0.01;
                this.angleX += -(this.oldY-mouse.y) * 0.01;

                this.angleX = Math.max(this.angleX, -Math.PI / 2 + 0.01);
                this.angleX = Math.min(this.angleX, Math.PI / 2 - 0.01);

                this.scene.camera.eye = $V([
                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
                    this.R * Math.sin(this.angleX),
                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
                ]).add(this.scene.camera.center);

                this.oldX = mouse.x;
                this.oldY = mouse.y;

                fn();
                this.scene.update();
            }
        };
    }

    __onmouseup(fn){
        return (event)=>{
            this.mouseDown = false;
            fn();
            this.scene.update();
        }
    }

    __onmousewheel(fn){
        return (event)=>{
            let ev = event || window.event;
            let down = true;
            down = ev.wheelDelta?ev.wheelDelta<0:ev.detail>0;
            if(!down){
                this.R*=0.9;
                this.scene.camera.eye = $V([
                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
                    this.R * Math.sin(this.angleX),
                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
                ]).add(this.scene.camera.center);
            }else{
                this.R*=1.1;
                this.scene.camera.eye = $V([
                    this.R * Math.sin(this.angleY) * Math.cos(this.angleX),
                    this.R * Math.sin(this.angleX),
                    this.R * Math.cos(this.angleY) * Math.cos(this.angleX)
                ]).add(this.scene.camera.center);
            }
            fn();
            this.scene.update();
            if(ev.preventDefault){
                ev.preventDefault();
            }
            return false;
        }
    }

    onmousedown(fn=()=>{}){
        addEvent(document,'mousedown',this.__onmousedown(fn));
    }

    onmousemove(fn=()=>{}){
        addEvent(document,'mousemove',this.__onmousemove(fn));
    }

    onmouseup(fn=()=>{}){
        addEvent(document,'mouseup',this.__onmouseup(fn));
    }

    onmousewheel(fn=()=>{}){
        addEvent(this.canvas,'mousewheel',this.__onmousewheel(fn));
        addEvent(this.canvas,'DOMMouseScroll',this.__onmousewheel(fn));
    }
}

export {Control}