import React from 'react';

import SceneStandard_BasicTemplate from './SceneStandard_BasicTemplate';
import SceneStandard_Phong from './SceneStandard_Phong';
import SceneShader_NormalMapDiffuse from './SceneShader_NormalMapDiffuse';
import ThreeSceneCustomPipeline from './ThreeSceneCustomPipeline';
import ThreeSceneCustomPipeline_01 from './ThreeSceneCustomPipeline_01';
import ThreeSceneCustomPipeline_02 from './ThreeSceneCustomPipeline_02';

function App() {
  return (
    <div className="App">
      {
      /*
      {
        <SceneStandard_BasicTemplate />
      }
      {
        <SceneStandard_Phong />
      }
      {
        <SceneShader_NormalMapDiffuse
          vertexShaderFile='/assets/shaders/normalMapDiffuseShader.vert'
          fragmentShaderFile='/assets/shaders/normalMapDiffuseShader.frag'
        />
      }
      */
      }
      {/*
      <ThreeSceneCustomPipeline_02
        vertexShaderFile='/assets/shaders/normal_mapping_04/vertex.glsl'
        fragmentShaderFile='/assets/shaders/normal_mapping_04/fragment.glsl'
      />*/}

      {
/*
      <ThreeSceneCustomPipeline_01
        vertexShaderFile='/assets/shaders/normal_mapping_01/vertex.glsl'
        fragmentShaderFile='/assets/shaders/normal_mapping_01/fragment.glsl'
      />
  */
      }

      {
        <ThreeSceneCustomPipeline
            vertexShaderFile='/assets/shaders/normalMapDiffuseShader.vert'
            fragmentShaderFile='/assets/shaders/normalMapDiffuseShader.frag'
        />
        
      }

    </div>

  );
}

export default App;