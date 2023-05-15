# Three.js Scene with React

This project is a minimal setup for using Three.js within a React application. It sets up a simple Three.js scene and renders it into a React component.

## Project Structure

The main files and directories for this project are:

```
your-app/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── index.js
│   └── ThreeScene.js
├── package.json
├── package-lock.json
└── README.md
```

Here is a brief overview of each:

### `public/index.html`

This is the main HTML page that is served when someone visits your site. The div with id 'root' inside this file is the entry point to your React app. The rest of the HTML file provides important metadata to the browser and sets the page title.

### `src/index.js`

This is the entry point to your React application. It imports the React and ReactDOM libraries, as well as the main App component. It uses the `ReactDOM.createRoot()` method to create a root React fiber, and then the `root.render()` method to render the React app into the `div` with id "root" in the "index.html" file.

### `src/App.js`

This file defines the main App component. The App component imports and renders the `ThreeScene` component, which is wrapped in a `div` with a class of "App".

### `src/ThreeScene.js`

This is where the Three.js scene is created and manipulated. It defines a `ThreeCanvas` React component. In the `componentDidMount()` lifecycle method, it sets up the Three.js scene, creates and animates a mesh, and adds it to the scene. It also manages loading of textures and shaders using the THREE.LoadingManager, and creates a material using the loaded texture, which is then applied to the mesh.

## Usage

### Installation

To install the necessary dependencies, navigate to the project directory and run:

```
npm install
```

### Running the App

To start the application, run:

```
npm start
```

Then open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Notes

This project is a basic integration of Three.js within React. For complex projects, consider using a wrapper library like [react-three-fiber](https://github.com/pmndrs/react-three-fiber) to better integrate Three.js within the React environment.

## Detailed Components Description

This section provides more detailed information about the main components in the `src/` directory.

### `src/App.js`

This is the main application component. In this minimal setup, it simply serves as a container for the `ThreeScene` component.

The `App` function is a functional component which returns a JSX representation of the component to be rendered. In this case, it's a `div` with the class name "App", and it contains the `ThreeScene` component.

```jsx
import React from 'react';
import ThreeScene from './ThreeScene';

function App() {
  return (
    <div className="App">
      <ThreeScene />
    </div>
  );
}

export default App;
```

### `src/ThreeScene.js`

This file defines a `ThreeCanvas` React component, which is responsible for setting up and rendering a Three.js scene.

The `ThreeCanvas` class extends `React.Component`, meaning it inherits methods from the `React.Component` class. It also defines several methods of its own for setting up and manipulating the Three.js scene:

- `constructor(props)`: This method is called when an object is created from a class. It initializes the `loadManager` and `textureLoader` properties and sets up a callback for when all resources have loaded.
- `handleAllResourcesLoaded()`: This method is called when all resources (like textures and shaders) have loaded. It logs a message to the console and sets up the scene.
- `componentDidMount()`: This method is a lifecycle method that runs after the component output has been rendered to the DOM. It loads the texture and then calls `handleAllResourcesLoaded()`.
- `setupScene()`: This method sets up the Three.js scene. It creates a scene, a camera, a renderer, a mesh (with a plane geometry and the loaded texture as a material), and a light. It adds the mesh and light to the scene, appends the renderer to the document, and starts the animation loop.
- `animate()`: This method renders the scene and schedules the next frame.
- `componentWillUnmount()`: This method is another lifecycle method that runs before the component is removed from the DOM. It cancels the animation frame and removes the renderer from the document.

This file also exports the `ThreeCanvas` class as a default export, making it accessible to other files in the project. 

```jsx
export default ThreeCanvas;
```

