import * as THREE from '../build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import * as pathfinding from "./pathfinding.js"
let camera, scene, renderer;
let plane;
let controls, gui, pointer, raycaster, keycode;
let cubeChoice = {"obstacle":true,"start":false,"end":false,"del":false};
let rollOverMesh, rollOverMaterial;
let cubeGeo;
let drawing = {"enabled":true};
const objects = [];

let utilites = {

	"drawing" : {"enabled":false},

	"clear": function(objects){
        objects.forEach(element => {
            scene.remove(element);
            render();
        });
    	}
}


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

	//orbital controls
	utilites["controls"] = new OrbitControls(camera, renderer.domElement);
	utilites.controls.zoomSpeed = 0.5;
	
	//utilities


	//gui
	gui = new GUI()
	const cubesFolder = gui.addFolder("Cubes");
	cubesFolder.add(cubeChoice, "obstacle").listen();
	cubesFolder.add(cubeChoice, "start").listen();
	cubesFolder.add(cubeChoice, "end").listen();
	cubesFolder.add(cubeChoice, "del").listen();
	const utilitesFolder = gui.addFolder("utilities")
	utilitesFolder.add(utilites.controls, "enabled").name("Enable movement").listen().onChange(() => {utilites.drawing.enabled = false; utilites.controls.enabled = true;});
	utilitesFolder.add(utilites.drawing, "enabled").name("Enable drawing").listen().onChange(() => {utilites.controls.enabled = false; utilites.drawing.enabled = true;});
	utilitesFolder.add(utilites, "clear");
	utilitesFolder.open()
	cubesFolder.open()
	gui.show()

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
	rollOverMaterial.visible = true;

	const intersects = checkIntersections(event,pointer,camera)

	if (intersects.length > 0) {

		const intersect = intersects[0];
		rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
		rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

	}

	render();

}
function onPointerUp(event) {
	if(utilites.drawing.enabled){
		const intersects = checkIntersections(event,pointer,camera);
		if (intersects.length > 0) {
			const intersect = intersects[0];
			switch (true) {	
				case cubeChoice.del:
					if (intersect.object !== plane) {
						scene.remove(intersect.object);
						objects.splice(objects.indexOf(intersect.object), 1);
					}
					break;
				case cubeChoice.obstacle: {
					createNewBlock(intersect,0xB03A2E)
				}
					break;
				case cubeChoice.start: {
					let i = objects.findIndex(element => element.name == "start");
					if(i == -1){
						CreateEndPoint(intersect,0x27AE60, "start");
					} else {
						objects[i].position.copy(intersect.point).add(intersect.face.normal);
						objects[i].position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
					}
				}
					break;		
				case cubeChoice.end: {
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
	render()
}
 
function onDocumentKeyDown(event) {
	keycode = event.keyCode
	switch (keycode){
		case 82:{
				utilites.controls.enabled = true;
				utilites.drawing.enabled = false;
			break;
		}
		case 84:{
			utilites.drawing.enabled = true;
			utilites.controls.enabled = false;
		}
		case 81:{
			for(let element in cubeChoice){
				cubeChoice[element] = false;
			}
			cubeChoice.obstacle = true;
			break;
		}
		case 87:{
			for(let element in cubeChoice){
				cubeChoice[element] = false;
			}
			cubeChoice.start = true;
			break;
		}
		case 69:{
			for(let element in cubeChoice){
				cubeChoice[element] = false;
			}
			cubeChoice.end = true;
			break;
		}
		case 16:{
			for(let element in cubeChoice){
				cubeChoice[element] = false;
			}
			cubeChoice.del = true;
			break;
		}
		case 89:{
			utilites.clear(objects);
		}
	}
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
	objects.push(voxel);
}

function checkIntersections(event,pointer,camera) {
	pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
	raycaster.setFromCamera(pointer, camera);
	return raycaster.intersectObjects(objects, false);
}
