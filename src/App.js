import React from 'react';

import ThreeScene from './ThreeScene';
import ThreeSceneStandardPipeline from './ThreeSceneStandardPipeline';
import ThreeSceneCustomPipeline from './ThreeSceneCustomPipeline';
import ThreeSceneCustomPipeline_01 from './ThreeSceneCustomPipeline_01';
import ThreeSceneCustomPipeline_02 from './ThreeSceneCustomPipeline_02';

function App() {
  return (
    <div className="App">
      {/*
      <ThreeSceneStandardPipeline />
      */}

      {
      <ThreeSceneCustomPipeline_02
        vertexShaderFile='/assets/shaders/normal_mapping_04/vertex.glsl'
        fragmentShaderFile='/assets/shaders/normal_mapping_04/fragment.glsl'
      />}

      {/* CLOSE...!

      <ThreeSceneCustomPipeline_01
        vertexShaderFile='/assets/shaders/normal_mapping_01/vertex.glsl'
        fragmentShaderFile='/assets/shaders/normal_mapping_01/fragment.glsl'
      />
      */}

      {/*
      <ThreeSceneCustomPipeline
        vertexShaderFile='/assets/shaders/normal_mapping_simple/vertex.glsl'
        fragmentShaderFile='/assets/shaders/normal_mapping_simple/fragment.glsl'
      />
      */}

      {/*   ADVANCED SHADERS USING LIGHT POSITION
      <ThreeSceneCustomPipeline
        vertexShaderFile='/assets/shaders/normal_mapping/v_normal_mapping.glsl'
        fragmentShaderFile='/assets/shaders/normal_mapping/f_normal_mapping.glsl'
      />
      */}

    </div>

  );
}

export default App;