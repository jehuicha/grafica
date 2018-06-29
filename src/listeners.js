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
      if ( canJump === true ) {
        velocity.y += 700; // Default 350
      }
      canJump = false;
      break;

    case 111: //letra O | o
    case 79: //left light
      botonL1 =true;
      break;

    case 112: //letra P | p
    case 80: //rigth light
      botonL2 = true;
      break;

    case 67: //letra C | c
    case 99: //Cambio de camara
      botonCam = true;
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