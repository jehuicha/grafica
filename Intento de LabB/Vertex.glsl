var vertexShaderSource  = `
	precision mediump float;





uniform mat4 normalMatrix;
uniform mat4 projMatrix;
uniform vec3 LPosEye;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform vec3 specularColor;


attribute vec3 aVertPosition;
attribute vec3 anormal;
attribute vec2 vertTexCoord;

varying vec3 Le;
varying vec3 Ve;
varying vec3 fNorm;
varying vec3 fPos;
varying vec3 fLuz;
varying vec2 fragTexCoord;

void main(){
	//posicion en coordenadas del ojo
	vec3 vPosEye = vec3(modelMatrix * viewMatrix * vec4(aVertPosition,1.0));
	//fPosEye = vPosEye;
	fPos = vPosEye;
	fLuz = LPosEye;


	fNorm = normalize(mat3(normalMatrix) * anormal);
	Le = normalize(vec3(LPosEye - vPosEye));
	Ve = normalize(-vPosEye);

	fragTexCoord = vertTexCoord;

	gl_Position = projMatrix  * modelMatrix * viewMatrix * vec4(aVertPosition, 1.0);
}


`