#include "../const/define.glsl"
#include "../util/texhelper.glsl"
#include "checkerboard.glsl"
#include "cornellbox.glsl"

vec3 getSurfaceColor(vec3 hit,float texIndex){
    int texCategory = readInt(texParams,vec2(0.0,texIndex),TEX_PARAMS_LENGTH);
    if(texCategory==CHECKERBOARD) return checkerboard(hit,texIndex);
    else if(texCategory==CORNELLBOX) return cornellbox(hit,texIndex);
    else if(texCategory==UNIFORM_COLOR) return readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    return BLACK;
}