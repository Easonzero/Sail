#include "../const/define.glsl"
#include "../util/texhelper.glsl"
#include "checkerboard.glsl"

vec3 getSurfaceColor(vec3 hit,float texIndex){
    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);
    if(texCategory==CHECKERBOARD) return checkerboard(hit,texIndex);
    else if(texCategory==UNIFORM_COLOR){
        return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    }else{
        if(texCategory==1){
            return readTexture(tex1,vec2(1.0,texIndex));
        }else if(texCategory==2){
            return readTexture(tex2,vec2(1.0,texIndex));
        }else if(texCategory==3){
            return readTexture(tex3,vec2(1.0,texIndex));
        }else if(texCategory==4){
            return readTexture(tex4,vec2(1.0,texIndex));
        }else{
            return readTexture(tex1,vec2(1.0,texIndex));
        }
    }
}