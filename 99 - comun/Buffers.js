function createVBO(data) {
  	let vbo = gl.createBuffer(gl.ARRAY_BUFFER);
  	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  	return (vbo);
}

function createEBO(data) {
  	let ebo = gl.createBuffer(gl.ELEMENT_ARRAY_BUFFER);
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW); 
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  	return (ebo);
}

function createVAO(indices, positions, posLocation) {
	let vao = vaoExtension.createVertexArrayOES();
  	let ebo = createEBO(indices);
  	let vboPosition = createVBO(positions);

  	vaoExtension.bindVertexArrayOES(vao);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  	gl.bindBuffer(gl.ARRAY_BUFFER, vboPosition);
  	gl.enableVertexAttribArray(posLocation);
  	gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, false, 0, 0);
	vaoExtension.bindVertexArrayOES(null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return (vao);
}