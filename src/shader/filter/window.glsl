vec3 windowSampler(vec2 coord,inout int count){
    if(coord.x<0.0||coord.x>1.0||coord.y<0.0||coord.y>1.0)
        return vec3(0,0,0);

    count++;

    return texture(colorMap,coord).rgb;
}

vec3 window(vec2 coord,float i,float j,out int count){
    count = 0;

    vec2 x = vec2(i/512.0,0);
    vec2 y = vec2(0,j/512.0);

    vec3 color = vec3(0,0,0);

    color += windowSampler(coord+x+y,count);
    color += windowSampler(coord+x-y,count);
    color += windowSampler(coord-x+y,count);
    color += windowSampler(coord-x-y,count);

    return color;
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = vec3(0.0,0.0,0.0);
    float weightSum = 0.0;
    for(int i=0;i<FILTER_WINDOW_WIDTH;i++){
        for(int j=0;j<FILTER_WINDOW_WIDTH;j++){
            int count;
            vec3 tmpColor = window(
                texCoord,
                (float(j) + 0.5) * FILTER_WINDOW_RADIUS.x / float(FILTER_WINDOW_WIDTH),
                (float(i) + 0.5) * FILTER_WINDOW_RADIUS.y / float(FILTER_WINDOW_WIDTH),
                count
            );
            float weight = windowWeightTable[i*j+j];
            weightSum += weight*float(count);
            color += tmpColor * weight;
        }
    }
    return vec4(color/weightSum,1.0);
}