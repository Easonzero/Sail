/**
 * Created by eason on 17-4-12.
 */

import * as matrix from './src/matrix';
import {Renderer} from './src/core/renderer';
import {Scene} from './src/scene/scene';
import {Cube,Sphere,Plane,Object3D} from './src/scene/geometry';
import {Camera} from './src/scene/camera';
import {DirectionalLight,PointLight} from './src/scene/light';
import {Parser} from './src/parser';

window.Sail = {
    Renderer:Renderer,
    Scene:Scene,
    Cube:Cube,
    Sphere:Sphere,
    Plane:Plane,
    Object:Object3D,
    Camera:Camera,
    DirectionalLight:DirectionalLight,
    PointLight:PointLight,
    Parser:Parser
};