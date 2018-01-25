#define PI 3.141592653589793

float sinc(float x){
    x = abs(x);
    if (x < 1e-5) return 1.0;
    return sin(PI * x) / (PI * x);
}

float windowedSinc(float x, float radius){
    x = abs(x);
    if (x > radius) return 0.0;
    float lanczos = sinc(x / FILTER_SINC_TAU);
    return sinc(x) * lanczos;
}

vec4 pixelFilter(vec2 texCoord){
    vec3 color = vec3(0.0,0.0,0.0);
    vec2 del = FILTER_SINC_R/512.0;
    vec2 o = texCoord-del/2.0;
    int sampleNum = 0;
    for(int i=0;i<int(FILTER_SINC_R.x);i++){
        for(int j=0;j<int(FILTER_SINC_R.y);j++){
            vec2 coord = o+vec2(float(i)/512.0,0)+vec2(0,float(j)/512.0);
            if(coord.x<0.0||coord.y<0.0 ||
            coord.x>=1.0||coord.y>=1.0) continue;

            vec2 d = (coord-texCoord)*512.0;

            vec3 tmpColor = texture(tex, coord).rgb;
            float weight = windowedSinc((abs(d.x)+0.5)/FILTER_SINC_R.y,FILTER_SINC_R.x)
                            * windowedSinc((abs(d.y)+0.5)/FILTER_SINC_R.x,FILTER_SINC_R.y);
            color += tmpColor * weight;

            sampleNum++;
        }
    }
    return vec4(color/float(sampleNum),1.0);
}