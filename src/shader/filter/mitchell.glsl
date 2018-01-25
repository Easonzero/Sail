float mitchell1D(float x){
    x = abs(2.0 * x);
    if (x > 1.0)
        return ((-FILTER_MITCHELL_B - 6.0 * FILTER_MITCHELL_C) * x * x * x + (6.0 * FILTER_MITCHELL_B + 30.0 * FILTER_MITCHELL_C) * x * x +
                (-12.0 * FILTER_MITCHELL_B - 48.0 * FILTER_MITCHELL_C) * x + (8.0 * FILTER_MITCHELL_B + 24.0 * FILTER_MITCHELL_C)) * (1.f / 6.f);
    else
        return ((12.0 - 9.0 * FILTER_MITCHELL_B - 6.0 * FILTER_MITCHELL_C) * x * x * x +
                (-18.0 + 12.0 * FILTER_MITCHELL_B + 6.0 * FILTER_MITCHELL_C) * x * x + (6.0 - 2.0 * FILTER_MITCHELL_B)) *
                (1.f / 6.f);
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = vec3(0.0,0.0,0.0);
    vec2 del = FILTER_MITCHELL_R/512.0;
    vec2 o = texCoord-del/2.0;
    int sampleNum = 0;
    for(int i=0;i<int(FILTER_MITCHELL_R.x);i++){
        for(int j=0;j<int(FILTER_MITCHELL_R.y);j++){
            vec2 coord = o+vec2(float(i)/512.0,0)+vec2(0,float(j)/512.0);
            if(coord.x<0.0||coord.y<0.0 ||
            coord.x>=1.0||coord.y>=1.0) continue;

            vec2 d = (coord-texCoord)*512.0;

            vec3 tmpColor = texture(tex, coord).rgb;
            float weight = mitchell1D((abs(d.x)+0.5)*FILTER_MITCHELL_INVX/FILTER_MITCHELL_R.y)
                            * mitchell1D((abs(d.y)+0.5)*FILTER_MITCHELL_INVY/FILTER_MITCHELL_R.x);
            color += tmpColor * weight;

            sampleNum++;
        }
    }
    return vec4(color/float(sampleNum),1.0);
}