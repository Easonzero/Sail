# Sail
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
[![Badge](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu/#/zh_CN)

a path tracer using WebGL for realtime performance

*Sail*是一个基于Webgl技术实现的具有实时表现的路径追踪器

## 渲染结果展示

[Demo](https://easonzero.github.io/Sail/)

1. 康奈尔盒子

![cornellbox](./img/ex_cornellbox.png)

2. 金属、镜面、漫反射表面材质

![meterial](./img/ex_meterial.png)

## 特性

1. 使用基本视线路径追踪方法
2. 使用直接光照、间接光照混合渲染
3. 实时可交互
4. 支持棋盘、线性混合等过程纹理
5. 支持金属、镜面、玻璃、漫反射材质(采用Fresnel和微分布实现的bsdf)
6. 点光源,聚光灯,面积光源
7. 支持球体、立方体、矩形、锥面、二次曲面等几何形状
8. 支持盒式、sinc、高斯等滤波器

## 运行

可以直接执行/ui/index.html,通过图形界面尝试渲染。也可以通过调用bin/sail.js,自己创建渲染脚本,以下是测试代码及注释

```js
let canvas = document.getElementById('canvas');

let renderer = new Sail.Renderer(canvas);
let scene = new Sail.Scene();
//设置摄像机参数
let camera = new Sail.Camera([2.78,2.73,-6],[2.78,2.73,2.79]);

//创建材质、纹理
let matte = new Sail.Matte(0.7);
let metal = new Sail.Metal(0,0.01,0.1);
let mirror = new Sail.Mirror(1.0);
let glass = new Sail.Glass(1,1,1.5);
let cornellbox = new Sail.CornellBox([0,0,0],[5.560,5.488,5.592]);

//创建光源
scene.add(new Sail.Cube([2.13,5.487,2.27],[3.43,5.488,3.32],matte,Sail.Color.create([0,0,0]),[8,8,8]));
//创建盒子
scene.add(new Sail.Cube([0,0,-7],[5.560,5.488,5.592],matte,cornellbox));
//创建球体
scene.add(new Sail.Sphere([2,1.25,2.70],1.2,mirror,Sail.Color.create([1,1,1])));
//添加摄像机
scene.add(camera);
//创建控制器
let control = new Sail.Control(canvas,scene);
//提交场景数据
renderer.update(scene);
//渲染循环
function tick(){
    requestAnimationFrame(tick);
    renderer.render(scene);
}

tick();
```

想要修改源代码需要安装rollup。修改源代码后，在项目根目录下执行下面的代码编译项目
```shell
rollup -c
```
