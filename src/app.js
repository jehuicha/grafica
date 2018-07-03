if ( ! Detector.webgl ) {
  Detector.addGetWebGLMessage();
}

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );
  var element = document.body;

  var pointerlockchange = function ( event ) {
    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
      controlsEnabled = true;
      controls.enabled = true;
      blocker.style.display = 'none';
    } else {
      controls.enabled = false;
      blocker.style.display = 'block';
      instructions.style.display = '';
    }
  };

  var pointerlockerror = function ( event ) {
    instructions.style.display = '';
  };
//
  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {
    instructions.style.display = 'none';
    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();
  }, false );
} else {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

var camera, scene, renderer, controls, effect;
var raycaster;
var spot_light1, spot_light2;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var stateL1 = true;
var stateL2 = true;
var botonL1 = false;
var botonL2 = false;
var angleL = 0.2;
var stateCam = 0;
var botonCam = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var gui;
var objects = [];
var mixers = [];
var particles = [];
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vzero = new THREE.Vector3();

init();
buildGui();
animate();

function init() {
  /* LISTENERS */
  document.addEventListener('keydown', onKeyDownMovement, false );
  document.addEventListener('keydown', onKeyDownCameraAndLight, false );
  document.addEventListener('keyup', onKeyUpMovement, false );
  window.addEventListener( 'resize', onWindowResize, false );

  /* CAMERA */
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(0, 150, 0);
  camera.updateProjectionMatrix();

  /* AUDIO */
  var audio_listener = new THREE.AudioListener();
  camera.add( audio_listener );

  // create a global audio source
  var audio_source = new THREE.Audio( audio_listener );

  // load a audio_source and set it as the Audio object's buffer
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'sounds/God-of-War-II-OST-The-Glory-of-Sparta.ogg', function( buffer ) {
  	audio_source.setBuffer( buffer );
  	audio_source.setLoop( true );
  	audio_source.setVolume( 1 );
  	audio_source.setLoop(true);

  	audio_source.play();
  });

  /* SCENE */
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000000 );

  /* CONTROLS */
  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  /* RAYCASTER */
  raycaster = new THREE.Raycaster( new THREE.Vector3(0,0,0), new THREE.Vector3(0, -1, 0), 0, 10);

  /* LIGHTS */
    /* AMBIENT LIGHT */
  var ambient_light = new THREE.AmbientLight( 0xffffff, 0.07 );
  scene.add( ambient_light );

  /* DIRECTIONAL LIGHT*/
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set(0, 500, 50);
  // scene.add( directionalLight );

    /* SPOT LIGHTS */
  spot_light1 = new THREE.SpotLight( 0xffffff, 2 );
  spot_light1.angle = 0.2;
  spot_light1.penumbra = 1;
  spot_light1.decay = 2;
  spot_light1.distance = 3000;
  spot_light1.castShadow = true;
  spot_light1.shadow.mapSize.width = 1024;
  spot_light1.shadow.mapSize.height = 1024;
  spot_light1.shadow.camera.near = 100;
  spot_light1.shadow.camera.far = 1000;
  scene.add( spot_light1 );
  spot_light2 = new THREE.SpotLight();
  spot_light2.copy(spot_light1);
  spot_light2.angle = spot_light1.angle * 2;
  scene.add( spot_light2 );

  /* GROUND */
  var ground_geom = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
  ground_geom.rotateX( - Math.PI / 2 );
  var ground_mat = new THREE.MeshPhongMaterial( { color: 0x0a0f44, dithering: true } );
  var ground = new THREE.Mesh( ground_geom, ground_mat );
  ground.position.set(0, 0, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  /* LOADERS */
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath('models/obj/');
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('models/obj/');
  var objLoader2 = new THREE.OBJLoader();
  objLoader2.setPath('models/obj/');
  var objLoader3 = new THREE.OBJLoader();
  objLoader3.setPath('models/obj/');

  /* MATERIALS */
  var iron_man_mat = new THREE.MeshToonMaterial( {
    color: 0xfff000,
    specular: 0xffffff,
    shininess: 30,
    side: THREE.DoubleSide,
    dithering: true
  } );
  var floor_mat = new THREE.MeshPhongMaterial( {
    color: 0xDEB887,
    specular: 0xffffff,
    shininess: 30,
    side: THREE.DoubleSide,
    dithering: true
  } );
  var curtain_mat = new THREE.MeshPhongMaterial( {
    color: 0x8B0000,
    specular: 0xffffff,
    shininess: 50,
    side: THREE.DoubleSide,
    dithering: true
  } );

  /* OBJECTS */
  let scale_factor1 = 300, scale_factor_roof = 100;
  let scale1 = new THREE.Vector3(scale_factor1, scale_factor1, scale_factor1);

  /* CURTAINS */
   objLoader.load('curtains.obj', function (object) {
       object.traverse(function (child) {
           if (child instanceof THREE.Mesh) {
             child.material = curtain_mat;
             child.receiveShadow = true;
           }
       });
       object.scale.set(148, 330, 320);
       object.position.set(95, -15, -70);
       object.side = THREE.DoubleSide;
       scene.add(object);
       objects.push(object);
       let curtain2 = object.clone();
       curtain2.position.set(-415, -15, -70);
       scene.add(curtain2);
       objects.push(curtain2);
     });

   /* FLOOR */
   var floor_pos = new THREE.Vector3(0,0,-325);
   var floor_tex = new THREE.TextureLoader().load( "textures/elements/wood.jpg" );
   floor_tex.wrapS = floor_tex.wrapT = THREE.RepeatWrapping;
   floor_tex.anisotropy = 16;
   var shininess = 50, specular = 0x333333, bumpScale = 1;
   var alpha = Math.random();
   var specularShininess = Math.pow( 2, alpha * 10 );
   var beta = Math.random();
   var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );
   var gamma = Math.random();
   var diffuseColor = new THREE.Color("rgb(255, 255, 255)");
   var flor_mat = new THREE.MeshToonMaterial( {
     map: floor_tex,
     bumpMap: floor_tex,
     bumpScale: bumpScale,
     color: diffuseColor,
     specular: specularColor,
     reflectivity: beta,
     shininess: specularShininess,
     envMap: null
   } );
   var floor_geom = new THREE.BoxBufferGeometry( 600, 45, 500 );
   var floor = new THREE.Mesh( floor_geom, flor_mat );
   floor.position.copy(floor_pos);
   floor.receiveShadow = true;
   scene.add(floor);
   objects.push(floor);

   /* CHAIRS */
  objLoader.load('chair.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = curtain_mat;
            child.receiveShadow = true;
          }
      });
      object.scale.set(8, 8, 8);
      object.side = THREE.DoubleSide;
      object.position.set(-285, 20, 0);
      scene.add(object);
      objects.push(object);
      for ( var i = 0; i < 20; i ++ ) {
        for(var j=0; j<3; j++){
          let clone = object.clone();
          clone.position.set(-285+i*30, 20, 60*j);
          scene.add(clone);
          objects.push(clone);
        }
      }
  });

  /* PANTEON */
  mtlLoader.load('panteon.mtl', function (materials) {
        materials.preload();
        objLoader2.setMaterials(materials);
        objLoader2.load('panteon.obj', function (object) {
          object.traverse(function (child) {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
          });
          object.side = THREE.DoubleSide;
          object.position.set(-20, 8, -400);
          object.scale.set(30, 30, 30);
          scene.add(object);
          objects.push(object);
        });
    });

  /* STAGE */
  objLoader.load('box.obj', function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material = curtain_mat;
              child.receiveShadow = true;
            }
        });

        object.position.set(0, -45, -310)
        object.scale.set(235,170,300);
        object.rotateY(-Math.PI/2);
        object.side = THREE.DoubleSide;
        scene.add(object);
        objects.push(object);
    });

  /* REFLECTORES */
  mtlLoader.load('reflector.mtl', function (materials) {
        materials.preload();
        objLoader3.setMaterials(materials);
        objLoader3.load('reflector.obj', function (object) {
          object.scale.set(10, 10, 10);
          object.side = THREE.DoubleSide;
          object.position.set(-200, 300, -120);
          object.rotateY(Math.PI/180*30)
          scene.add(object);
          objects.push(object);
          let reflector2 = object.clone();
          reflector2.position.set(200, 300, -120);
          reflector2.rotateY(Math.PI-0.5);
          scene.add(reflector2);
          objects.push(reflector2);
        });
    });

  /* ANIMATIONS */
  var gltfLoader = new THREE.GLTFLoader();
  let scale_factor2 = 7;
  let scale_factor3 = scale_factor2 * 2;
  let scale2 = new THREE.Vector3(scale_factor2, scale_factor2, scale_factor2);
  let scale3 = new THREE.Vector3(scale_factor3, scale_factor3, scale_factor3);
  let kratos_pos = new THREE.Vector3(-160, 22, floor_pos.z + 120);
  let robot_pos = new THREE.Vector3(160, 23, floor_pos.z + 120);

  /* KRATOS */
  gltfLoader.load( 'models/gltf/Kratos/Kratos.gltf', function ( gltf ) {
    let object = gltf.scene;
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    let animations = gltf.animations;
    if ( animations && animations.length ) {
      mixer = new THREE.AnimationMixer( object );
      mixers.push(mixer)
      for ( var i = 0; i < animations.length; i ++ ) {
        var animation = animations[ i ];
        var action = mixer.clipAction( animation );
        action.play();
      }
    }
    object.scale.set(10, 10, 10);
    object.rotateY(Math.PI/2);
    object.position.copy(kratos_pos);
    scene.add(object);
    objects.push(object);
    spot_light1.position.copy(object.position);
    spot_light1.position.add(new THREE.Vector3(0, 300, 300));
    let target = new THREE.Object3D();
    target.position.copy(object.position);
    target.position.add(new THREE.Vector3(0, 55, 0));
    spot_light1.target = target;
    scene.add(spot_light1.target);
  });

  /* ROBOT */
  mtlLoader.load('robot.mtl', function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load('robot.obj', function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
        });
        object.scale.copy(scale3);
        object.rotateY(-Math.PI / 2);
        object.position.copy(robot_pos);
        scene.add(object);
        objects.push(object);
        spot_light2.position.copy(object.position);
        spot_light2.position.add(new THREE.Vector3(0, 300, 300));
        let target = new THREE.Object3D();
        target.position.copy(object.position);
        target.position.add(new THREE.Vector3(0, 55, 0));
        spot_light2.target = target;
        scene.add(spot_light2.target);
      });
  });

  /* PARTICLES */
  var spark_tex = new THREE.TextureLoader().load( "textures/sprites/bulb.png" );
  spark_tex.wrapS = spark_tex.wrapT = THREE.RepeatWrapping;
  spark_tex.anisotropy = 16;
  var material = new THREE.SpriteMaterial( {
    map: spark_tex,
    blending: THREE.AdditiveBlending
  } );
  for ( var i = 0; i < 200; i++ ) {
    particle = new THREE.Sprite( material );
    initParticle( particle, -10, 0.0);
    scene.add( particle );
    objects.push(particle);
  }

  /* RENDERER */
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  effect = new THREE.OutlineEffect( renderer );
}

