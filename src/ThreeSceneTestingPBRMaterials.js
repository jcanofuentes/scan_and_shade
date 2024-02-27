import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

class ThreeSceneTestingPBRMaterials extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating SceneStandardPipeline instance (inheriting from React.Component.)");
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
        this.diffuseMap = this.textureLoader.load('/assets/PS_Albedo_4096.png');
        this.diffuseMap.colorSpace = THREE.SRGBColorSpace;
        this.normalMap = this.textureLoader.load('/assets/maps/PS_Normal_4096.png');
    }
    createSceneAndRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x333333);
        this.scene = new THREE.Scene();
    }
    createPerspectiveCamera() {
        var fieldOfView = 60.0;
        var aspectRatio = window.innerWidth / window.innerHeight;
        var nearClippingPlane = 0.1;
        var farClippingPlane = 1000.0;
        var cameraDistance = 14.0;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        this.camera.position.set(0, 0, cameraDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
    createCameraOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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
        plane_material.normalScale = new THREE.Vector2(2.0,2.0);
        plane_material.color = new THREE.Color(0.3,0.3,0.3);
        this.scene.add(plane);
    }
    createLights() {
        this.lightsGroup = new THREE.Group();
        this.scene.add(this.lightsGroup);

        this.pointLight = new THREE.PointLight(0xffffff, 1, 32, 1.1);
        this.pointLight.position.set(0, 0, 5.25);
        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, 0.125);
        this.scene.add(this.pointLightHelper);
        this.lightsGroup.add(this.pointLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 0, 5.25);
        this.dirHelper = new THREE.DirectionalLightHelper(this.dirLight, 0.5);
        this.scene.add( this.dirHelper);
        this.lightsGroup.add(this.dirLight);

        this.dirLight.visible = true;
        this.dirHelper.visible = true;
        this.pointLight.visible = true;
        this.pointLightHelper.visible = true;
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
        this.createCameraOrbitControls();
        this.createGeometry();

        this.createLights();

        const gui = new dat.GUI();
        this.lightParameters = {
            azimuth: 0.0,
            distance: 0.0
        };
        const guiLightsGroup = gui.addFolder('Lighting');
        guiLightsGroup.add(this.lightParameters, 'azimuth', -Math.PI, Math.PI);
        guiLightsGroup.add(this.lightParameters, 'distance', -Math.PI, Math.PI);

        const options = {
            toggle: false,
        };

        // Choose between directional o point lights
        guiLightsGroup.add(options, 'toggle').name('Point / Directional').onChange((value) => {
            if (value) {
                this.dirLight.visible = true;
                this.dirHelper.visible = true;
                this.pointLight.visible = false;
                this.pointLightHelper.visible = false;
            } else {
                this.dirLight.visible = false;
                this.dirHelper.visible = false;
                this.pointLight.visible = true;
                this.pointLightHelper.visible = true;
            }
        });

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
        this.lightsGroup.rotation.x = this.lightParameters.distance;
        this.lightsGroup.rotation.y = this.lightParameters.azimuth;
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
