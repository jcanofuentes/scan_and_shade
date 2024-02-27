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

## Setting Up Node.js

This project requires Node.js version 18. To set up Node.js on your system, we recommend using NVM (Node Version Manager) for easy installation and management of multiple Node.js versions.

### Installing NVM

Open your terminal and run the following command to install NVM:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Restart your terminal. Then:

```
nvm install node

nvm install 18

nvm use 18
```

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
### `src/index.js`

This is the entry point to the React application. It's responsible for rendering the top-level `App` component into the root `div` element in `index.html`.

This file first imports the necessary modules: `React`, `ReactDOM`, and `App`. It then creates a root, which is a concurrent root container at the DOM node with the ID of 'root'.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
```

The `ReactDOM.createRoot()` method is a part of the new Concurrent Mode API introduced in React 18. It creates a root container at the specified DOM node and returns a root instance. The root instance is used to schedule updates to the React tree.

Finally, the `render` method of the root instance is called to render the `App` component into the root `div` element:

```jsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

The `React.StrictMode` is a wrapper component that checks for potential problems in the app during the development build. It does not render any visible UI, and it activates additional checks and warnings for its descendants.

The `App` component is the main component of the application, which in this case wraps around the `ThreeScene` component.

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

## `ThreeScene.js`: Structure and Execution Order

The `ThreeCanvas` component in the `ThreeScene.js` file is a crucial part of our integration between React and Three.js. It's responsible for setting up and managing the Three.js scene within the lifecycle of a React component. Here's a closer look at its structure and execution order:

### Structure

The `ThreeCanvas` component extends `React.Component`, inheriting all the properties and methods of a standard React component. It has several key methods:

**Inherited from `React.Component`:**

- `constructor`: Sets up the initial state and binds the `this` context for our methods.
- `componentDidMount`: A lifecycle method called after the component has been rendered to the DOM.
- `componentWillUnmount`: A lifecycle method called just before the component is unmounted and destroyed. This is where cleanup tasks are performed.
- `render`: A lifecycle method responsible for rendering the component to the DOM.

**Custom methods for handling the Three.js scene:**

- `handleAllResourcesLoaded`: Handles actions to take once all resources are loaded.
- `setupScene`: Sets up the Three.js scene.
- `loadTextures`: Loads textures using Three.js's `TextureLoader`.
- `loadShaders`: Loads shaders using Three.js's `FileLoader`.
- `animate`: Contains the animation loop.

### Execution Order

1. When a `ThreeCanvas` component is instantiated, the `constructor` method is called first. This sets up the Loading Manager and the function to be called when all resources are loaded.
2. After the component is rendered to the DOM, React calls the `componentDidMount` method. This begins the loading of textures, and once the texture is loaded, `handleAllResourcesLoaded` is called.
3. `handleAllResourcesLoaded` calls `setupScene`, which creates the Three.js scene, adds the mesh to it, sets up the camera and renderer, and begins the animation loop.
4. `animate` is then called on every frame, rendering the scene.
5. If the component is removed from the DOM, `componentWillUnmount` is called, canceling the animation frame and removing the Three.js renderer from the DOM.

This structure allows us to integrate React's component lifecycle with Three.js's render loop and resource management, providing a seamless user experience.
