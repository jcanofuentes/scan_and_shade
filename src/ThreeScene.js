import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class ThreeCanvas extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating ThreeCanvas instance (inheriting from React.Component.)");
        THREE.ColorManagement.enabled = true;
        this.loadManager = new THREE.LoadingManager();
        this.loadManager.onLoad = this.handleAllResourcesLoaded.bind(this);
    }
    // ------------------------------------------------------------------------------
    // Custom methods for handling the Three.js scene:
    // ------------------------------------------------------------------------------
    handleAllResourcesLoaded() {
        console.log('All resources loaded succesfully!');
        this.setupScene();
    }
    loadTextures() {
        console.log("Loading textures...");
        this.textureLoader = new THREE.TextureLoader(this.loadManager);
        this.diffuseMap = this.textureLoader.load('/assets/PS_Albedo_1024.png');
        this.diffuseMap.colorSpace = THREE.SRGBColorSpace;
        this.normalMap = this.textureLoader.load('/assets/PS_Normal_1024.png');
    }
    loadShaders() {
        this.vertexShaderLoader = new THREE.FileLoader(this.loadManager);
        this.fragmentShaderLoader = new THREE.FileLoader(this.loadManager);
        this.vertexShaderLoader.load('/assets/vertex.glsl', (data) => {
            console.log("Vertex shader loaded!");
            this.vertexShader = data;
        });
        this.fragmentShaderLoader.load('/assets/fragment.glsl', (data) => {
            console.log("Fragment shader loaded!");
            this.fragmentShader = data;
        });
    }
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222222);
    }
    createScene() {
        this.scene = new THREE.Scene();
    }
    createPerspectiveCamera() {
        var fieldOfView = 60.0;
        var aspectRatio = window.innerWidth / window.innerHeight;
        var nearClippingPlane = 0.1;
        var farClippingPlane = 1000.0;
        var cameraDistance = 20.0;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }
    createGeometry() {
        const plane_material = new THREE.MeshPhongMaterial(
            {
                map: this.diffuseMap,
                wireframe: false
            }
        );
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5, 5, 5),
            plane_material
        );
        this.scene.add(plane);
    }
    createLights() {
        this.scene.add(new THREE.AmbientLight(0xeef0ff));
        /*
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 1);
        this.scene.add(light);
        */
    }
    createHelpers() {
        // Create some helpers
        const axesHelper = new THREE.AxesHelper(1);
        this.scene.add(axesHelper);
    }
    setupScene() {
        console.log('Scene setup...');

        this.createRenderer();
        this.createScene();
        this.createPerspectiveCamera();
        this.createGeometry();
        this.createLights();
        this.createHelpers();

        this.mount.appendChild(this.renderer.domElement);
        this.animate();
    }

    animate() {
        this.frameId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // ------------------------------------------------------------------------------
    // Inherited from React.Component
    // ------------------------------------------------------------------------------
    componentDidMount() {
        console.log("componentDidMount");


        this.loadTextures();
        //this.loadShaders();
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.frameId);
        // Check if this.renderer is defined before trying to access domElement
        if (this.renderer) {
            this.mount.removeChild(this.renderer.domElement);
        }
    }

    render() {
        return (
            <div
                ref={ref => (this.mount = ref)}
            />
        );
    }
}

export default ThreeCanvas;
