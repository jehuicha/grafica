var gl=null;
var _gl=null;

//Variables del shader
var program;

//Matrices necesarias. La de modelado tiene que estar en la de modelado
//la matriz de vista y proyeccion este en la camara
var camera; 
//Carga del objeto
var matrizObjeto;


//modelo del color
//var modelColor = Utils.hexToRgbFloat("#FA09A0");

//para dibujar como esqueleto

//para las texturas
var yMax, yMin;
var positionsArray;
var indices;

var canvas;
//var boxTexture;

var u_modelMatrix;
var u_viewMatrix;
var u_projMatrix;
var u_LightPosition;
var normalMatrixLocation;

var eX=0.0, eY=1.4, eZ=2.0, tX=0.0, tY=eY, tZ=0.0 ;
var e=[eX,eY,eZ], t=[0.0,1.4,0.0], u=[0,1,0];	

function setTransformaciones(){
	let matrix=mat4.create();
	let traslacion=mat4.create();
	let escalado=mat4.create();

	//Seteo las matrices del ironman
	matrix=mat4.create();
	traslacion=mat4.create();
	escalado=mat4.create();
	//mat4.fromScaling(escalado,[0.25,0.25,0.25]);
	mat4.fromTranslation(traslacion,[0.0,-6.0,-10.0]);
	mat4.multiply(matrix,traslacion,escalado);
	let matrizObjeto = mat4.create();
	matrizObjeto = traslacion;
	//console.log(matrizObjeto);
	modelo.setModelMatrix(matrizObjeto);

	//MODELO EL CUBO

};

function recorrer(positionsArrays){
	let index=1;
	yMax=positionsArrays[0];
	yMin=positionsArrays[0];

	while(index<positionsArrays.length){

		if(positionsArrays[index]<yMin){
			yMin=positionsArrays[index];
		}
		if(positionsArrays[index]>yMax){
			yMax=positionsArrays[index];
		}

		index++;
	}
	//console.log(yMin);
	//console.log(yMax);
};

function cargarShaders(){
	canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl');
	_gl = VAOHelper.getVaoExtension();
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.shaderSource(fragmentShader, fragmentShaderSource);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	};

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	};

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	cargarObjetos();
	cargarBuffers();
};

function cargarObjetos(){

	let vertexPos = gl.getAttribLocation(program, 'vertexPos');
	modelo = new Model(modelSource);	//Almacenado en la carpeta
	modelo.generateModel(vertexPos);
	parsedOBJ = OBJParser.parseFile(modelSource);
};

function cargarBuffers(){
	var positions = parsedOBJ.positions;
	positionsArray = new Float32Array(positions);
	var texCoord = parsedOBJ.textures;
	var normals = parsedOBJ.normals;
	indices = parsedOBJ.indices;
	console.log(indices.length);
	//Busco el maximo y el minimo en positionsArray
	recorrer(positionsArray);

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);

	var texCoordBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

	var aVertPosition = gl.getAttribLocation(program, 'aVertPosition');
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	var anormalLocation = gl.getAttribLocation(program, 'anormal');


	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.vertexAttribPointer(
		aVertPosition, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferObject);
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
	gl.vertexAttribPointer(
		anormalLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(anormalLocation);
	gl.enableVertexAttribArray(aVertPosition);
	//gl.enableVertexAttribArray(texCoordAttribLocation);
	//iluminar();
	crearTextura();


};

function crearTextura(){
//	boxTexture = gl.createTexture();
	//gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //Cuando se estira la imagen texels<pixels
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); //Cuando se comprime la imagen pixels<texels
	
	//gl.texImage2D(
//		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
//		gl.UNSIGNED_BYTE,
//		document.getElementById('crate-image')
//	);

//	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(program);
 	camera = new camaraCuaternion();
 	iluminar();
};

