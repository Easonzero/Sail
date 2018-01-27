vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){
    vec3 f,direct = BLACK,_fpdf;
    bool into = dot(ins.normal,wo) > EPSILON;
    if(!into) {
        if(ins.matCategory == MIRROR) return WHITE;
        ins.normal = -ins.normal;
    }
    ins.hit += ins.normal * 0.0001;

    vec3 ss = normalize(ins.dpdu),ts = cross(ins.normal,ss);
    wo = worldToLocal(wo,ins.normal,ss,ts);

    fpdf = material(ins.seed,ins.matCategory,ins.matIndex,ins.sc,into,wo,wi,f);

    wi = localToWorld(wi,ins.normal,ss,ts);

    if(ins.index>=ln&&ins.matCategory==MATTE)
        for(int i=0;i<ln;i++){
            vec3 light = sampleGeometry(ins,i,_fpdf);
            vec3 toLight = light - ins.hit;
            float d = length(toLight);
            if(!testShadow(Ray(ins.hit, toLight)))
                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);
        }

    return ins.emission+direct;
}