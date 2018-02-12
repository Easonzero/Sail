/**
 * Created by eason on 17-4-12.
 */
import {Renderer} from './src/core/renderer'
import {Scene} from './src/scene/scene'
import {Cube,Sphere,Rectangle,Cone,Cylinder,Disk,Hyperboloid,Paraboloid,Cornellbox} from './src/scene/geometry'
import {Camera} from './src/scene/camera'
import {Matte,Mirror,Metal,Glass} from './src/scene/material'
import {UniformColor,Checkerboard,Checkerboard2,Bilerp,Mix,Scale,UV} from './src/scene/texture'
import {Control} from './src/utils/control'
import {Matrix,Vector} from './src/utils/matrix';
import {Color} from './src/utils/color';

window.Sail = {
    Renderer:Renderer,
    Scene:Scene,
    Cube:Cube,
    Sphere:Sphere,
    Rectangle:Rectangle,
    Cone:Cone,
    Cylinder:Cylinder,
    Disk:Disk,
    Hyperboloid:Hyperboloid,
    Paraboloid:Paraboloid,
    Cornellbox:Cornellbox,
    Camera:Camera,
    Control:Control,
    Matte:Matte,
    Mirror:Mirror,
    Metal:Metal,
    Glass:Glass,
    UniformColor:UniformColor,
    Checkerboard:Checkerboard,
    Checkerboard2:Checkerboard2,
    Bilerp:Bilerp,
    Mix:Mix,
    Scale:Scale,
    UV:UV,
    Color:Color,
    Matrix:Matrix,
    Vector:Vector
};

window.$V = Matrix;
window.$M = Vector;