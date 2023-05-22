import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

class SceneCustomPipeline_02 extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating SceneCustomPipeline_02 instance (inheriting from React.Component.)");

        this.vertexShaderFile = props.vertexShaderFile;
        this.fragmentShaderFile = props.fragmentShaderFile;

        this.loadManager = new THREE.LoadingManager();
        this.loadManager.onLoad = this.handleAllResourcesLoaded.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);

        this.lighPosition = new THREE.Vector3(0.0);
        this.lightDirection = new THREE.Vector3(0.0);

        this.clock = new THREE.Clock();
        this.iResolution = new THREE.Vector2(0.0);
        this.material = null;

    }
    // ------------------------------------------------------------------------------
    // Custom methods for handling the Three.js scene:
    // ------------------------------------------------------------------------------
    handleAllResourcesLoaded() {
        console.log('All resources loaded succesfully!');
        this.setupScene();
        this.updateDimensions();
    }
    loadTextures() {
        console.log("Loading textures...");
        this.textureLoader = new THREE.TextureLoader(this.loadManager);
        this.texDiffuse = this.textureLoader.load('/assets/PS_Albedo_4096.png');
        //this.texDiffuse.colorSpace = THREE.SRGBColorSpace;
        this.texNormal = this.textureLoader.load('/assets/PS_Normal_4096.png');
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

        const colorUniform = { value: new THREE.Color(1, 1, 1) };

        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                iResolution: { value: new THREE.Vector2(1.0, 1.0) },
                iTime: { type: 'f', value: 0.0 },

                texDiffuse: { value: this.texDiffuse },
                texNormal: { value: this.texNormal },

                lightPosition: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() },
                lightColor: { value: new THREE.Color(1,1,1) },
                lightAmbient: { value: new THREE.Color(0.4,0.4,0.4) },
                lightFalloff: { type: 'f', value: 0.15 },
                lightRadius: { type: 'f', value: 6.0 },

                lightDirection: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() },
                projection: { value: new THREE.Matrix4() },
                view: { value: new THREE.Matrix4() },
                model: { value: new THREE.Matrix4() }
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
        const geometry = new THREE.SphereGeometry(2.5);
        this.sphere = new THREE.Mesh(geometry, this.material);
        //this.scene.add(this.sphere);
    }
    createLights() {
        this.lightsGroup = new THREE.Group();
        //this.lightsGroup.translateZ(5.25);
        this.scene.add(this.lightsGroup);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 0, 0);
        this.dirHelper = new THREE.DirectionalLightHelper(this.dirLight, 0.5);
        this.scene.add(this.dirHelper);
        this.lightsGroup.add(this.dirLight);

        this.pointLight = new THREE.PointLight(0xffffff, 1, 32, 1.1);
        this.pointLight.position.set(0, 0, 0);
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
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
    createGUI() {
        const gui = new dat.GUI();
        this.lightParameters = {
            azimuth: 0.0,
            elevation: 0.0
        };
        const guiLightsGroup = gui.addFolder('SHADER_PARAMETERS');
        guiLightsGroup.add(this.lightParameters, 'azimuth', -Math.PI * 0.5, Math.PI * 0.5).step(0.1);
        guiLightsGroup.add(this.lightParameters, 'elevation', -Math.PI * 0.5, Math.PI * 0.5).step(0.1);

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

        const guiValuesGroup = gui.addFolder('LIGHT_SOURCE_DATA');
        guiValuesGroup.add(this.lighPosition, 'x').step(0.05).name('POS_X').listen();
        guiValuesGroup.add(this.lighPosition, 'y').step(0.05).name('POS_Y').listen();
        guiValuesGroup.add(this.lighPosition, 'z').step(0.05).name('POS_Z').listen();
        guiValuesGroup.add(this.lightDirection, 'x').step(0.05).name('DIR_X').listen();
        guiValuesGroup.add(this.lightDirection, 'y').step(0.05).name('DIR_Y').listen();
        guiValuesGroup.add(this.lightDirection, 'z').step(0.05).name('DIR_Z').listen();

        guiLightsGroup.open();
        guiValuesGroup.open();
    }
    setupScene() {
        console.log('Scene setup...');
        THREE.ColorManagement.enabled = true;
        this.createSceneAndRenderer();
        this.createHelpers();
        this.createPerspectiveCamera();
        this.createCameraOrbitControls();
        this.createLights();
        this.createGeometry();
        this.createGUI();
        this.mount.appendChild(this.renderer.domElement);
        this.animate();
    }
    updateDimensions() {
        if (this.mount !== null) {
            this.iResolution.x = this.mount.clientWidth;
            this.iResolution.y = this.mount.clientHeight;
            this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
            this.camera.aspect = this.mount.clientWidth / this.mount.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.render(this.scene, this.camera);
        }
    }
    animate() {

        this.frameId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();


        //this.lightsGroup.rotation.x = this.lightParameters.elevation;
        //this.lightsGroup.rotation.y = this.lightParameters.azimuth;

        let azimuth = this.lightParameters.azimuth + Math.PI * 0.5;
        let elevation = this.lightParameters.elevation;
        let x = Math.cos(azimuth) * Math.cos(elevation);
        let y = Math.sin(elevation);
        let z = Math.sin(azimuth) * Math.cos(elevation);

        var radius = 5.0;
        this.lighPosition.x = x * radius;
        this.lighPosition.y = y * radius;
        this.lighPosition.z = z * radius;

        this.lightsGroup.position.x = this.lighPosition.x;
        this.lightsGroup.position.y = this.lighPosition.y;
        this.lightsGroup.position.z = this.lighPosition.z;

        if (this.material != null) {
            this.material.uniforms.lightPosition.value = this.lighPosition;
            this.material.uniforms.projection.value = this.camera.projectionMatrix;
            this.material.uniforms.view.value = this.camera.matrixWorldInverse;
        }

        /*
        // Calculamos la dirección
        this.lightDirection.x = x;
        this.lightDirection.y = y;
        this.lightDirection.z = z;
        this.lightDirection = this.lightDirection.normalize();
        this.material.uniforms.lightDirection.value = this.lightDirection;

        // Calculamos la posición de la luz en espacio de vista (view space)
        let pos = new THREE.Vector3(0.0);
        this.pointLight.getWorldPosition(pos);
        var viewMatrix = this.camera.matrixWorldInverse; // matriz de vista de la cámara
        pos.applyMatrix4(viewMatrix); // transformamos a espacio de vista
        this.material.uniforms.lightPosition.value = pos;
        this.lighPosition = pos;
        */

        //let lighPos = THREE.Vector3(Math.sin(this.clock.getElapsedTime() * 1.0) * 20.0, 0.0, Math.cos(this.clock.getElapsedTime() * 1.0) * 20.0);

        /*
        // Animacion
        var lightHeight = 2.0;
        var lightPathDiameter = 3.0;
        var lightPathAnimationSpeed = 0.5;
        this.lighPosition.z = lightHeight;
        this.lighPosition.x = Math.sin(this.clock.getElapsedTime() * lightPathAnimationSpeed) * lightPathDiameter;
        this.lighPosition.y = Math.cos(this.clock.getElapsedTime() * lightPathAnimationSpeed) * lightPathDiameter;
        this.material.uniforms.lightPosition.value = this.lighPosition;
        this.lightsGroup.lookAt(this.lighPosition);
        */

        // Shader toy compatibility...
        this.material.uniforms.iResolution.value = this.iResolution;
        const ellapsed = this.clock.getElapsedTime();
        this.material.uniforms.iTime.value = ellapsed;

        //this.sphere.rotation.y += 0.005;

        //this.material.uniforms.lightPosition.value = this.lighPosition;
        //let lightPositionWorld = new THREE.Vector3(0.0);

        /*
        lightPositionWorld.x = this.lighPosition.x;
        lightPositionWorld.y = this.lighPosition.y;
        lightPositionWorld.z = this.lighPosition.z;
        var viewMatrix = this.camera.matrixWorldInverse; // matriz de vista de la cámara
        var lightPositionView = lightPositionWorld.applyMatrix4(viewMatrix); // transformamos a espacio de vista
        this.material.uniforms.lightPosition.value = this.lighPosition;
*/

        //this.material.uniforms.lightPosition.value = this.lighPosition;

        //this.pointLight.getWorldPosition(this.lighPosition);


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

export default SceneCustomPipeline_02;
