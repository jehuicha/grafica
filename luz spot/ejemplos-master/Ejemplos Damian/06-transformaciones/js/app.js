// WebGL context and extensions
var gl = null;
var _gl = null;//This extension is to support VAOs in webgl1. (In webgl2, functions are called directly to gl object.)

//Shader program
var shaderProgram  = null; 

//Uniform locations.
var u_modelMatrix;
var u_viewMatrix;
var u_projMatrix;
var u_modelColor;

//Uniform values.
var modelColor = Utils.hexToRgbFloat("#FFFFFF");

//Models (OBJ)
var cono;
var cono2;
var cono3;
var cono4;
var cono5;
var cono6;
// Auxiliary objects
var axis;

// Camera
var camera;

// Flags
var isSolid = false;

function loadModels(pos_location, normal_location) {
	// Load each model (OBJ) and generate the mesh
	cono = new Model(ironmanSource);
	cono.generateModel(pos_location, normal_location);
	//cono2 = new Model(conoSource);
	//cono2.generateModel(pos_location, normal_location);
	//cono3 = new Model(conoSource);
	//cono3.generateModel(pos_location, normal_location);
	// cono4 = new Model(conoSource);
	// cono4.generateModel(pos_location, normal_location);
	// cono5 = new Model(conoSource);
	// cono5.generateModel(pos_location, normal_location);
	// cono6 = new Model(conoSource);
	// cono6.generateModel(pos_location, normal_location);

}

function setModelsTransformations() {
	let matrix = mat4.create();
	let translation = mat4.create();
	let scaling = mat4.create();
	let matrix2 = mat4.create();
	let rotate = mat4.create();

	// Set cono model matrix
	matrix = mat4.create();
	translation = mat4.create();
	scaling = mat4.create();
	mat4.fromScaling(scaling, [0.5, 0.5, 0.5]);
	mat4.fromTranslation(translation, [0.0, 0.0, 0.0]);
	mat4.multiply(matrix, matrix, scaling);
	cono.setModelMatrix(matrix);

}

function onLoad() {
	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl');
	_gl = VAOHelper.getVaoExtension();

	//SHADERS
	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);

	let posLocation = gl.getAttribLocation(shaderProgram, 'vertexPos');
	let normalLocation = gl.getAttribLocation(shaderProgram, 'normalPos');
	u_modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projMatrix');

	u_ka = gl.getUniformLocation(shaderProgram, 'ka');
	u_normalMatrix = gl.getUniformLocation(shaderProgram, 'normalMatrix');
	u_kd = gl.getUniformLocation(shaderProgram, 'kd');
	u_ks = gl.getUniformLocation(shaderProgram, 'ks');
	u_posL = gl.getUniformLocation(shaderProgram, 'posL');
	u_CoefEsp = gl.getUniformLocation(shaderProgram, 'CoefEsp');
	u_Idir = gl.getUniformLocation(shaderProgram, 'Idir');
	u_angle = gl.getUniformLocation(shaderProgram, 'angle');

	u_modelColor = gl.getUniformLocation(shaderProgram, 'modelColor');

	// Load all the models
	loadModels(posLocation, normalLocation);
	
	// Set the models' transformations
	setModelsTransformations();

	// Set some WebGL properties
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0.18, 0.18, 0.18, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create auxiliary models
	axis = new Axis();
	axis.load();
	
	// Create the camera using canvas dimension
	camera = new SphericalCamera(55, 800/600);
}

function onRender() {
	let modelMatrix = mat4.create(); 
	let viewMatrix = camera.getViewMatrix();
	let projMatrix = camera.getProjMatrix();
	let normalMatrix = mat3.create();
	let posL = vec4.create();

	let ka = vec3.fromValues(0.8,0.8,0.8);
	let ks = vec3.fromValues(0.8,0.0,0.0);
	let kd = vec3.fromValues(1.0,0.0,1.0);
	let Idir = vec3.fromValues(0.0,0.5,0.0);
	let CoefEsp = 5.0;
	let angle = 15.0;

	mat3.fromMat4(normalMatrix,viewMatrix);
	mat3.invert(normalMatrix,normalMatrix);
	mat3.transpose(normalMatrix,normalMatrix);

	vec4.transformMat4(posL,[0.0,1.0,1.0,1.0],viewMatrix);

	// Set some WebGL properties
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Draw auxiliary models
	axis.render(projMatrix, viewMatrix);

	// Set shader and uniforms
	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);
	gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);

	gl.uniform3fv(u_ka,ka);
	gl.uniform3fv(u_kd,kd);
	gl.uniform3fv(u_ks,ks);
	gl.uniform3fv(u_Idir,Idir);
	
	gl.uniform4fv(u_posL,posL);
	gl.uniform1f(u_CoefEsp,CoefEsp);
	gl.uniform1f(u_angle,angle);


	// Draw models
	_modelColor = vec3.fromValues(1.0, 0.0, 1.0);
	gl.uniform3fv(u_modelColor, _modelColor);
	setModelsTransformations();
	cono.draw(isSolid, gl, _gl);
	// cono2.draw(isSolid, gl, _gl);
	// cono3.draw(isSolid, gl, _gl);
	// cono4.draw(isSolid, gl, _gl);
	// cono5.draw(isSolid, gl, _gl);
	// cono6.draw(isSolid, gl, _gl);

	// Clean
	_gl.bindVertexArrayOES(null);
	gl.useProgram(null);
}