function iluminar(){
	//Manejo de las luces
    var ke 		= gl.getUniformLocation(program, "ke");
    var LPosEye   	= gl.getUniformLocation(program, "LPosEye");
    var color_luz   	= gl.getUniformLocation(program, "color_luz");

    /*
    	uniform vec3 ka;
	uniform vec3 ke;
	uniform float n1; 
	uniform float n2;
	uniform float k;
	uniform float m;
    */
    var ka = gl.getUniformLocation(program, "ka");
    var m 		= gl.getUniformLocation(program, "m");
	var k 					= gl.getUniformLocation(program, "k");
	var n1 = gl.getUniformLocation(program, "n1");
	var n2 = gl.getUniformLocation(program, "n2");

    gl.uniform3fv(LPosEye,    	[1.0, 5.0, -1.0]);
    gl.uniform3fv(color_luz,    	[1, 1, 1]);
    gl.uniform3fv(ke,		[1, 1, 1]);
    gl.uniform3fv(ka,		[0.2, 0.2, 0.2]);
    gl.uniform1f(m, 0.05);
    gl.uniform1f(k, 9);
    gl.uniform1f(n1, 1.0);
     gl.uniform1f(n2, 2.0);

    crearMatrices();
};

function crearMatrices(){
	u_modelMatrix = gl.getUniformLocation(program, 'modelMatrix');
	u_viewMatrix 	= gl.getUniformLocation(program, 'viewMatrix');
	u_projMatrix 	= gl.getUniformLocation(program, 'projMatrix');
	normalMatrixLocation 	= gl.getUniformLocation(program, 'normalMatrix');

	var viewMatrix = camera.getViewMatrix();
	var projMatrix = camera.getProjMatrix();
	var normalMatrix = new Float32Array(16);

	mat4.identity(normalMatrix)

	setTransformaciones();
	//console.log(modelo.getModelMatrix());
	gl.uniformMatrix4fv(u_modelMatrix, gl.FALSE, modelo.getModelMatrix());
	gl.uniformMatrix4fv(u_viewMatrix, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(normalMatrixLocation, gl.FALSE, normalMatrix);

	camera.setModelMatrix(u_viewMatrix);
	//setTransformaciones();

	gl.clearColor(0.25, 0.45, 0.70, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    
    //gl.bindTexture(gl.TEXTURE_2D, boxTexture);
   // gl.activeTexture(gl.TEXTURE0);
    
	//modelo.draw(true,gl,_gl);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
};

function dibujar(){
	let modelMatrix = mat4.create(); 
	let viewMatrix=camera.getViewMatrix();
	let projMatrix=camera.getProjMatrix();

	//PARA DIBUJAR CUALQUIER COSA ES CON ESTAS SENTENCIAS SI O SI
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.useProgram(program);
	//gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix);
	gl.uniformMatrix4fv(u_viewMatrix,false,viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix,false,projMatrix);
	iluminar();
	//Dibujo los objetos
	//setTransformaciones();
	//modelo.generateModel()
	modelo.draw(true,gl,_gl);

	_gl.bindVertexArrayOES(null);



};
//cargarShaders();	
//gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

///////////////////////////////eventos teclado ///////////////////////////
document.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  switch (event.key) {
    case "ArrowDown":
      	camera.rotarAbajo();
      	//gl.uniform3fv(u_LightPosition,camera.getViewMatrix());
      	dibujar();
      	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
       	break;
    case "ArrowUp":
      	camera.rotarArriba();
      	dibujar();
      	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      	break;camera
    case "s":
      	camera.moverAbajo();
		dibujar();
      	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      	break;
    case "w":
      	camera.moverArriba();
		dibujar();
      	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      	break;
    case "ArrowLeft":
      	camera.rotarIzquierda();
		dibujar();
		gl.uniform3fv(u_LightPosition, camera.getProjMatrix());
      	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      	break;
    case "ArrowRight":
      	camera.rotarDerecha();
		dibujar();
		gl.uniform3fv(u_LightPosition,camera.getViewMatrix());
      	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      	break;
    return;

    // Quit when this doesn't handle the key event.
  }

  // Cancel the default action to avoid it being handled twice
  event.preventDefault();
}, true);
