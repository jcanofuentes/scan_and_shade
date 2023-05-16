import React from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class ThreeCanvasBasic extends React.Component {
    componentDidMount() {
        // Create scene, camera, renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.renderer.setClearColor(0x222222);

        // Set camera position
        this.camera.position.z = 20;

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Add OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load("/assets/PS_Albedo_1024.png", function(texture) {
            // This block of code will be executed once the texture has been loaded.
            // You can create and use your material here.
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                emissive: 0x222222,
                emissiveIntensity: 1.0
            });
            // You can now use 'material' to create your mesh and add it to the scene.
            const geometry = new THREE.PlaneGeometry(5, 5, 5, 5);
            const plane = new THREE.Mesh(geometry, material);
            this.scene.add(plane);
        }.bind(this)); // Bind 'this' to the callback function to access 'this.scene'
        

        // Append renderer to component
        this.mount.appendChild(this.renderer.domElement);

        // Animation loop
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return <div ref={ref => (this.mount = ref)} />;
    }
}

export default ThreeCanvasBasic;
