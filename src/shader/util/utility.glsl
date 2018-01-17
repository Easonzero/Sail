vec3 worldToLocal(vec3 v,vec3 ns,vec3 ss,vec3 ts){
    return vec3(dot(v,ss),dot(v,ts),dot(v,ns));
}

vec3 localToWorld(vec3 v,vec3 ns,vec3 ss,vec3 ts){
    return vec3(ss.x * v.x + ts.x * v.y + ns.x * v.z,
        ss.y * v.x + ts.y * v.y + ns.y * v.z,
        ss.z * v.x + ts.z * v.y + ns.z * v.z);
}

vec3 ensure3byW(vec4 vec){
    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);
}

float modMatrix(mat3 mat){
    return dot(cross(mat[0],mat[1]),mat[2]);
}

vec3 ortho(vec3 d) {
	if (abs(d.x)>0.00001 || abs(d.y)>0.00001) {
		return vec3(d.y,-d.x,0.0);
	} else  {
		return vec3(0.0,d.z,-d.y);
	}
}

float maxComponent(vec3 v){
    return max(max(v.x,v.y),v.z);
}

void swap(inout float f1,inout float f2){
    float tmp = f1;
    f1 = f2;
    f2 = tmp;
}