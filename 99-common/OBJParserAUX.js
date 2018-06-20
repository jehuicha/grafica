/**
 * Helper class to parse OBJ files.
 * Based on: https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
 */
class OBJParserAUX {
	/**
	 * Parse an OBJ file
	 * @param  {string} fileContent Full content of OBJ file
	 * @return {object}             Plain object containing arrays of indices, positions, normals, textures.
	 */

	static startFromZero(arr) {
	    var newArr = [];
	    var count = 0;

	    for (var i in arr) {
	        newArr[count++] = arr[i];
	    }

	    return newArr;
}
	static parseFile(fileContent) {
		let lines = fileContent.split('\n');
		let srcPositions = []; //[[x,y,z], [x,y,z], ...]
		let srcNormals = [];    //[[x,y,z], [x,y,z], ...]
		let srcTextures = [];  //[[u,v], [u,v], ...]
		let dstPositions = []; //[x,y,z,x,y,z, ...]
		let dstNormals = [];
		let dstTextures = [];
		let dstIndices = [];
		let map = {}; // 1/2/3 => 4
		let nextIndex = [];
		let s=90;
		let indicesPartes=[];
		let partes=[];
		let i=0;

		for (i = 0; i < lines.length-1; i++) {
			let parts = lines[i].trim().split(' ');
			if (parts.length > 0) {
				document.getElementById("demo").innerHTML = parts[0];
				document.getElementById("demo1").innerHTML = parts[1];
				document.getElementById("demo2").innerHTML = parts[2];
				document.getElementById("demo3").innerHTML = parts[3];
				switch(parts[0]) {
					case 'o':
						indicesPartes.push(i);
						partes={
							indices: dstIndices,
							positions: dstPositions,
							normals: dstNormals,
							textures: dstTextures,
							idcPartes: indicesPartes
						};
						startFromZero(srcPositions); //[[x,y,z], [x,y,z], ...]
						startFromZero(srcNormals);    //[[x,y,z], [x,y,z], ...]
						startFromZero(srcTextures);  //[[u,v], [u,v], ...]
						startFromZero(dstPositions); //[x,y,z,x,y,z, ...]
						startFromZero(dstNormals);
						startFromZero(dstTextures);
						startFromZero(dstIndices);
						
						break;
					case 'v':
						srcPositions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
						break;
					case 'o':
						s=i;
						break;	
					case 'vn':
						srcNormals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
						break;
					case 'vt':
						srcTextures.push([parseFloat(parts[1]), parseFloat(parts[2])]);
						break;
					case 'f':
						for (let j = 0; j < 3; j++) {
							let f = parts[j + 1].split('/');
							if (f in map) {
								dstIndices.push(map[f]);
							} else {
								let position = srcPositions[parseInt(f[0]) - 1];
								dstPositions.push(position[0]);
								dstPositions.push(position[1]);
								dstPositions.push(position[2]);
								if (f[1]) { //If has textures
									let texture = srcTextures[parseInt(f[1]) - 1];
									dstTextures.push(texture[0]);
									dstTextures.push(texture[1]);
								}
								if (f[2]) { //If has normals
									let normal = srcNormals[parseInt(f[2]) - 1];
									dstNormals.push(normal[0]);
									dstNormals.push(normal[1]);
									dstNormals.push(normal[2]);
								}
								dstIndices.push(nextIndex);
								map[f] = nextIndex++;
							}
						}//for j
						break;
				}//switch
			}
			else s=i;
		}
		return partes;
	}
}