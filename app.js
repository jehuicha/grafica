var gl;
var shaderProgram = null;
var canvas;
var centro = [0.0, 0.0, 0.0];
var lastFrameTime = 0.0;
var cant_ptos=1000;
var particulas = [];	//Aca guardo los datos de las particulas para su eventual actualizacion
var particleBuffer = null;
var particleArray = null;
var particleLifespan = 12.0;

function resetParticle(p) {
	//Devuelven una posicion en el rango [-1,1]
	let rndX, rndY, rndZ;
	rndX = Math.random() * 2 -1;
	rndY = Math.random() * 2 -1;
	rndZ = Math.random() * 2 -1;

	//Reduzco la distancia y posiciono al confetti alrededor de CENTRO
	p.pos= [rndX / 4 + centro[0], rndY / 4 + centro[1], rndZ / 4 + centro[2]]; 		//X

    //Hago que las particulas puedan ir en cualquier direccion
    p.vel = [
        (Math.random() * 10.0) - 5.0,
        (Math.random() * 10.0) - 5.0,
        (Math.random() * 10.0) - 5.0,
    ];

    p.lifespan = (Math.random() * particleLifespan);
    p.remainingLife = p.lifespan;
}

function configureParticles(count) {
    var i, p;

    particleArray = new Float32Array(count * 4);

    for(i = 0; i < count; ++i) {
        p = {};
        resetParticle(p);
        particulas.push(p);

        particleArray[(i*4) + 0] = p.pos[0];
        particleArray[(i*4) + 1] = p.pos[1];
        particleArray[(i*4) + 2] = p.pos[2];
        particleArray[(i*4) + 3] = p.remainingLife / p.lifespan;
    }

    particleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particleArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function updateParticles(elapsed) {
    var i, count = cant_ptos;

    // Loop through all the particles in the array
    for(i = 0; i < count; ++i) {
        p = particulas[i];

        // Track the particles lifespan
        p.remainingLife -= elapsed;
        if(p.remainingLife <= 0) {
            resetParticle(p); // Once the particle expires, reset it to the origin with a new velocity
        }

        // Update the particle position
        p.pos[0] += p.vel[0] * elapsed;
        p.pos[1] += p.vel[1] * elapsed;
        p.pos[2] += p.vel[2] * elapsed;
        
        // Apply gravity to the velocity
        p.vel[1] -= 9.8 * elapsed;

        // Update the corresponding values in the array
        particleArray[(i*4) + 0] = p.pos[0];
        particleArray[(i*4) + 1] = p.pos[1];
        particleArray[(i*4) + 2] = p.pos[2];
        particleArray[(i*4) + 3] = p.remainingLife / p.lifespan;
    }

    // Once we are done looping through all the particles, update the buffer once
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particleArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function render(){
	//Tomo el tiempo actual y en base a el y la velocidad del punto establezco la posicion nueva
    var time = Date.now();

    updateParticles((time - lastFrameTime) / 5000.0);

    lastFrameTime = time;

    // Render scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    try{
        gl.enable(gl.BLEND);
        gl.useProgram(shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
        gl.vertexAttribPointer(shaderProgram.a_Position, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.a_Position);


        gl.drawArrays(gl.POINTS, 0, cant_ptos);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    catch(err){
        alert(err);
        console.error(err.description);
    }
}

var InitDemo = function () {
	let i=0;
	let posLocation;
	canvas = document.getElementById('lienzo');

	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	//Preparo los buffers para pasar los atributos de cada punto
	vaoExtension = gl.getExtension('OES_vertex_array_object');

	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);
	gl.useProgram(shaderProgram);

//TAMAÑOS DE PUNTOS
	//Creo un buffer para albergar los tamaños
	let sizes = new Float32Array(cant_ptos);

	for(i = 0; i < cant_ptos; ++i) {
        sizes[i] = (Math.random() + 0.3) * 70;
    }

	var sizeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);


	//Aplico los tamaños de los puntos
	var a_PointSize = gl.getAttribLocation(shaderProgram, 'a_PointSize');
	gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_PointSize);

//TEXTURAS
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	//Wrapping and filtering
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //Cuando se estira la imagen texels<pixels
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); //Cuando se comprime la imagen pixels<texels

	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('moneda')
	);

	//gl.bindTexture(gl.TEXTURE_2D, null);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);
	gl.activeTexture(gl.TEXTURE0);

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(shaderProgram);

	//Manejo de matrices de posicion

	var matWorldUniformLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	var matViewUniformLocation 	= gl.getUniformLocation(shaderProgram, 'viewMatrix');
	var matProjUniformLocation 	= gl.getUniformLocation(shaderProgram, 'projMatrix');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);

	mat4.identity(worldMatrix);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	//Aplico propiedades generales de dibujo
	gl.clearColor(0.5, 0.35, 0.60, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);
	//Las siguientes 2 lineas permiten que las partes transparentes de la textura sigan siendo transparentes en las particulas
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable (gl.BLEND);

	configureParticles(cant_ptos);
	gl.drawArrays(gl.POINTS, 0, cant_ptos);

	var loop = function () {
		angle = performance.now() / 1000 * 12 / 6 / 5 * Math.PI;

		gl.clearColor(0.9, 0.9, 0.9, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.POINTS, 0, cant_ptos);
		render();

		requestAnimationFrame(loop);//Quiero llamar a function cada vez que renderice
		//No llamara esta funcion si se pierde el foco (cuando nadie mira). Bueno para ahorrar energia.
	};
	requestAnimationFrame(loop);
};