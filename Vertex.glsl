var vertexShaderSource = `

attribute vec4 a_Position;
attribute vec3 a_Color;
attribute float a_PointSize;


uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform float uPointSize;

varying float vLifespan;
varying vec3 vcolor;

void main(void) {
    gl_Position = a_Position;
    vLifespan = 0.5 * a_Position.w;
    vcolor = a_Color;
    gl_PointSize =0.55 * a_PointSize * vLifespan;
}
`