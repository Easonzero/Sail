vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){
    vec3 f,direct = BLACK,_fpdf;
    bool into = dot(ins.normal,-wo) < 0.0;
    if(!into) {ins.normal = -ins.normal;}

    wo = worldToLocal(wo,ins.normal,ins.dpdu,ins.dpdv);
    fpdf = material(ins.seed,ins.matCategory,ins.matIndex,ins.sc,into,wo,wi,f);
    wi = localToWorld(wi,ins.normal,ins.dpdu,ins.dpdv);

    if(ins.index>=ln&&ins.matCategory==MATTE)
        for(int i=0;i<ln;i++){
            vec3 light = sampleGeometry(ins,i,_fpdf);
            vec3 toLight = light - ins.hit;
            float d = length(toLight);
            if(!testShadow(Ray(ins.hit + ins.normal * 0.0001, toLight)))
                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);
        }

    return ins.emission+direct;
}