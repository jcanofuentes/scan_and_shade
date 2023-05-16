import React from 'react';

import ThreeScene from './ThreeScene';
import ThreeSceneStandardPipeline from './ThreeSceneStandardPipeline';
import ThreeSceneCustomPipeline from './ThreeSceneCustomPipeline';


function App() {
  return (
    <div className="App">
      <ThreeSceneCustomPipeline
        vertexShaderFile='/assets/shaders/vt_simple.glsl'
        fragmentShaderFile='/assets/shaders/fr_red.glsl'
      />
    </div>

  );
}

export default App;