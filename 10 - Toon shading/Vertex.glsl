var vertexShaderText = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec3 aVertexNormal;
	attribute vec2 vertTexCoord;

	varying vec3 vNormal;
	varying vec3 vVertex;
	varying vec2 fragTexCoord;

	uniform mat4 mWorld;
	uniform mat4 mView;
	uniform mat4 mProj;
	uniform mat4 uNMatrix;

void main() {
	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);

	//Paso los varying al shader de fragmentos
	vec4 normal = uNMatrix * vec4(aVertexNormal, 1.0);
    vNormal = normal.xyz;
    vVertex = vertPosition;
    fragTexCoord = vertTexCoord;
}
`