if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

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

var camera, scene, renderer, controls;
var raycaster;
var spot_light1, spot_light2;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var gui;
var objects = [];
var mixers = [];

init();
buildGui();
animate();

function init() {
  /* LISTENERS */
  document.addEventListener('keydown', onKeyDown, false );
  document.addEventListener('keyup', onKeyUp, false );
  window.addEventListener( 'resize', onWindowResize, false );

  /* RENDERER */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  /* CAMERA */
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(0, 30, 0);
  camera.updateProjectionMatrix();

  /* SCENE */
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x7EC0EE );

  /* CONTROLS */
  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  /* FOG */
  scene.fog = new THREE.Fog( 0xffffff, 0, 750);

  /* RAYCASTER */
  raycaster = new THREE.Raycaster( new THREE.Vector3(0,0,0), new THREE.Vector3(0, -1, 0), 0, 10);

  /* LIGHTS */
    /* AMBIENT LIGHT */
  var ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
  scene.add( ambient );

    /* SPOT LIGHTS */
  spot_light1 = new THREE.SpotLight( 0xffffff, 2 );
  spot_light1.position.set(-50, 20, -40);
  scene.add(spot_light1.target);
  spot_light1.angle = .29;
  spot_light1.penumbra = 0;
  spot_light1.decay = 2;
  spot_light1.distance = 200;
  spot_light1.castShadow = true;
  spot_light1.shadow.mapSize.width = 1024;
  spot_light1.shadow.mapSize.height = 1024;
  spot_light1.shadow.camera.near = 10;
  spot_light1.shadow.camera.far = 200;
  scene.add( spot_light1 );
  spot_light2 = new THREE.SpotLight();
  spot_light2.copy(spot_light1);
  spot_light2.position.set(50, 20, -40);
  scene.add( spot_light2 );

  /* FLOOR */
  var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
  floorGeometry.rotateX( - Math.PI / 2 );
  var floorMaterial = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );
  var floor = new THREE.Mesh( floorGeometry, floorMaterial );
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);


  /* LOADERS */
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath('examples/models/obj/');
  mtlLoader.setPath('examples/models/obj/');
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('examples/models/obj/');
  var fbxLoader = new THREE.FBXLoader();

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
    shininess: 30,
    side: THREE.DoubleSide,
    dithering: true
  } );

  /* OBJECTS */
  // var gltfLoader = new THREE.GLTFLoader();
  // gltfLoader.load( 'examples/models/gltf/Monster/glTF/Monster.gltf', function ( gltf ) {
  //   let object = gltf.scene;
  //   object.traverse( function ( child ) {
  //     if ( child.isMesh ) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   } );
  //   // object.scale.set(1, 1, 1);
  //   scene.add(object);
  //   objects.push(object);
  // } );
  // var animations = gltf.animations;
  // if ( animations && animations.length ) {
  //   mixer = new THREE.AnimationMixer( object );
  //   mixers.push(mixer)
  //   for ( var i = 0; i < animations.length; i ++ ) {
  //     var animation = animations[ i ];
  //     // There's .3333 seconds junk at the tail of the Monster animation that
  //     // keeps it from looping cleanly. Clip it at 3 seconds
  //     if ( sceneInfo.animationTime ) {
  //       animation.duration = sceneInfo.animationTime;
  //     }
  //     var action = mixer.clipAction( animation );
  //     if ( state.playAnimation ) action.play();
  //   }
  // }
  mtlLoader.load('r2-d2.mtl', function (materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load('r2-d2.obj', function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              // child.receiveShadow = true;
            }
        });
        object.position.set(-50, 0, -120)
        object.scale.set(.2, .2, .2)
        object.rotateY(Math.PI / 2)
        scene.add(object);
        target = new THREE.Object3D();
        target.position.copy(object.position);
        target.position.add(new THREE.Vector3(0, 20, 0));
        spot_light1.target = target;
        scene.add(spot_light1.target);
        objects.push(object);
      });
  });

  objLoader.load('iron-man.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material = iron_man_mat;
            // child.receiveShadow = true;
          }
      });

      object.position.set(50, 0, -120)
      object.scale.set(20, 20, 20)
      object.rotateY(-Math.PI / 2)
      scene.add(object);
      target = new THREE.Object3D();
      target.position.copy(object.position);
      target.position.add(new THREE.Vector3(0, 20, 0));
      spot_light2.target = target;
      scene.add(spot_light2.target);
      objects.push(object);
  });

  let scale_factor = 150;
  let scale = new THREE.Vector3(scale_factor, scale_factor, scale_factor);
  objLoader.load('piso.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material = floor_mat;
            child.receiveShadow = true;
          }
      });

      object.position.set(0, .001, -80)
      object.scale.copy(scale);
      object.rotateY(-Math.PI/2);
      scene.add(object);
      objects.push(object);
  });
  objLoader.load('techo.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material = curtain_mat;
            child.receiveShadow = true;
          }
      });

      object.position.set(0, scale_factor, -80)
      object.scale.copy(scale);
      object.rotateY(-Math.PI/2);
      scene.add(object);
      objects.push(object);
  });
  objLoader.load('pared.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.material = curtain_mat;
            child.receiveShadow = true;
          }
      });

      object.position.set(0, 0, -80)
      object.scale.copy(scale);
      object.rotateY(-Math.PI/2);
      object.side = THREE.DoubleSide;
      scene.add(object);
      objects.push(object);
  });

  /* ANIMATIONS */
  fbxLoader.load('examples/models/fbx/King-Dice-animation-1.fbx', function ( object ) {
    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );
    let action = object.mixer.clipAction( object.animations[ 0 ] );
    action.play();
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    let scale_factor = .025;
    object.scale.set(scale_factor, scale_factor, scale_factor);
    object.rotateY(Math.PI / 2);
    object.position.set(-10, 0, -120);
    scene.add( object );
    objects.push(object);
  } );
  fbxLoader.load('examples/models/fbx/King-Dice-animation-2.fbx', function ( object ) {
    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );
    let action = object.mixer.clipAction( object.animations[ 0 ] );
    action.play();
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    let scale_factor = 0.025;
    object.scale.set(scale_factor, scale_factor, scale_factor);
    object.rotateY(-Math.PI / 2);
    object.position.set(10, 0, -120);
    scene.add( object );
    objects.push(object);
  } );
  fbxLoader.load('examples/models/fbx/samba-dancing.fbx', function ( object ) {
    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );
    let action = object.mixer.clipAction( object.animations[ 0 ] );
    action.play();
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    let scale_factor = 0.25;
    object.scale.set(scale_factor, scale_factor, scale_factor);
    object.rotateY(-Math.PI / 2);
    object.position.set(0, 0, -150);
    scene.add( object );
    objects.push(object);
  } );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onKeyDown( event ) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      moveForward = true;
      break;

    case 37: // left
    case 65: // a
      moveLeft = true;
      break;

    case 40: // down
    case 83: // s
      moveBackward = true;
      break;

    case 39: // right
    case 68: // d
      moveRight = true;
      break;

    case 32: // space
      if ( canJump === true ) velocity.y += 350;
      canJump = false;
      break;
  }
};

function onKeyUp(event) {
  switch( event.keyCode ) {
    case 38: // up
    case 87: // w
      moveForward = false;
      break;

    case 37: // left
    case 65: // a
      moveLeft = false;
      break;

    case 40: // down
    case 83: // s
      moveBackward = false;
      break;

    case 39: // right
    case 68: // d
      moveRight = false;
      break;
  }
};

function animate() {
  requestAnimationFrame( animate );
  if ( controlsEnabled === true ) {
    raycaster.ray.origin.copy( controls.getObject().position );
    // raycaster.ray.origin.y -= 10;

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

    prevTime = time;
  }

  renderer.render( scene, camera );
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
  gui.add( params, 'distance', 50, 200 ).onChange( function ( val ) {
    spot_light1.distance = val;
    spot_light2.distance = val;
  } );
  gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
    spot_light1.angle = val;
    spot_light2.angle = val;
  } );

  gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {
    spot_light1.penumbra = val;
    spot_light2.penumbra = val;
  } );
  gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {
    spot_light1.decay = val;
    spot_light2.decay = val;
  } );
  gui.open();
}