import * as THREE from '../build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { Material } from 'three';
let camera, scene, renderer;
let plane;
let controls, pointer, raycaster, keycode = 81;
let rollOverMesh, rollOverMaterial;
let cubeGeo;;
const objects = [];
const points = []

init();
render();

function init() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
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
	const gridHelper = new THREE.GridHelper(1000, 20);
	scene.add(gridHelper);
	//raycast
	raycaster = new THREE.Raycaster();
	pointer = new THREE.Vector2();
	const geometry = new THREE.PlaneGeometry(1000, 1000);
	geometry.rotateX(- Math.PI / 2);
	plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));	
	scene.add(plane);
	objects.push(plane);
	//
	const ambientLight = new THREE.AmbientLight(0x606060);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 0.75, 0.5).normalize();
	scene.add(directionalLight);
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	const canvasDiv = document.getElementById("canvas-div");
	canvasDiv.appendChild(renderer.domElement);
	controls = new OrbitControls(camera, renderer.domElement)
	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('pointerdown', onPointerDown);
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
	const intersects = checkIntersections(event,pointer,camera)

	if (intersects.length > 0) {
		const intersect = intersects[0];
		controls.enableRotate = false;
		rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
		rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
	}
	else if(intersects.length == 0){
		controls.enableRotate = true;
	}
	render();
}
function onPointerDown(event) {
	const intersects = checkIntersections(event,pointer,camera);
	if (intersects.length > 0) {
		const intersect = intersects[0];
		switch (keycode) {
			case 16:
				if (intersect.object !== plane) {
					scene.remove(intersect.object);
					objects.splice(objects.indexOf(intersect.object), 1);
				}
				break;
			case 81: {
				createNewBlock(intersect,0xB03A2E)
			}
				break;
			case 87: {
				let i = points.findIndex(element => element.name == "start");
				console.log(i);
				if(i == -1){
					CreateEndPoint(intersect,0x27AE60, "start");
				} else {
					points[i].position.copy(intersect.point).add(intersect.face.normal);
					points[i].position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
				}
			}
				break;
			case 69: {
				let i = points.findIndex(element => element.name == "end");
				console.log(i);
				if(i == -1){
					CreateEndPoint(intersect,0xE67E22, "end");
				} else {
					points[i].position.copy(intersect.point).add(intersect.face.normal);
					points[i].position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
				}
			}
				break;
			default: {
				createNewBlock(intersect,0xB03A2E)
			}
				break;
		}
	}
	render()
}



function onDocumentKeyDown(event) {
	console.log(event.keyCode)
	keycode = event.keyCode
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

function CreateEndPoint(intersect,color,name) {
	let matt = new THREE.MeshBasicMaterial({color:color});
	let voxel = new THREE.Mesh(cubeGeo, matt);
	voxel.position.copy(intersect.point).add(intersect.face.normal);
	voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
	voxel.name = name;
	scene.add(voxel);
	points.push(voxel);
}

function checkIntersections(event,pointer,camera) {
	pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
	raycaster.setFromCamera(pointer, camera);
	return raycaster.intersectObjects(objects, false);
}
