import Joystick from './Joystick';
import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

class ThreeCanvas extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating ThreeCanvas instance (inheriting from React.Component.)");
        this.loadManager = new THREE.LoadingManager();
        this.loadManager.onLoad = this.handleAllResourcesLoaded.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
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
    createSceneAndRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222222);

        this.scene = new THREE.Scene();
    }
    createPerspectiveCamera() {
        var fieldOfView = 60.0;
        var aspectRatio = window.innerWidth / window.innerHeight;
        var nearClippingPlane = 0.1;
        var farClippingPlane = 1000.0;
        var cameraDistance = 7.0;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));


    }
    createCameraOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        //this.controls.minDistance = 1;
        //this.controls.maxDistance = 10;
        //this.controls.enablePan = false;
        //this.controls.enableDamping = true;
    }
    createGeometry() {
        const plane_material = new THREE.MeshPhongMaterial(
            {
                map: this.diffuseMap,
                normalMap: this.normalMap,
                wireframe: false
            }
        );
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 1, 1),
            plane_material
        );
        this.scene.add(plane);
    }
    createDirectionalLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 5.25);
        //this.scene.add(light);
        const group = new THREE.Group();
        group.add(light)
        const controls = new OrbitControls(group, this.renderer.domElement);
        controls.target.z = 0.001;
        this.scene.add(group)
        const helper = new THREE.DirectionalLightHelper(light, 0.5);
        this.scene.add(helper);
    }
    createPointLight() {
        const pointLight = new THREE.PointLight(0xffffff, 1, 32, 1.1);
        pointLight.position.set(0, 0, 5.25);
        //this.scene.add(pointLight);
        const sphereSize = 0.125;
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        this.scene.add(pointLightHelper);
        const group = new THREE.Group();
        group.add(pointLight)
        const controls = new OrbitControls(group, this.renderer.domElement);
        this.scene.add(group)
    }
    createHelpers() {
        const axesHelper = new THREE.AxesHelper(1);
        this.scene.add(axesHelper);
    }
    setupScene() {
        console.log('Scene setup...');

        THREE.ColorManagement.enabled = true;
        this.createSceneAndRenderer();
        //this.createHelpers();
        this.createPerspectiveCamera();
        //this.createCameraOrbitControls();
        this.createGeometry();

        this.createDirectionalLight();
        //this.createPointLight();

        const gui = new dat.GUI();
        const settings = {
            value: 0.5
        };

        gui.add(settings, 'value', 0, 1);

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
        //this.controls.update();
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

    /*
        render() {
            return (
                <div>
                    <Joystick onChange={this.handleJoystickChange} />
                    <div
                        style={{ width: "100vw", height: "75vw" }}
                        ref={ref => (this.mount = ref)}
                    />
                </div>
            );
        }
    */

}

export default ThreeCanvas;
