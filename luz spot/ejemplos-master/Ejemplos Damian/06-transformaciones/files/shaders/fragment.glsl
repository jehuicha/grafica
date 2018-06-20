// Fragment Shader source, asignado a una variable para usarlo en un tag <script>
var fragmentShaderSource = `

precision highp float;
precision highp int;

varying vec4 color;

void main(void) {
    gl_FragColor = color;
}
`