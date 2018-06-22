var gl;

//*--*-*-*-*-*-*
var parsedOBJ = null; 
var modelo;
var canvas;
var program;
//*-/-*-*-*-*-*

function inicializarLuces(){
	gl.useProgram(program);
	
	program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
    program.uShininess       = gl.getUniformLocation(program, "uShininess");
	program.uLightAmbient    = gl.getUniformLocation(program, "uLightAmbient");
	program.uLightDiffuse    = gl.getUniformLocation(program, "uLightDiffuse");
	program.uLightDirection  = gl.getUniformLocation(program, "uLightDirection");

	gl.uniform3f(program.uLightAmbient,0.01,0.01,0.01);
	gl.uniform3f(program.uLightDirection, 1.0, 0.0, 0.0);
	gl.uniform3f(program.uLightDiffuse, 0.5,0.5,0.5);	
	gl.uniform3f(program.uMaterialDiffuse, 0.5,0.8,0.1);
    gl.uniform1f(program.uShininess, 20.0);
}

var InitDemo = function () {
	canvas = document.getElementById('game-surface');
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

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

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

	var modelVertices = parsedOBJ.positions;
	var modelIndices = parsedOBJ.indices;
	var modelTexCoord = parsedOBJ.textures;
	var modelNormals = parsedOBJ.normals;

	var modelVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);

	var modelTexCoordBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoord), gl.STATIC_DRAW);

	var modelIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

	var modelNormalBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelNormalBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelNormals), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	var normalAttribLocation = gl.getAttribLocation(program, 'aVertexNormal');

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBufferObject);
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordBufferObject);
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelNormalBufferObject);
	gl.vertexAttribPointer(
		normalAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		0 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(texCoordAttribLocation);
	gl.enableVertexAttribArray(normalAttribLocation);

	//Creo la textura
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);

	//Wrapping and filtering
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //Cuando se estira la imagen texels<pixels
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); //Cuando se comprime la imagen pixels<texels

	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('textura')
	);

	gl.bindTexture(gl.TEXTURE_2D, null);

	//Inicializo las luces
	inicializarLuces();

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
	var matNormalUniformLocation = gl.getUniformLocation(program, 'uNMatrix');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	var uNMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.fromScaling(worldMatrix, [5.0,5.0,5.0])
	mat4.lookAt(viewMatrix, [0.0, 0.0, 3], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

	//La matriz inversa es la traspuesta de la inversa
	mat4.identity(uNMatrix)
	mat4.invert(uNMatrix,viewMatrix);
	mat4.transpose(uNMatrix,uNMatrix);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(matNormalUniformLocation, gl.FALSE, uNMatrix);
	gl.clearColor(0.28, 0.28, 0.30, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.BLEND);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);
	gl.clearDepth(100.0);
	gl.depthFunc(gl.LEQUAL);

	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.activeTexture(gl.TEXTURE0); 	//A la textura activa la quiero enlazar con la primera textura
									//Sirve cuando tenes multiples samplers
	//El shader de vertices se ejecutara modelIndices.length veces

	gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);

};