function animate() {
  requestAnimationFrame( animate );

  if ( controlsEnabled === true ) {
    // console.log(controls.getObject().position);
    raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects( objects );
    var onObject = intersections.length > 0;
    var time = performance.now();
    var delta = ( time - prevTime ) / 333;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveLeft ) - Number( moveRight );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) {
      velocity.z -= direction.z * 400.0 * delta;
    }
    if ( moveLeft || moveRight ) {
      velocity.x -= direction.x * 400.0 * delta;
    }

    if ( onObject === true ) {
      velocity.y = Math.max( 0, velocity.y );
      canJump = true;
    }

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if ( controls.getObject().position.y < 10 ) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }

    if ( mixers.length > 0 ) {
      for ( var i = 0; i < mixers.length; i ++ ) {
        mixers[ i ].update( ( time - prevTime ) * 0.001  );
      }
    }

    if( botonL1 ){
      if (stateL1 ){
        spot_light1.angle = 0.0;
        stateL1 = false;
      }
      else{
        spot_light1.angle = angleL;
        stateL1 = true;
      }
    botonL1 = false;
    }

    if( botonL2 ){
      if (stateL2 ){
        spot_light2.angle = 0.0;
        stateL2 = false;
      }
      else{
        spot_light2.angle = angleL;
        stateL2 = true;
      }
    botonL2 = false;
    }

    if ( botonCam ){
      stateCam = (stateCam +1)%3;
      switch (stateCam){
        case 0:
          camera.position.set(0, 150, 0);
          document.addEventListener('keydown', onKeyDownMovement, false );
          document.addEventListener('keyup', onKeyUpMovement, false );
          break;
        case 1:
          camera.position.set(200, 150, 0);
          document.removeEventListener('keydown', onKeyDownMovement, false );
          document.removeEventListener('keyup', onKeyUpMovement, false );
          break;
        case 2:
          camera.position.set(-200, 150, 0);
          document.removeEventListener('keydown', onKeyDownMovement, false );
          document.removeEventListener('keyup', onKeyUpMovement, false );
          break;
      }
      camera.updateProjectionMatrix();
      controls = new THREE.PointerLockControls(camera);
      controls.enabled = true;
      scene.remove(controls.getObject());
      scene.add(controls.getObject());
      botonCam = false;
    }

    TWEEN.update();

    prevTime = time;
  }

  effect.render( scene, camera );
}

