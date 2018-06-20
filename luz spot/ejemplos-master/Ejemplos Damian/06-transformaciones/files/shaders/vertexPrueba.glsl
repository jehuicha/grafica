// Vertex Shader source, asignado a una variable para usarlo en un tag <script>
var vertexShaderSource = `

precision highp float;
precision highp int;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

attribute vec3 vertexPos;
attribute vec3 normalPos;

varying vec4 color;
uniform vec4 posL;

uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;

uniform vec3 Idir;

uniform vec3 modelColor;

uniform float CoefEsp;
uniform float angle; // en unidades luego lo paso a radianes con radians()

void main(void) {
	gl_Position = projMatrix * viewMatrix *modelMatrix* vec4( vertexPos, 1.0 );

//calculo el coseno del angulo del spot
	float cosA=cos(radians(angle));

//obtengo vector normalizado de la direccion de la luz apuntando a Idir, en este caso apunta al origen
	vec3 dirL = normalize(Idir-vec3(posL));

//obtengo vector normalizado de la luz al vertice del objeto
	vec3 vpoint = normalize(vertexPos - vec3(posL));

//calculo angulo entre el vector de la luz al origen y el vector de la luz al vertice
	float anglePoint = dot(dirL,vpoint);

	float ilum = 0.0;  
	ilum= step(cosA,anglePoint);


	vec3 vE = vec3(viewMatrix * vec4(vertexPos, 1.0));

	vec3 vLE = vec3(posL) - vE;
	vec3 L = normalize(vLE);
	vec3 N = normalize(normalMatrix * normalPos);
	vec3 H = normalize(L+vE);

    
    float difuso = max(dot(L,N),0.0);
    float specBlinnPhong = pow(max(dot(N,H),0.0), CoefEsp);
    
    if(dot(L,N) <0.0)
        specBlinnPhong = 0.0;
    
    color = vec4(ka + ilum * kd*difuso * modelColor + ilum * ks*specBlinnPhong,1.0);
}
`