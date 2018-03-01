#define FILTER_WAVELET_CPHI 4.0
#define FILTER_WAVELET_NPHI 128.0
#define FILTER_WAVELET_ZPHI 1.0

float W(vec2 uv,float stepwidth,float h,vec4 cval,vec4 nval,vec4 pval,out vec4 ctmp){
    ctmp = texture(colorMap, uv);
    vec4 t = cval - ctmp;
    float dist2 = dot(t,t);
    float c_w = min(exp(-(dist2)/FILTER_WAVELET_CPHI), 1.0);
    vec4 ntmp = texture(normalMap, uv);
    dist2 = max(dot(t,t)/(stepwidth*stepwidth),0.0);
    float n_w = min(exp(-(dist2)/FILTER_WAVELET_NPHI), 1.0);
    vec4 ptmp = texture(positionMap, uv);
    t = pval - ptmp;
    dist2 = dot(t,t);
    float p_w = min(exp(-(dist2)/FILTER_WAVELET_ZPHI),1.0);
    float weight = c_w * n_w * p_w * h;
    ctmp *= weight;
    return weight;
}

vec4 pixelFilter(vec2 texCoord){
    vec4 color = vec4(0.0);
    float weightSum = 0.0;
    vec4 cval = texture(colorMap, texCoord);
    vec4 nval = texture(normalMap, texCoord);
    vec4 pval = texture(positionMap, texCoord);
    float h[5] = float[5](0.375, 0.25, 0.0625, 0.0625, 0.25);
    for(int n=0;n<3;n++){
        float stepwidth = pow(2.0,float(n)) - 1.0;
        int count = 0;
        for(int i=0;i<5;i++){
            for(int j=0;j<5;j++,count++){
                int delt = abs(count-12);
                float _h = 0.0;
                if(delt%(int(stepwidth)+1)==0)
                    _h = h[(delt/(int(stepwidth)+1))%5];

                if(_h==0.0) continue;

                vec2 uv = texCoord -
                    vec2(FILTER_WAVELET_R.x / 512.,FILTER_WAVELET_R.y / 512.) +
                    vec2((float(j) + 0.5) * FILTER_WAVELET_R.x / 1280.,
                        (float(i) + 0.5) * FILTER_WAVELET_R.y / 1280.);

                vec4 ctmp;
                float weight = W(uv,stepwidth,_h,cval,nval,pval,ctmp);
                weightSum += weight;
                color += ctmp;
            }
        }
    }
    return vec4(color/weightSum);
}
