var fragmentShaderSource = `
precision highp float;

uniform sampler2D uSampler;

varying float vLifespan;
varying vec3 vcolor;

void main(void) {
 	vec4 texColor = texture2D(uSampler, gl_PointCoord);
 	gl_FragColor = vec4(texColor.rgb, texColor.a);
    //gl_FragColor = vec4(vcolor, vLifespan);
}
`