function initParticle( particle, delay) {
  var particle = this instanceof THREE.Sprite ? this : particle;
  var delay = delay !== undefined ? delay : 0;
  // var x= 95, y = 160, z= -238;
  var x=145,y=160,z=-225;
  particle.position.set(x, y, z);
  particle.scale.x = particle.scale.y = Math.random() * 20;

  new TWEEN.Tween( particle )
    .delay( delay )
    .to( {}, 3000 )
    .onComplete( initParticle )
    .start();

  new TWEEN.Tween( particle.position )
    .delay( delay )
					.to( { x: x - Math.random() * 140, y: y - Math.random() * 140, z: z+ Math.random() * 140 }, 3000 )
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();

  new TWEEN.Tween( particle.scale )
    .delay( delay )
    .to( { x: 0.01, y: 0.01 }, 3000 )
    .start();
}

function buildGui() {
  gui = new dat.GUI();
  var params = {
    'light color': spot_light1.color.getHex(),
    intensity: spot_light1.intensity,
    distance: spot_light1.distance,
    angle: spot_light1.angle,
    penumbra: spot_light1.penumbra,
    decay: spot_light1.decay
  }
  gui.addColor( params, 'light color' ).onChange( function ( val ) {
    spot_light1.color.setHex( val );
    spot_light2.color.setHex( val );
  } );
  gui.add( params, 'intensity', 0, 2 ).onChange( function ( val ) {
    spot_light1.intensity = val;
    spot_light2.intensity = val;
  } );
  gui.add( params, 'distance', 400, 2000 ).onChange( function ( val ) {
    spot_light1.distance = val;
    spot_light2.distance = val;
  } );
  gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
    if(stateL1 === true){
      spot_light1.angle = val;
    }
    if(stateL2 === true){
      spot_light2.angle = 2 * val;
    }
    angleL=val;
  } );
  gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {
    spot_light1.penumbra = val;
    spot_light2.penumbra = val;
  } );
  gui.add( params, 'decay', 0, 2 ).onChange( function ( val ) {
    spot_light1.decay = val;
    spot_light2.decay = val;
  } );
  gui.open();
}