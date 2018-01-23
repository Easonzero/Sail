float random( vec3 scale, float seed ){
	return(fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) );
}

vec2 random2(float seed){
	return vec2(fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453 + seed),
		fract(cos(dot(gl_FragCoord.xy ,vec2(4.898,7.23))) * 23421.631 + seed));
}