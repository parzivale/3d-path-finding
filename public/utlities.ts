import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

class utilities{

    initControls(camera, renderer, properties = [{"name":"zoomSpeed", "data":0.5}]){
        let controls = new OrbitControls(camera, renderer.domElement);
        for(let item in properties){
            controls[item["name"]] = item["data"];
        }
        controls.enabled = false;
        return controls;
    }

    //initialises all the relevant DAT.GUI folders and dsiplays them
    initGUI(){
        let gui = new GUI()
        const cubesFolder = gui.addFolder("Cubes");
        cubesFolder.add(this.cubeChoice, "obstacle").listen().onChange(() =>{this.updateSelection(this.cubeChoice,"obstacle")});
        cubesFolder.add(this.cubeChoice, "start").listen().onChange(() => (this.updateSelection(this.cubeChoice,"start")));
        cubesFolder.add(this.cubeChoice, "end").listen().onChange(() => {this.updateSelection(this.cubeChoice,"end")});
        cubesFolder.add(this.cubeChoice, "del").listen().onChange(() => {this.updateSelection(this.cubeChoice,"del")});
        const utilitesFolder = gui.addFolder("utilities")
        utilitesFolder.add(this.controls, "enabled").name("Enable movement").listen().onChange(() => {this.drawing.enabled = false; this.controls.enabled = true;});
        utilitesFolder.add(this.drawing, "enabled").name("Enable drawing").listen().onChange(() => {this.controls.enabled = false; this.drawing.enabled = true;});
        utilitesFolder.add(this, "clear");
        utilitesFolder.open();
        cubesFolder.open();
        gui.show();
        return gui
    }

    constructor(camera, renderer, scene, objects, properties = undefined){
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        this.objects = objects;
        this.drawing = {"enabled":true};
        this.cubeChoice = {"obstacle":true,"start":false,"end":false,"del":false};
        this.keycode = 82;        
        this.controls = this.initControls(camera,renderer,properties);
        this.gui = this.initGUI();
    }

    //clears all voxels from the screen
    clear(){
        for(let element in this.objects){
            
            this.scene.remove(this.objects[element]);
            this.render();
        }
        this.objects ;
        let plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));	
	    this.scene.add(plane);
	    this.objects.push(plane);
    }
    
    //changes the state of cubeChoice for DAT.GUI, key refers to object key and not keypress
    updateSelection(obj,key) {
        for(let element in obj){
            obj[element] = false;
        }
        
        obj[key] = true;
    }

    //updates all the state handlers based on the keypress
    checkKey(){
        switch (this.keycode){
	    	case 82:{
	    			this.controls.enabled = true;
	    			this.drawing.enabled = false;
	    		break;
	    	}
	    	case 84:{
	    		this.drawing.enabled = true;
	    		this.controls.enabled = false;
	    	}
	    	case 81:{
	    		for(let element in this.cubeChoice){
	    			this.cubeChoice[element] = false;
	    		}
	    		this.cubeChoice.obstacle = true;
	    		break;
	    	}
	    	case 87:{
	    		for(let element in this.cubeChoice){
	    			this.cubeChoice[element] = false;
	    		}
	    		this.cubeChoice.start = true;
	    		break;
	    	}
	    	case 69:{
	    		for(let element in this.cubeChoice){
	    			this.cubeChoice[element] = false;
	    		}
	    		this.cubeChoice.end = true;
	    		break;
	    	}
	    	case 16:{
	    		for(let element in this.cubeChoice){
	    			this.cubeChoice[element] = false;
	    		}
	    		this.cubeChoice.del = true;
	    		break;
	    	}
	    	case 89:{
	    		this.clear();
	    	}
	    }
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export {utilities};