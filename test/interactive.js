/**
 * Created by eason on 17-4-17.
 */
let mouseDown = false, oldX, oldY;
let angleX = 0,angleY = 0;
let R;

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

function canvasMousePos(event) {
    let mousePos = eventPos(event);
    let canvasPos = elementPos(canvas);
    return {
        x: mousePos.x - canvasPos.x,
        y: mousePos.y - canvasPos.y
    };
}

document.onmousedown = function(event) {
    let mouse = canvasMousePos(event);
    oldX = mouse.x;
    oldY = mouse.y;

    if(mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
        mouseDown = true;
        R = camera.eye.distanceFrom(camera.center);
        angleX = Math.asin((camera.eye.e(2)-camera.center.e(2))/R);
        angleY = Math.acos((camera.eye.e(3)-camera.center.e(3))/(R*Math.cos(angleX)));
        if(camera.eye.e(1)-camera.center.e(1)<0) angleY = -angleY;
    }

    return true;
};

document.onmousemove = function(event) {
    let mouse = canvasMousePos(event);
    if(mouseDown) {
        angleY += (oldX-mouse.x) * 0.01;
        angleX += -(oldY-mouse.y) * 0.01;

        angleX = Math.max(angleX, -Math.PI / 2 + 0.01);
        angleX = Math.min(angleX, Math.PI / 2 - 0.01);

        camera.eye = $V([
            R * Math.sin(angleY) * Math.cos(angleX),
            R * Math.sin(angleX),
            R * Math.cos(angleY) * Math.cos(angleX)
        ]).add(camera.center);
        scene.update();

        oldX = mouse.x;
        oldY = mouse.y;
    }
};

document.onmouseup = function(event) {
    mouseDown = false;
};