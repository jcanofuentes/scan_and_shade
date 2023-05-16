import React from 'react';

import ThreeScene from './ThreeScene';
import ThreeSceneStandardPipeline from './ThreeSceneStandardPipeline';
import ThreeSceneCustomPipeline from './ThreeSceneCustomPipeline';


function App() {
  return (
    <div className="App">
      {/*
      <ThreeSceneStandardPipeline />
      */}

      <ThreeSceneCustomPipeline
        vertexShaderFile='/assets/shaders/vt_bitangent.glsl'
        fragmentShaderFile='/assets/shaders/fr_normal_map.glsl'
      />


    </div>

  );
}

export default App;