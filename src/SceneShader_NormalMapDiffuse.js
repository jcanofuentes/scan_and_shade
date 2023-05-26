import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as dat from 'dat.gui';

class SceneShader_NormalMapDiffuse extends React.Component {
    constructor(props) {
        super(props);
        this.vertexShaderFile = props.vertexShaderFile;
        this.fragmentShaderFile = props.fragmentShaderFile;
        this.loadManager = new THREE.LoadingManager();
        this.loadManager.onLoad = this.handleAllResourcesLoaded.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.lightsGroup = null;
        this.camera = null;
        this.orbitsControl = null;
        this.transformControl = null;
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
        this.diffuseMap = this.textureLoader.load('/assets/maps/PS_Albedo_4096.png');
        this.diffuseMap.colorSpace = THREE.SRGBColorSpace;
        this.normalMap = this.textureLoader.load('/assets/maps/PS_Normal_4096.png');
    }
    loadShaders() {
        this.vertexShaderLoader = new THREE.FileLoader(this.loadManager);
        this.fragmentShaderLoader = new THREE.FileLoader(this.loadManager);
        this.vertexShaderLoader.load(this.vertexShaderFile, (data) => {
            console.log("Vertex shader loaded!");
            this.vertexShader = data;
        });
        this.fragmentShaderLoader.load(this.fragmentShaderFile, (data) => {
            console.log("Fragment shader loaded!");
            this.fragmentShader = data;
        });
    }
    createScene() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222222);
        this.scene = new THREE.Scene();
        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                normalMap: { value: this.normalMap },
                lightPosition: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() },
                normalScale: { value: new THREE.Vector2(2.0, 2.0) },
            }
        ]);
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            lights: true
        });
        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 1, 1),
            this.material
        );
        this.scene.add(plane);
    }


    createGUI() {
        const gui = new dat.GUI();
        this.shadingParams = {
            vertical_Exaggeration: 0.25
        };
        const guiShadingGroup = gui.addFolder('Shading');
        guiShadingGroup.add(this.shadingParams, 'vertical_Exaggeration', 0, 8).step(0.1);

        const options = {
            toggle: false,
        };
        // Choose between directional o point lights
        this.guiCameraGroup = gui.addFolder('Camera');
        this.cameraOption = this.guiCameraGroup.add(options, 'toggle').name('Ortho/Perspective').onChange((value) => {
            if (value) {
                this.selectCamera("Ortho");
            } else {
                this.selectCamera("Perspective");
            }
        });
    }

    disposeCameraResources() {
        if (this.camera != null) {
            this.scene.remove(this.camera);
            this.camera = null;
        }
        if (this.orbitsControl != null)
            this.orbitsControl = null;
        if (this.transformControl != null) {
            this.scene.remove(this.transformControl);
            this.transformControl.dispose();
            this.transformControl = null;
        }
    }

    createCameraPerspective() {
        this.disposeCameraResources();
        var fieldOfView = 60.0;
        var aspectRatio = window.innerWidth / window.innerHeight;
        var nearClippingPlane = 0.1;
        var farClippingPlane = 100.0;
        var cameraDistance = 9.0;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.orbitsControl = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitsControl.enableRotate = false;
        this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControl.attach(this.lightsGroup);
        this.transformControl.addEventListener('dragging-changed', (event) => { this.orbitsControl.enabled = !event.value; });
        this.scene.add(this.transformControl);

        this.updateDimensions();
    }

    createCameraOrtho() { 
        this.disposeCameraResources();
        var width = 9; // window.innerWidth;
        var height = 9; //window.innerHeight;
        var nearClippingPlane = 0.01;
        var farClippingPlane = 100.0;
        var cameraDistance = 7.0;
        this.camera = new THREE.OrthographicCamera(
            width / -2,   // left
            width / 2,    // right
            height / 2,   // top
            height / -2,  // bottom
            nearClippingPlane,
            farClippingPlane
        );
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.orbitsControl = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitsControl.enableRotate = false;
        this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControl.attach(this.lightsGroup);
        this.transformControl.addEventListener('dragging-changed', (event) => { this.orbitsControl.enabled = !event.value; });
        this.scene.add(this.transformControl);

        this.updateDimensions();
    }

    selectCamera(type) {
        if (type == 'Perspective') {
            console.log("perspective");
            this.createCameraPerspective();
        }
        if (type == 'Ortho') {
            console.log("ortho");
            this.createCameraOrtho();
        }
    }

    setupScene() {
        console.log('Scene setup...');
        THREE.ColorManagement.enabled = true;
        this.createScene();
        this.createGUI();
        this.lightsGroup = new THREE.Group();
        this.lightsGroup.position.z = 1.0;
        this.scene.add(this.lightsGroup);
        this.createCameraPerspective();

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

        // Update shader uniforms
        let worldPosition = new THREE.Vector3();
        this.lightsGroup.getWorldPosition(worldPosition);
        this.material.uniforms.lightPosition.value = worldPosition;
        this.material.uniforms.normalScale.value = new THREE.Vector2(this.shadingParams.vertical_Exaggeration, this.shadingParams.vertical_Exaggeration);

        this.renderer.render(this.scene, this.camera);
    }

    // ------------------------------------------------------------------------------
    // Inherited from React.Component
    // ------------------------------------------------------------------------------
    componentDidMount() {
        console.log("componentDidMount");
        this.loadTextures();
        this.loadShaders();
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
export default SceneShader_NormalMapDiffuse;
