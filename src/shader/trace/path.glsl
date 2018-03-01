vec3 shade(Intersect ins,vec3 wo,out vec3 wi,out vec3 fpdf){
    vec3 f,direct = BLACK;
    vec3 ss = normalize(ins.dpdu),ts = cross(ins.normal,ss);
    wo = worldToLocal(wo,ins.normal,ss,ts);

    fpdf = clamp(material(ins,wo,wi,f),BLACK,WHITE);

    wi = localToWorld(wi,ins.normal,ss,ts);

    if(ins.emission==BLACK&&ins.matCategory==MATTE)
        direct += light_sample(ins) * f;

    return ins.emission+direct;
}

void trace(Ray ray,int maxDeepth,out vec3 e,out vec3 n,out vec3 p){
    vec3 fpdf = WHITE;e = BLACK;
    int deepth=0;
    while(deepth++<maxDeepth){
        Intersect ins = intersectObjects(ray);
        ins.seed = timeSinceStart + float(deepth);
        if(ins.d>=MAX_DISTANCE) break;

        if(deepth==1){
            n = ins.normal;
            p = ins.hit;
        }

        vec3 wi;
        vec3 _fpdf;
        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;
        fpdf *= _fpdf;

        float outdot = dot(ins.normal,wi);
        ray.origin = ins.hit+ins.normal*(outdot>EPSILON?0.0001:-0.0001);
        ray.dir = wi;
    }
}