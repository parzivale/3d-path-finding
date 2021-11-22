import * as THREE from '../build/three.module.js';
import { utilities } from './utlities.js';
import * as pathfinding from "./pathfinding.js";

let camera, scene, renderer;
let plane;
let pointer, raycaster;
let rollOverMesh, rollOverMaterial;
let cubeGeo;
let utility;
const objects = [];


init();
render();

function init() {

	//camera/scene
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.set(500, 800, 1300);
	camera.lookAt(0, 0, 0);
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);
	

	// roll-over helpers
	const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
	rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
	rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
	scene.add(rollOverMesh);

	// cubes
	cubeGeo = new THREE.BoxGeometry(50, 50, 50);

	// grid
	let gridHelper = new THREE.GridHelper(100000, 100000 * 20/1000);
	scene.add(gridHelper);

	//raycast
	raycaster = new THREE.Raycaster();
	pointer = new THREE.Vector2();
	const geometry = new THREE.PlaneGeometry(100000,100000);
	geometry.rotateX(- Math.PI / 2);
	plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));	
	scene.add(plane);
	objects.push(plane);

	//light
	const ambientLight = new THREE.AmbientLight(0x606060);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 0.75, 0.5).normalize();
	scene.add(directionalLight);

	//renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	const div = document.getElementById("render-div");
	div.appendChild(renderer.domElement);

	//utilities, i.e orbital controls, selection state etc
	utility = new utilities(camera, renderer, scene, objects)
	//
	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('pointerup', onPointerUp);
	document.addEventListener('keydown', onDocumentKeyDown);
	//
	
	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {

	//moves the rollover mesh(3d cursor) to a new position on cursor move
	rollOverMaterial.visible = true;

	const intersects = checkIntersections(event,pointer,camera)

	if (intersects.length > 0) {

		const intersect = intersects[0];
		rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
		rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

	}
	//render is necesarry as there is no draw call loop
	render();
}

function onPointerUp(event) {
	//checks if the user can draw and if the raycast hit anything
		if(utility.drawing.enabled){
		const intersects = checkIntersections(event,pointer,camera);
		if (intersects.length > 0) {
			const intersect = intersects[0];

			//depending on whether UTILITES.CUBECHOICE.x is true create a different cube at that location
			switch (true) {	
				case utility.cubeChoice.del:
					if (intersect.object !== plane) {
						scene.remove(intersect.object);
						objects.splice(objects.indexOf(intersect.object), 1);
					}
					break;
				case utility.cubeChoice.obstacle: {
					createNewBlock(intersect,0xB03A2E)
				}
					break;
				case utility.cubeChoice.start: {
					let i = objects.findIndex(element => element.name == "start");
					if(i == -1){
						CreateEndPoint(intersect,0x27AE60, "start");
					} else {
						objects[i].position.copy(intersect.point).add(intersect.face.normal);
						objects[i].position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
					}
				}
					break;		
				case utility.cubeChoice.end: {
					let i = objects.findIndex(element => element.name == "end");
					if(i == -1){
						CreateEndPoint(intersect,0xE67E22, "end");
					} else {
						objects[i].position.copy(intersect.point).add(intersect.face.normal);
						objects[i].position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
					}
				}
					break;
			}
		}
	}
	//render is necesarry as there is no draw call loop
	render();
}
 
function onDocumentKeyDown(event) {
	//stores the last key that was pressed
	utility.keycode = event.keyCode;
	utility.checkKey();
}

function render() {
	renderer.render(scene, camera);
}

function createNewBlock(intersect,color) {
	let matt = new THREE.MeshBasicMaterial({color:color});
	let voxel = new THREE.Mesh(cubeGeo, matt);
	voxel.position.copy(intersect.point).add(intersect.face.normal);
	voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

	scene.add(voxel);
	objects.push(voxel);
}

//similar to create new point but creates a endpoint for path finding
function CreateEndPoint(intersect,color,name) {
	let matt = new THREE.MeshBasicMaterial({color:color});
	let voxel = new THREE.Mesh(cubeGeo, matt);
	voxel.position.copy(intersect.point).add(intersect.face.normal);
	voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

	voxel.name = name;
	scene.add(voxel);
	objects.push(voxel);
}

function checkIntersections(event,pointer,camera) {
	pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
	raycaster.setFromCamera(pointer, camera);
	return raycaster.intersectObjects(objects, false);
}
