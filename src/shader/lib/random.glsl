float random( vec3 scale, float seed ){
	return(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );
}

vec3 cosineWeightedDirection( float seed, vec3 normal ){
	float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float angle = 6.283185307179586 * v;
	vec3 sdir, tdir;
	if ( abs( normal.x ) < .5 )
	{
		sdir = cross( normal, vec3( 1, 0, 0 ) );
	} else {
	    sdir = cross( normal, vec3( 0, 1, 0 ) );
	}
	tdir = cross( normal, sdir );
	return u*cos(angle)*sdir + u*sin(angle)*tdir + cos(asin(u))*normal;
}

vec3 uniformlyRandomDirection( float seed ){
	float u = random( vec3( 12.9898, 78.233, 151.7182 ), seed );
	float v = random( vec3( 63.7264, 10.873, 623.6736 ), seed );
	float z = 1.0 - 2.0 * u;   float r = sqrt( 1.0 - z * z );
	float angle = 6.283185307179586 * v;
	return vec3( r * cos( angle ), r * sin( angle ), z );
}

vec3 uniformlyRandomVector( float seed ){
	return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));
}