var fragmentShaderText =`
precision mediump float;

uniform float uShininess;
uniform mat4 mWorld;
uniform mat4 mView;
uniform vec3 uLightDirection;
uniform vec3 uLightAmbient;
uniform vec3 uLightDiffuse;
uniform vec3 uMaterialDiffuse;


varying vec3 vNormal;
varying vec3 vVertex;

void main(void)  {
	
vec4 color0 = vec4(uMaterialDiffuse, 1.0); // Material Color
vec4 color1 = vec4(0.0, 0.0, 0.0, 1.0);    // Silhouette Color
vec4 color2 = vec4(uMaterialDiffuse, 1.0); // Specular Color

vec3 N = vNormal;
vec3 L = normalize(uLightDirection);

vec4 eyePos = mView * mWorld * vec4(0.0,0.0,0.0,1.0); //Extract the location of the camera

vec3 EyeVert = normalize(-eyePos.xyz); // invert to obtain eye position



vec3 EyeLight = normalize(L+EyeVert);

// Simple Silhouette
float sil = max(dot(N,EyeVert), 0.0);
if (sil < 0.4) {
    gl_FragColor = color1;
}
else 
{
   gl_FragColor = color0;

   // Specular part
   float spec = pow(max(dot(N,EyeLight),0.0), uShininess);

   if (spec < 0.2) gl_FragColor *= 0.8;
   else gl_FragColor = color2;

   // Diffuse part
   float diffuse = max(dot(N,L),0.0);
   if (diffuse < 0.5) gl_FragColor *=0.8;
   }
}
`