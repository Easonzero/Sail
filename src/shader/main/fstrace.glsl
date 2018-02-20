in vec3 raydir;
layout(location = 0) out vec4 out_color;
layout(location = 1) out vec4 out_normal;
layout(location = 2) out vec4 out_position;

void main() {
    int deepth;
    vec3 e,n,p;
    Ray ray = Ray(eye,raydir);

    trace(ray,MAXBOUNCES,e,n,p);

    vec3 texture = texture(cache, gl_FragCoord.xy/512.0).rgb;
    out_color = vec4(mix(e, texture, textureWeight),1.0);
    out_normal = vec4(n/2.0+0.5,1.0);
    out_position = vec4(normalize(p),1.0);
}
