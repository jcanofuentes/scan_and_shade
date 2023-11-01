import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

class SceneCustomPipeline_01 extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating SceneCustomPipeline_01 instance (inheriting from React.Component.)");

        this.vertexShaderFile = props.vertexShaderFile;
        this.fragmentShaderFile = props.fragmentShaderFile;

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
        var farClippingPlane = 100.0;
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

        const colorUniform = { value: new THREE.Color(1,1,1) } 

        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                uColor: colorUniform,
                diffuseMap: { value: this.diffuseMap },
                normalMap: { value: this.normalMap },
                lightPosition: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() },
                lightDirection: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() }
            }
        ]);

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            lights: true,
            name: 'ARCHIOxCustomShader',
            //blending: NoBlending
        });

        var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 1, 1),
            this.material
        );
        this.scene.add(plane);

        // Test sphere
        const geometry = new THREE.SphereGeometry( 2 );
        const sphere = new THREE.Mesh( geometry, this.material );
        //this.scene.add(sphere);
    }
    createLights() {
        this.lightsGroup = new THREE.Group();
        //this.lightsGroup.translateZ(5.25);
        this.scene.add(this.lightsGroup);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 0, 5.25);
        this.dirHelper = new THREE.DirectionalLightHelper(this.dirLight, 0.5);
        this.scene.add(this.dirHelper);
        this.lightsGroup.add(this.dirLight);

        this.pointLight = new THREE.PointLight(0xffffff, 1, 32, 1.1);
        this.pointLight.position.set(0, 0, 5.25);
        this.pointLightHelper = new THREE.PointLightHelper(this.pointLight, 0.125);
        this.scene.add(this.pointLightHelper);
        this.lightsGroup.add(this.pointLight);

        /*
        spotLight = new THREE.SpotLight( 0xaaaaaa );
        spotLight.position.set( 1000, 500, 1000 );
        spotLight.castShadow = true;
        spotLight.shadowCameraNear = 500;
        spotLight.shadowCameraFov = 70;
        spotLight.shadowBias = 0.001;
        spotLight.shadowMapWidth = 1024;
        spotLight.shadowMapHeight = 1024;
        scene.add( spotLight );
        */

        this.dirLight.visible = false;
        this.dirHelper.visible = false;
        this.pointLight.visible = true;
        this.pointLightHelper.visible = true;
    }
    createHelpers() {
        const axesHelper = new THREE.AxesHelper(10);
        this.scene.add(axesHelper);
    }
    createGUI() {
        const gui = new dat.GUI();
        this.lightParameters = {
            azimuth: 0.0,
            elevation: 0.0
        };
        const guiLightsGroup = gui.addFolder('Lighting');
        guiLightsGroup.add(this.lightParameters, 'azimuth', -Math.PI, Math.PI).step(0.1);
        guiLightsGroup.add(this.lightParameters, 'elevation', -Math.PI, Math.PI).step(0.1);

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
    }
    setupScene() {
        console.log('Scene setup...');
        THREE.ColorManagement.enabled = true;
        this.createSceneAndRenderer();
        this.createHelpers();
        this.createPerspectiveCamera();
        this.createCameraOrbitControls();
        this.createGeometry();
        this.createLights();
        this.createGUI();
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

        this.lightsGroup.rotation.x = this.lightParameters.elevation;
        this.lightsGroup.rotation.y = this.lightParameters.azimuth;

        let azimuth = this.lightParameters.azimuth;
        let elevation = this.lightParameters.elevation;
        let x = Math.cos(azimuth) * Math.cos(elevation);
        let y = Math.sin(elevation);
        let z = Math.sin(azimuth) * Math.cos(elevation);

        let directionVector = new THREE.Vector3(x, y, z);
        let dir = directionVector.normalize();
        this.material.uniforms.lightDirection.value = dir;

        //this.material.uniforms.lightPos.value = this.pointLight.position
        //console.log( "x: " + this.lightsGroup.position.x + "y: " + this.lightsGroup.position.y );
        let worldPosition = new THREE.Vector3();
        this.pointLight.getWorldPosition(worldPosition);
        this.material.uniforms.lightPosition.value = worldPosition;

        //console.log( "[ " + worldPosition.x + ", " + worldPosition.y + ", " + worldPosition.z + " ]");

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

export default SceneCustomPipeline_01;
