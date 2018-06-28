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

  /* CAMERA */
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(0, 50, 0);
  camera.updateProjectionMatrix();

  /* SCENE */
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x7EC0EE );

  /* CONTROLS */
  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  /* RAYCASTER */
  raycaster = new THREE.Raycaster( new THREE.Vector3(0,0,0), new THREE.Vector3(0, -1, 0), 0, 10);

  /* LIGHTS */
    /* AMBIENT LIGHT */
  var ambient_light = new THREE.AmbientLight( 0xffffff, 0.1 );
  // scene.add( ambient_light );

  /* DIRECTIONAL LIGHT*/
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.45 );
  directionalLight.position.set(0, 500, 50);
  scene.add( directionalLight );

    /* SPOT LIGHTS */
  spot_light1 = new THREE.SpotLight( 0xffffff, 2 );
  spot_light1.angle = 0.2;
  spot_light1.penumbra = 1;
  spot_light1.decay = 2;
  spot_light1.distance = 600;
  spot_light1.castShadow = true;
  spot_light1.shadow.mapSize.width = 1024;
  spot_light1.shadow.mapSize.height = 1024;
  spot_light1.shadow.camera.near = 100;
  spot_light1.shadow.camera.far = 1000;
  scene.add( spot_light1 );
  spot_light2 = new THREE.SpotLight();
  spot_light2.copy(spot_light1);
  scene.add( spot_light2 );

  /* FLOOR */
  var ground_geom = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
  ground_geom.rotateX( - Math.PI / 2 );
  var ground_mat = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );
  var ground = new THREE.Mesh( ground_geom, ground_mat );
  ground.position.set(0, 0, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  /* LOADERS */
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath('models/obj/');
  mtlLoader.setPath('models/obj/');
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath('models/obj/');

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

  /* SHADER MATERIAL*/
  var shader_mat = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
  });

  /* MOON */
  var img_tex = new THREE.TextureLoader().load( "textures/planets/moon.jpg" );
  img_tex.wrapS = img_tex.wrapT = THREE.RepeatWrapping;
  img_tex.anisotropy = 16;
  var shininess = 50, specular = 0x333333, bumpScale = 1;
  var alpha = Math.random();
  var specularShininess = Math.pow( 2, alpha * 10 );
  var beta = Math.random();
  var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );
  var gamma = Math.random();
  var diffuseColor = new THREE.Color("rgb(255, 255, 255)");
  var toon_mat = new THREE.MeshToonMaterial( {
    map: img_tex,
    bumpMap: img_tex,
    bumpScale: bumpScale,
    color: diffuseColor,
    specular: specularColor,
    reflectivity: beta,
    shininess: specularShininess,
    envMap: null
  } );
  var moon_geom = new THREE.SphereBufferGeometry( 25, 32, 32 );
  var moon = new THREE.Mesh( moon_geom, toon_mat );
  moon.position.copy(directionalLight.position);
  scene.add(moon);
  objects.push(moon);

  /* OBJECTS */
  let scale_factor1 = 300;
  let scale1 = new THREE.Vector3(scale_factor1, scale_factor1, scale_factor1);

  /* FLOOR */
  objLoader.load('floor.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = floor_mat;
            child.receiveShadow = true;
          }
      });
      object.scale.copy(scale1);
      object.rotateY(-Math.PI/2);
      object.position.set(0, 1, -80);
      scene.add(object);
      objects.push(object);
  });

  /* ROOF */
  objLoader.load('roof.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = curtain_mat;
            child.receiveShadow = true;
          }
      });
      object.scale.copy(scale1);
      object.rotateY(-Math.PI/2);
      object.position.set(0, scale_factor1, -80);
      scene.add(object);
      objects.push(object);
  });

  /* WALL */
  objLoader.load('wall.obj', function (object) {
      object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = curtain_mat;
            child.receiveShadow = true;
          }
      });
      object.scale.copy(scale1);
      object.rotateY(-Math.PI/2);
      object.position.set(0, 0, -80);
      object.side = THREE.DoubleSide;
      scene.add(object);
      objects.push(object);
  });

  /* ANIMATIONS */
  var gltfLoader = new THREE.GLTFLoader();
  let scale_factor2 = 7;
  let scale2 = new THREE.Vector3(scale_factor2, scale_factor2, scale_factor2);
  let king_dice1_pos = new THREE.Vector3(-100, 0, -(80 + scale_factor1 - 120));
  let king_dice2_pos = new THREE.Vector3(100, 0, -(80 + scale_factor1 - 120));

  /* KING DICE 1*/
  gltfLoader.load( 'models/gltf/King-Dice/king-dice-1.gltf', function ( gltf ) {
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
    object.scale.copy(scale2);
    object.rotateY(Math.PI / 2);
    object.position.copy(king_dice1_pos);
    scene.add(object);
    objects.push(object);
    spot_light1.position.copy(object.position);
    spot_light1.position.add(new THREE.Vector3(0, 0, 300));
    let target = new THREE.Object3D();
    target.position.copy(object.position);
    target.position.add(new THREE.Vector3(-40, 55, 0));
    spot_light1.target = target;
    scene.add(spot_light1.target);
  });

  /* KING DICE 2*/
  gltfLoader.load('models/gltf/King-Dice/king-dice-2.gltf',function (gltf) {
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
    object.scale.copy(scale2);
    object.rotateY(-Math.PI / 2);
    object.position.copy(king_dice2_pos);
    scene.add(object);
    objects.push(object);
    spot_light2.position.copy(object.position);
    spot_light2.position.add(new THREE.Vector3(0, 0, 300));
    let target = new THREE.Object3D();
    target.position.copy(object.position);
    target.position.add(new THREE.Vector3(0, 55, 0));
    spot_light2.target = target;
    scene.add(spot_light2.target);
  });

  /* FOG */
  // scene.fog = new THREE.Fog( 0xffffff, 0, 1100);

  /* RENDERER */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setClearColor( scene.fog.color );
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

    prevTime = time;
  }

  effect.render( scene, camera );
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
  gui.add( params, 'distance', 400, 1000 ).onChange( function ( val ) {
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
  gui.add( params, 'decay', 0, 2 ).onChange( function ( val ) {
    spot_light1.decay = val;
    spot_light2.decay = val;
  } );
  gui.open();
}