in vec3 raydir;
out vec4 out_color;

void main() {
    int deepth;
    highp vec3 e;
    Ray ray = Ray(eye,raydir);

    trace(ray,e,MAXBOUNCES);

    vec3 texture = texture(cache, gl_FragCoord.xy/512.0).rgb;
    out_color = vec4(mix(e, texture, textureWeight),1.0);
}
