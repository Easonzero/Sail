vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){
    vec3 f,direct = BLACK,_fpdf;

    vec3 ss = normalize(ins.dpdu),ts = cross(ins.normal,ss);
    wo = worldToLocal(wo,ins.normal,ss,ts);

    fpdf = material(ins,wo,wi,f);

    wi = localToWorld(wi,ins.normal,ss,ts);

    if(ins.index>=ln&&ins.matCategory==MATTE)
        for(int i=0;i<ln;i++){
            vec3 light = sampleGeometry(ins,i,_fpdf);
            vec3 toLight = light - ins.hit;
            float d = length(toLight);
            if(!testShadow(Ray(ins.hit + 0.0001*ins.normal, toLight)))
                direct +=  f * max(0.0, dot(normalize(toLight), ins.normal)) * _fpdf/(d * d);
        }

    return ins.emission+direct;
}

void trace(Ray ray,out vec3 e,int maxDeepth){
    vec3 fpdf = WHITE;e = BLACK;
    int deepth=0;
    while(++deepth<=maxDeepth){
        Intersect ins = intersectObjects(ray);
        ins.seed = timeSinceStart + float(deepth);
        if(ins.d>=MAX_DISTANCE) break;

        vec3 wi;
        vec3 _fpdf;
        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;

        fpdf *= clamp(_fpdf,BLACK,WHITE);

        float outdot = dot(ins.normal,wi);
        ray.origin = ins.hit+ins.normal*(outdot>EPSILON?0.0001:-0.0001);
        ray.dir = wi;
    }
}