vec3 checkerboard(vec3 hit,float texIndex){
    float size = 0.3,lineWidth=0.01;
    float width = 0.5 * lineWidth / size;
    float fx = hit.x/size-floor(hit.x/size),
    fy = hit.y/size-floor(hit.y/size),
    fz = hit.z/size-floor(hit.z/size);
    bool in_outline = (fx<width||fx>1.0-width)||(fy<width||fy>1.0-width)||(fz<width||fz>1.0-width);
    if (!in_outline) {
        return WHITE;
    } else {
        return GREY;
    }
}