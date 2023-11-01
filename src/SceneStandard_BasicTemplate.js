import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class SceneStandard_BasicTemplate extends React.Component {
    constructor(props) {
        super(props);
        console.log("Creating ThreeCanvas instance (inheriting from React.Component.)");
    }
    // ------------------------------------------------------------------------------
    // Custom methods for handling the Three.js scene:
    // ------------------------------------------------------------------------------
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
        this.scene.add( new THREE.GridHelper() )
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
        this.setupScene();
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

export default SceneStandard_BasicTemplate;