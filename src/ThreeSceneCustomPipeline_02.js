import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

class CustomAnimator extends EventTarget {
    targetObject = null;
    pos = new THREE.Vector3(0.0);
    angle = 0.0;
    deltaAngle = 0.005;
    distance = 4.0;
    constructor() {
        super();
    };
    update(){
        this.angle += this.deltaAngle;
        this.pos.x = Math.sin(this.angle) * this.distance;
        this.pos.y = Math.cos(this.angle) * this.distance;
        this.pos.z = Math.cos(this.angle * 0.5) * 3.0 + 3.0;
    }
}

class SceneCustomPipeline_02 extends React.Component {


    constructor(props) {
        super(props);
        console.log("Creating SceneCustomPipeline_02 instance (inheriting from React.Component.)");

        this.frameCount = 0;
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

        this.lightAnimator = new CustomAnimator();

        this.useDiffuseTexture = true;
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
        this.texDiffuse = this.textureLoader.load('/assets/maps/PS_Albedo_4096.png');
        //this.texDiffuse.colorSpace = THREE.SRGBColorSpace;
        this.texNormal = this.textureLoader.load('/assets/maps/PS_Normal_4096.png');
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
        var cameraDistance = 3.0;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);
        this.camera.position.set(0, -8, cameraDistance);
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

                useDiffuseTexture: { type: 'b', value: true },

