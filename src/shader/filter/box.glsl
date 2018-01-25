float box(vec2 coord){
    return 1.0;
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = vec3(0.0,0.0,0.0);
    vec2 del = FILTER_BOX_R/512.0;
    vec2 o = texCoord-del/2.0;
    int sampleNum = 0;
    for(int i=0;i<int(FILTER_BOX_R.x);i++){
        for(int j=0;j<int(FILTER_BOX_R.y);j++){
            vec2 coord = o+vec2(float(i)/512.0,0)+vec2(0,float(j)/512.0);

            if(coord.x<0.0||coord.y<0.0 ||
            coord.x>=1.0||coord.y>=1.0) continue;

            vec3 tmpColor = texture(tex, coord).rgb;
            float weight = box(coord);
            color += tmpColor * weight;

            sampleNum++;
        }
    }
    return vec4(color/float(sampleNum),1.0);
}