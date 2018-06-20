class camaraCuaternion { 
	constructor() {
		//creamos el cuaternion cameraRot
		this.cameraRot = quat.create();
		this.cameraRot1 = quat.create();
		quat.rotateX(this.cameraRot1, this.cameraRot1, 0);
		this.cameraRot2 = quat.create();
		quat.rotateY(this.cameraRot2, this.cameraRot2, 0);
		quat.mul(this.cameraRot,this.cameraRot1,this.cameraRot2);

		//necesito manejar esfericas
		this.DEG2RAD=Math.PI/180.0;
		this.deltaTheta=0.1;
		this.deltaPhi=0.1;
		this.distance =0.1;
		this.radio=1.7;

		//maneja la cercania y todo eso con respecto a la matriz de proyeccion
		this.fovy=50*this.DEG2RAD;
		this.aspect=1;
		this.zNear=0.1;
		this.zFar=100;
		this.fieldOfView=50*this.DEG2RAD;
		
	}
	getPosition(){
		return vec3.create();
	}
	getProjMatrix(){
		var projMatrix=mat4.create();
		mat4.perspective(projMatrix,this.fieldOfView,this.aspect,this.zNear,this.zFar);
		return projMatrix;
	}

	getViewMatrix(){
		//Pasamos del esferico al cartesiano
		var viewMatrix=mat4.create();
		const cameraPos=vec3.fromValues(0.0,0.0,this.radio);
		var menosRadio=this.radio*-1;
		const matrixFromQuater=mat4.create();
		mat4.fromQuat(matrixFromQuater,this.cameraRot);
		const cameraPosTraslacion=vec3.fromValues(0,-1.0,menosRadio);
		const traslacion=mat4.create();
		mat4.fromTranslation(traslacion,cameraPosTraslacion);
		mat4.mul(viewMatrix,traslacion,matrixFromQuater);
		quat.normalize(this.cameraRot,this.cameraRot);
		return viewMatrix;
	}

	rotarAbajo(){
		const tmpQuat=quat.create();
      	quat.rotateX(tmpQuat, tmpQuat, this.deltaPhi);
      	quat.mul(this.cameraRot,this.cameraRot,tmpQuat);
	}

	rotarArriba(){
		const tmpQuat=quat.create();
      	quat.rotateX(tmpQuat, tmpQuat, -this.deltaPhi);
      	quat.mul(this.cameraRot,this.cameraRot,tmpQuat);
	}

	rotarIzquierda(){
		const tmpQuat=quat.create();
      	quat.rotateY(tmpQuat, tmpQuat, this.deltaTheta);
     	quat.mul(this.cameraRot,this.cameraRot,tmpQuat);
	}

	rotarDerecha(){
		const tmpQuat=quat.create();
     	quat.rotateY(tmpQuat, tmpQuat, -this.deltaTheta);
     	quat.mul(this.cameraRot,this.cameraRot,tmpQuat);
	}

	moverArriba(){
		if ((this.distance > 0) && (this.radio-this.distance > 0)){
       		this.radio = this.radio - this.distance;
      	};
	}

	moverAbajo(){
		if ((this.distance > 0) ){
        	this.radio = this.radio + this.distance;
      	};
	}
	setModelMatrix(matrix) {
		this.modelMatrix = matrix;
	}
};