                lightPosition: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() },
                lightColor: { value: new THREE.Color(1, 1, 1) },

                
                ambientColor: { value: new THREE.Color(0.08, 0.08, 0.15) },

                lightDirection: { value: new THREE.Vector3(0.0, 0.0, 1.0).normalize() },


                material_param_1: { type: 'f', value: 10.0 },// 1.00 - Range (0.0 - 40.0)
                material_param_2: { type: 'f', value: 0.65 },// 0.65 - Range (0.0 - 2.0)
                material_param_3: { type: 'f', value: 0.50 },// 0.50 - Range (0.0, 1.0)

                material_param_4: { type: 'f', value: 1.00 },// 0.50 - Range (0.0, 4.0)

                param_2: { type: 'f', value: 1.0 },
                param_3: { type: 'f', value: 0.09 },
                param_4: { type: 'f', value: 0.032 },
                param_5: { type: 'f', value: 5.0 },
                param_6: { type: 'f', value: 0.001 },
                param_7: { type: 'f', value: 5.0 }
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
        this.scene.add(this.sphere);

        this.material_red = new THREE.MeshBasicMaterial();
        this.material_red.color = new THREE.Color(255.0,0.0,0.0);
        this.animator = new THREE.Mesh(geometry, this.material_red);
        this.animator.scale.setScalar(0.1);
        //this.scene.add(this.animator);
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
        const guiLightsGroup = gui.addFolder('LIGHT_DIRECTION');
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

        guiLightsGroup.close();

        const guiMaterialGroup = gui.addFolder('MATERIAL');
        const options_2 = {
            toggle: true,
        };
        guiMaterialGroup.add(options_2, 'toggle').name('Use diffuse texture / Use diffuse color').onChange((value) => {
            if (value) {
                this.useDiffuseTexture = true;
            } else {
                this.useDiffuseTexture = false;
            }
        });   

        this.material_param_0 = 0.15; // 0.15 - Range (0.0 - 1.0)
        this.material_param_1 = 32.0; // 1.00 - Range (0.0 - 40.0)
        this.material_param_2 = 0.65; // 0.65 - Range (0.0 - 2.0)
        this.material_param_3 = 0.50; // 0.50 - Range (0.0, 1.0)
        this.material_param_4 = 1.00; // 0.50 - Range (0.0, 4.0)
        guiMaterialGroup.add(this, 'material_param_0',0.10,1.0).step(0.05).name('ambient').listen();
        guiMaterialGroup.add(this, 'material_param_1',0.1,120.0).step(0.05).name('shininess').listen();
        guiMaterialGroup.add(this, 'material_param_2',0.0,32.0).step(0.05).name('specularScale').listen();
        guiMaterialGroup.add(this, 'material_param_3',0.0,2.0).step(0.05).name('specularStrength').listen();
        guiMaterialGroup.add(this, 'material_param_4',0.0,4.0).step(0.05).name('normalStrength').listen();

        guiMaterialGroup.open();

        const guiAttGroup = gui.addFolder('ATTENUATION');
        this.param_2 = 0.95;
        this.param_3 = 0.19;
        this.param_4 = 0.025;
        this.param_5 = 5.0;
        this.param_6 = 0.001;
        this.param_7 = 5.0;
        guiAttGroup.add(this, 'param_2',0.0,10.0).step(0.05).name('att_1_const').listen();
        guiAttGroup.add(this, 'param_3',0.0,1.0).step(0.01).name('att_1_lin').listen();
        guiAttGroup.add(this, 'param_4',0.0,1.0).step(0.005).name('att_1_quad').listen();
        guiAttGroup.add(this, 'param_5',0.0,10.0).step(0.05).name('att_2_radius').listen();
        guiAttGroup.add(this, 'param_6',0.001,0.25).step(0.001).name('att_2_falloff').listen();
        guiAttGroup.add(this, 'param_7',0.0,10.0).step(0.05).name('att_3_max_d').listen();
        
        guiAttGroup.open();


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

        this.frameCount++;

                
        let azimuth = Math.PI - (this.lightParameters.azimuth + Math.PI * 0.5);
        let elevation = this.lightParameters.elevation;
        let x = Math.cos(azimuth) * Math.cos(elevation);
        let y = Math.sin(elevation);
        let z = Math.sin(azimuth) * Math.cos(elevation);
        var radius = 5.0;


        this.lighPosition.x = x * radius;
        this.lighPosition.y = y * radius;
        this.lighPosition.z = z * radius;
        


        this.lightAnimator.update();
        this.animator.position.x = this.lightAnimator.pos.x;
        this.animator.position.y = this.lightAnimator.pos.y;
        this.animator.position.z = this.lightAnimator.pos.z;

        this.lighPosition.x = this.lightAnimator.pos.x;
        this.lighPosition.y = this.lightAnimator.pos.y;
        this.lighPosition.z = this.lightAnimator.pos.z;


        this.lightsGroup.position.x = this.lighPosition.x;
        this.lightsGroup.position.y = this.lighPosition.y;
        this.lightsGroup.position.z = this.lighPosition.z;

        if (this.material != null) {
            this.material.uniforms.lightPosition.value = this.lighPosition;
            //this.material.uniforms.projection.value = this.camera.projectionMatrix;
            //this.material.uniforms.view.value = this.camera.matrixWorldInverse;

            this.material.uniforms.ambientColor.value =  new THREE.Color(this.material_param_0,this.material_param_0,this.material_param_0);
            this.material.uniforms.material_param_1.value =  this.material_param_1;
            this.material.uniforms.material_param_2.value =  this.material_param_2;
            this.material.uniforms.material_param_3.value =  this.material_param_3;
            this.material.uniforms.material_param_4.value =  this.material_param_4;

            this.material.uniforms.useDiffuseTexture.value = this.useDiffuseTexture;

            this.material.uniforms.param_2.value = this.param_2;
            this.material.uniforms.param_3.value = this.param_3;
            this.material.uniforms.param_4.value = this.param_4;
            this.material.uniforms.param_5.value = this.param_5;
            this.material.uniforms.param_6.value = this.param_6;
            this.material.uniforms.param_7.value = this.param_7;

        }

        // Calculamos la dirección
        this.lightDirection.x = this.lighPosition.x;
        this.lightDirection.y = this.lighPosition.y;
        this.lightDirection.z = this.lighPosition.z;
        this.lightDirection = this.lightDirection.normalize();
        this.material.uniforms.lightDirection.value = this.lightDirection;

        /*
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
