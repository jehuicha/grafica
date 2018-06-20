var fragmentShaderSource =`
	precision mediump float;

	uniform sampler2D sampler;



	uniform vec3 color_luz;

	uniform vec3 ka;
	uniform vec3 ke;
	uniform float n1; 
	uniform float n2;
	uniform float k;
	uniform float m;

	varying vec3 fNorm;
	varying vec3 Le;
	varying vec3 Ve;
	varying vec3 fPos;
	varying vec3 fLuz;
	varying vec2 fragTexCoord;


void main(){
	float e = 2.718281828;
	float pi = 3.141592654;

	vec3 N = normalize(fNorm);

	//L es el vector entre el ojo y la luz?
	vec3 L = normalize(Le);

	vec3 R = reflect(L, N);
	vec3 V = normalize(Ve);

	vec3 H = normalize(L+V);

	//termino difuso
	float distancia = length(fPos - fLuz);
	float a= 0.1;
	float b= 0.001;
	float c= 0.00001;
	float atenuacion = min( 1.0 / (a+b*distancia + c*distancia*distancia),1.0);
	
	//difuso
	float difuso =  max( dot(L,N) , 0.0 ); 

	///especular
	//termino de Fresnel
	float n = n1/n2;

	//auxiliares
	//float n_1 = n-1;
	//float n_2 = n-2;

	float x = 1.0;

	//auxiliares

	float F0 = ((k*k) + pow((n - x), 2.0) )/((k*k) + pow((n + x), 2.0));
	float tita = acos(dot(L,N));

	float F = F0 + (x - F0)*pow((x-cos(tita)),5.0);

	//distribucion de las orientaciones de las microfacetas

	float beta = acos(dot(H,N));

	float D = pow(e,-pow(tan(beta),2.0)/(m*m))/(m*m*pow(cos(beta),4.0));

	//factor de atenuacion geometrica

	x=2.0;

	float Ge =  dot(N,H) * dot(N,V) / dot(V,H) * x;
	float Gs =  dot(N,H) * dot(N,L) / dot(V,H) * x;

	x=1.0;
	float G = min(x,min(Gs,Ge));

	float especular =  F/pi * D*G/(dot(N,V)*dot(N,L));
	//p = F(tita)/pi * D*G/((N,V)(N,L))
	
	vec3 kd = vec3(texture2D(sampler, fragTexCoord));

	x=0.0;
	
	if(dot(L,N)<x)
		especular = x;

	vec3 color = ka + atenuacion * color_luz * (kd * difuso + ke *especular);


	gl_FragColor = vec4(color,1.0);	
}
`