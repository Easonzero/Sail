void trace(Ray ray,out vec3 e,int maxDeepth){
    vec3 fpdf = WHITE;e = BLACK;
    int deepth=1;
    while(++deepth<=maxDeepth){
        Intersect ins = intersectObjects(ray);
        ins.seed = timeSinceStart + float(deepth);
        if(ins.d>=MAX_DISTANCE) break;

        vec3 wi;
        vec3 _fpdf;

        e += shade(ins,-ray.dir,wi,_fpdf)*fpdf;

        fpdf *= _fpdf;
        ray.origin = ins.hit;
        ray.dir = wi;
    }
}