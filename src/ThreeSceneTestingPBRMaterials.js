import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

class CustomAnimator extends EventTarget {
    targetObject = null;
    pos = new THREE.Vector3(0.0);
    angle = 0.0;
    deltaAngle = 0.01;
    distance = 5.0;
    constructor() {
        super();
    };
    update( ) {
        this.angle += this.deltaAngle;
        this.pos.x = Math.sin(this.angle) * this.distance;
        this.pos.y = 5;
        this.pos.z = Math.cos(this.angle) * this.distance;

        if (this.targetObject !== null) {
            this.targetObject.position.x = this.pos.x;
            this.targetObject.position.y = this.pos.y;
            this.targetObject.position.z = this.pos.z;
        }
    }
    setTargetObject(obj) {
        this.targetObject = obj;
    }
}


class ThreeSceneTestingPBRMaterials extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating " + this.constructor.name + " instance (inheriting from React.Component.)");
        this.loadManager = new THREE.LoadingManager();
        this.loadManager.onLoad = this.handleAllResourcesLoaded.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.plane_material = null;
        this.lightAnimator = new CustomAnimator();
        this.pointLight = null;
    }    
    loadTextures() {
        console.log("Loading textures...");
        this.textureLoader = new THREE.TextureLoader(this.loadManager);

        // Parchment 
        this.diffuseMap = this.textureLoader.load('/assets/maps/parchment/albedo.png');
        this.normalMap = this.textureLoader.load('/assets/maps/parchment/normal.png');

        /*
        // Oil painting 
        this.diffuseMap = this.textureLoader.load('/assets/maps/oil_painting/albedo.png');
        this.normalMap = this.textureLoader.load('/assets/maps/oil_painting/normal.png');
        */
    }
    handleAllResourcesLoaded() {
        console.log('All resources loaded succesfully!');
        this.setupScene();
    }
    setupScene() {
        console.log('Scene setup...');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222222);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.scene.add(new THREE.AxesHelper(1));
        //this.scene.add(new THREE.GridHelper());

        // Create point light
        this.pointLight = new THREE.PointLight( 0xffffff, 1, 0 );
        this.pointLight.position.set( 0, 0, 0 );
        this.scene.add( this.pointLight );  
        const sphereSize = 0.1;
        this.pointLightHelper = new THREE.PointLightHelper( this.pointLight, sphereSize );
        this.scene.add( this.pointLightHelper );

        this.lightAnimator.setTargetObject(this.pointLight);

        // Create ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.28);
        this.scene.add(ambientLight);

        // Create a plane with a PBR material
        const planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);


        /*
        this.plane_material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.diffuseMap,
            normalMap: this.normalMap,
            roughness: 0.5,
            metalness: 0.5
        });
        */
  
        this.plane_material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.diffuseMap,
            normalMap: this.normalMap,
            roughness: 0.78,
            metalness: 0.16,
            normalScale: new THREE.Vector2(5, 5)
        });

        const plane = new THREE.Mesh(planeGeometry, this.plane_material);
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        // Create a GUI to control the material properties

        this.materialParameters = {
            color: this.plane_material.color.getHex(),
            roughness: this.plane_material.roughness,
            metalness: this.plane_material.metalness,
            wireframe: this.plane_material.wireframe,
            normalScale: this.plane_material.normalScale.x
        };

        this.gui = new dat.GUI();
        const materialFolder = this.gui.addFolder('THREE.PBRMaterial')
        materialFolder.addColor(this.plane_material, 'color');

        materialFolder.add(this.materialParameters, 'roughness', 0, 1).onChange((value) => {
            this.plane_material.roughness = value;
        });
        materialFolder.add(this.materialParameters, 'metalness', 0, 1).onChange((value) => {
            this.plane_material.metalness = value;
        });
        materialFolder.add(this.plane_material, 'wireframe');

        materialFolder.add(this.materialParameters, 'normalScale', -10, 10).onChange((value) => {
            this.plane_material.normalScale.set(value, value);
        });
 

        /*
        const torusKnotGeometry = new THREE.TorusKnotGeometry(1,0.4,64,16,2,3)
        const torusKnot = new THREE.Mesh(torusKnotGeometry, this.plane_material)
        torusKnot.position.x = -5
        this.scene.add(torusKnot)
        */

        this.mount.appendChild(this.renderer.domElement);
        this.animate();
    }
    updateDimensions() {
        if (this.mount !== null) {
            this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
            this.camera.aspect = this.mount.clientWidth / this.mount.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.render(this.scene, this.camera);
        }
    }
    animate() {
        this.frameId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();

        this.lightAnimator.update();

        this.renderer.render(this.scene, this.camera);
    }

    // ------------------------------------------------------------------------------
    // Inherited from React.Component
    // ------------------------------------------------------------------------------
    componentDidMount() {
        console.log("componentDidMount");
        this.loadTextures();
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.frameId);
        // Check if this.renderer is defined before trying to access domElement
        if (this.renderer) {
            this.mount.removeChild(this.renderer.domElement);
        }
        window.removeEventListener("resize", this.updateDimensions);
    }
    render() {
        return (
            <div
                style={{ width: "100vw", height: "100vw" }}
                ref={ref => (this.mount = ref)}
            />
        );
    }
}

export default ThreeSceneTestingPBRMaterials;
