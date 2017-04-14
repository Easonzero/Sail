/**
 * Created by eason on 17-4-12.
 */

import * as matrix from './src/matrix';
import {Renderer} from './src/renderer';
import {Scene} from './src/scene';
import {Cube,Sphere,Plane,Object} from './src/geometry';
import {Camera} from './src/camera';
import {DirectionalLight,PointLight} from './src/light';

window.Sail = {
    Renderer:Renderer,
    Scene:Scene,
    Cube:Cube,
    Sphere:Sphere,
    Plane:Plane,
    Object:Object,
    Camera:Camera,
    DirectionalLight:DirectionalLight,
    PointLight:PointLight
};