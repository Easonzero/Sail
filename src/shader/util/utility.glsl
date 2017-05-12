vec3 ensure3byW(vec4 vec){
    return vec3(vec.x/vec.w,vec.y/vec.w,vec.z/vec.w);
}

float modMatrix(mat3 mat){
    return dot(cross(mat[0],mat[1]),mat[2]);
}

void getCoordinate(vec3 normal,out vec3 sdir,out vec3 tdir){
	if ( abs( normal.x ) < .5 ){
		sdir = cross( normal, vec3( 1, 0, 0 ) );
	} else {
	    sdir = cross( normal, vec3( 0, 1, 0 ) );
	}
	tdir = cross( normal, sdir );
}

vec3 ortho(vec3 d) {
	if (abs(d.x)>0.00001 || abs(d.y)>0.00001) {
		return vec3(d.y,-d.x,0.0);
	} else  {
		return vec3(0.0,d.z,-d.y);
	}
}

float fresnel(float thetai,float thetat,float eta){
    float r1 = (eta*cos(thetai)-cos(thetat))/(eta*cos(thetai)+cos(thetat));
    float r2 = (cos(thetai)-eta*cos(thetat))/(cos(thetai)+eta*cos(thetat));
    return (r1*r1+r2*r2)/2.0;
}

float maxComponent(vec3 v){
    return max(max(v.x,v.y),v.z);
}