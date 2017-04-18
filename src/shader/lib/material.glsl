#include "define.glsl"

struct Material{
    vec3 diffuse;
    vec3 specular;
    float glossiness;
    float roughness;
};

Material shiny(){
    return Material(WHITE,GREY,0.4,250.0);
}

Material checkerboard(vec3 pos){
    vec3 diffuse;
    float glossiness;
    if (int(floor(pos.z)+floor(pos.x)) % 2 != 0) {
        diffuse = WHITE;
        glossiness = 0.1;
    } else {
        diffuse = BLACK;
        glossiness = 0.7;
    }
    return Material(diffuse,WHITE,glossiness,150.0);
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