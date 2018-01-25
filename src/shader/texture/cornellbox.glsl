void cornellbox_attr(float texIndex,out vec3 min,out vec3 max){
    min = readVec3(texParams,vec2(1.0,texIndex),TEX_PARAMS_LENGTH);
    max = readVec3(texParams,vec2(4.0,texIndex),TEX_PARAMS_LENGTH);
}

vec3 cornellbox(vec3 hit,float texIndex){
    vec3 min,max;
    cornellbox_attr(texIndex,min,max);

    if ( hit.x < min.x + 0.0001 )
    	return YELLOW;
    else if ( hit.x > max.x - 0.0001 )
    	return BLUE;
    else if ( hit.y < min.y + 0.0001 )
    	return WHITE;
    else if ( hit.y > max.y - 0.0001 )
    	return WHITE;
    else if ( hit.z > min.z - 0.0001 )
    	return WHITE;

    return BLACK;
}