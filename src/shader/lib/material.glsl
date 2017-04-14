#include "define.glsl"

struct Material{
    vec3 diffuse;
    vec3 specular;
    float reflect;
    float roughness;
};

Material shiny(){
    return Material(WHITE,GREY,0.7,250.0);
}

Material checkerboard(vec3 pos){
    vec3 diffuse;
    float reflect;
    if (int(floor(pos.z) + floor(pos.x)) % 2 != 0) {
        diffuse = WHITE;
        reflect = 0.1;
    } else {
        diffuse = BLACK;
        reflect = 0.7;
    }
    return Material(diffuse,WHITE,reflect,150.0);
}

Material queryMaterial(int material,vec3 pos){
    Material result;
    if(material == SHINY){
        result = shiny();
    }else if(material == CHECKERBOARD){
        result = checkerboard(pos);
    }
    return result;
}