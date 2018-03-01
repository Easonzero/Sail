float random( vec3 scale, float seed ){
	return(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );
}

vec2 random2(float seed){
    return vec2(
        fract( sin( dot( gl_FragCoord.xyz + seed, vec3( 12.9898, 78.233, 151.7182 ) ) ) * 43758.5453 + seed ),
        fract( sin( dot( gl_FragCoord.xyz + seed, vec3( 63.7264, 10.873, 623.6736 ) ) ) * 43758.5453 + seed )
    );
}

int randomInt(float seed,int min,int max){
    return min+
    int(
    fract( sin( dot( gl_FragCoord.xyz + seed, vec3( 12.9898, 78.233, 151.7182 ) ) ) * 43758.5453 + seed ) *
    float(max-min)
    );
}