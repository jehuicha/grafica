var gl;

//*--*-*-*-*-*-*
var parsedOBJ = null; 
var modelo;
var indices=0;
var program;
var yMax, yMin;
//*-/-*-*-*-*-*

//Modifique SphericalCamera para poder meter un ingreso manual
let eX=0.0, eY=1.4, eZ=2.0, tX=0.0, tY=eY, tZ=0.0 ;
let e=[eX,eY,eZ], t=[0.0,1.4,0.0], u=[0,1,0];//EYE-TARGET-UP
/*
function keydown(ev, gl, n, matViewUniformLocation, viewMatrix) {
	if(ev.keyCode == 39) { // The right arrow key was pressed
	eX += 0.10;
	tX += 0.10;
	} else
	if (ev.keyCode == 37) { // The left arrow key was pressed
	eX -= 0.10;
	tX -= 0.10;
	} else
	if (ev.keyCode == 38) { // The up arrow key was pressed
	eY += 0.10;
	tY += 0.10;
	} else
	if (ev.keyCode == 40) { // The down arrow key was pressed
	eY -= 0.10;
	tY -= 0.10;
	} else
	if (ev.keyCode == 107) { // The plus key was pressed
	eZ -= 0.10;
	tZ -= 0.10;
	} else
	if (ev.keyCode == 109) { // The minus key was pressed
	eZ += 0.10;
	tZ += 0.10;
	} else { 
		return; } // Prevent unnecessary drawing
	draw(gl, n, matViewUniformLocation, viewMatrix);
}
*/

function recorrer(positionsArray){
	let index=1;
	yMax=positionsArray[0];
	yMin=positionsArray[0];

	while(index<positionsArray.length){

		if(positionsArray[index]<yMin){
			yMin=positionsArray[index];
		}
		if(positionsArray[index]>yMax){
			yMax=positionsArray[index];
		}

		index++;
	}
	console.log(yMin);
	console.log(yMax);
}


var InitDemo = function () {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.shaderSource(fragmentShader, fragmentShaderSource);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

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
	//
	// Create buffer
	//
	let vertexPos = gl.getAttribLocation(program, 'vertexPos');

	modelo = new Model(modelSource);	//Almacenado en la carpeta
	modelo.generateModel(vertexPos);
	parsedOBJ = OBJParser.parseFile(modelSource);

	var positions = parsedOBJ.positions;
	var positionsArray = new Float32Array(positions);
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
	gl.enableVertexAttribArray(texCoordAttribLocation);

	//Creo la textura

	//Wrapping

	//Como las texturas son mapeadas fuera del rango (0,1)? Esto lo aclaramos con wrapping
	//Se puede setear por coordenada, el equivalente a (x,y,z) en coordenadas de textura es (s,t,r).
	//VEASE las segundas coordenadas abajo gl.TEXTURE_WRAP_S y gl.TEXTURE_WRAP_T

	//REPEAT: The integer part of the coordinate will be ignored and a repeating pattern is formed.
	//MIRRORED_REPEAT: The texture will also be repeated, but it will be mirrored when the integer part of the coordinate is odd.
	//CLAMP_TO_EDGE: The coordinate will simply be clamped between 0 and 1.
	//CLAMP_TO_BORDER: The coordinates that fall outside the range will be given a specified border color.
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	console.log(gl.TEXTURE_2D);
	//Filtering

	//Las coordenadas de textura son independientes de la posicion, por lo que no se mapearan a un pixel exactamente
	//Pasa cuando una imagen es estirada o comprimida en relacion a su tamano original
	//Para decidir el color de la muestra en estos casos usamos filtering:

	//NEAREST: Returns the pixel that is closest to the coordinates. (Se ve todo pixelado)
	//LINEAR: Returns the weighted average of the 4 pixels surrounding the given coordinates. (Se ve todo borroneado)
	//NEAREST_MIPMAP_NEAREST, LINEAR_MIPMAP_NEAREST, GL_NEAREST_MIPMAP_LINEAR, GL_LINEAR_MIPMAP_LINEAR: Sample from mipmaps instead.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //Cuando se estira la imagen texels<pixels
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); //Cuando se comprime la imagen pixels<texels

	//Si quisiera usar mipmaps, antes de generarlos, debo subir la imagen
	//glGenerateMipmap(GL_TEXTURE_2D);
	//Y LUEGO aplico el texParameter de arriba
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('crate-image')
	);

	gl.bindTexture(gl.TEXTURE_2D, null);

	// HASTA ACA ES SIEMPRE ASI


	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
	//Manejo de las luces
    var specularColor 		= gl.getUniformLocation(program, "specularColor");
    var u_LightPosition   	= gl.getUniformLocation(program, "u_LightPosition");

    var roughnessValue 		= gl.getUniformLocation(program, "roughnessValue");
	var k 					= gl.getUniformLocation(program, "k");
	var F0 					= gl.getUniformLocation(program, "F0");

    gl.uniform3fv(u_LightPosition,    	[0.0, 0.0, -5.0]);
    gl.uniform3fv(specularColor,		[0.3, 0.9, 1.0]);
    gl.uniform1f(roughnessValue, 0.4);
    gl.uniform1f(k, 0.6);
    gl.uniform1f(F0, 0.4);


//Manejo de matrices de posicion

	var matWorldUniformLocation = gl.getUniformLocation(program, 'modelMatrix');
	var matViewUniformLocation 	= gl.getUniformLocation(program, 'viewMatrix');
	var matProjUniformLocation 	= gl.getUniformLocation(program, 'projMatrix');
	var normalMatrixLocation 	= gl.getUniformLocation(program, 'normalMatrix');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	var normalMatrix = new Float32Array(16);

	mat4.identity(worldMatrix)
	mat4.lookAt(viewMatrix, [eX,eY,eZ], [0.0,1.4,0.0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	mat4.identity(normalMatrix)


	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(normalMatrixLocation, gl.FALSE, normalMatrix);

   camera = new SphericalCamera(55, canvas.clientWidth / canvas.clientHeight);
   //Preparo un oyente para las teclas izq y der
    document.onkeydown = function(ev){ keydown(ev, gl, 9, matViewUniformLocation, viewMatrix); };
 
 
    gl.clearColor(0.25, 0.45, 0.70, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
 
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);  //A la textura activa la quiero enlazar con la primera textura
                                    //Sirve cuando tenes multiples samplers
    //El shader de vertices se ejecutara indices.length veces
  //  _gl = VAOHelper.getVaoExtension();
    //modelo.draw(true,gl,_gl);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
 
};