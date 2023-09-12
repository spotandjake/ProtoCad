import { type Dispatch, type SetStateAction } from 'react'
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
// TODO: Add typescript types
// @ts-ignore
import { Asset, Scene, Mesh, Node, Primitive, buildVec3Accessor, Material, MetallicRoughness } from 'gltf-builder';
// Types
type DataStore<T> = Map<number, T>;
interface Sketch {
  sketchID: number,
}
// TODO: Sketch Parts
// TODO: Handle Materials
interface Model {
  modelID: number,
  modelParts: ModelElm[]
  scaleX: number,
  scaleY: number,
  scaleZ: number,
  posX: number,
  posY: number,
  posZ: number,
}
type ModelElm = ModelElmPrimCube | ModelElmPrimSphere | ModelElmRef
enum ModelType {
  PrimCube,
  PrimSphere,
  ModelRef,
}
interface ModelElmPrimCube {
  modelType: ModelType.PrimCube,
}
interface ModelElmPrimSphere {
  modelType: ModelType.PrimSphere,
}
// TODO: This will break gc
interface ModelElmRef {
  modelType: ModelType.ModelRef,
  refID: number,
}
// Helpers
// TODO: Check Against Maps to verify no overlap, consider tagging models with 1 bit so we can better inform users of errors
const genUID = (): number => crypto.getRandomValues(new Uint16Array(1))[0];
const writeData = <T extends Model | Sketch>(uid: number, data: T, dataStore: DataStore<T>) => {
  dataStore.set(uid, data);
}
const getSketch = (sketchID: number, sketchStore: DataStore<Sketch>): Sketch => {
  const sketch = sketchStore.get(sketchID);
  if (sketch == undefined) throw new Error('Error: Invalid Sketch Reference');
  return sketch;
}
const getModel = (modelID: number, modelStore: DataStore<Model>): Model => {
  const model = modelStore.get(modelID);
  if (model == undefined) throw new Error('Error: Invalid Model Reference');
  return model;
}
const createModel = (posX: number, posY: number, posZ: number): Model => {
  return {
    modelID: genUID(),
    modelParts: [],
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    posX: posX,
    posY: posY,
    posZ: posZ,
  }
}
// TODO: handle buildSketch
const buildModel = (model: Model, modelStore: DataStore<Model>) => {
  // TODO: Consider Instancing The model somehow
  // TODO: Respect Materials
  const baseMaterial = new Material().metallicRoughness(
    new MetallicRoughness()
      .baseColorFactor([110/255, 211/255, 207/255, 1]) // Colour specified in an RGBA vector
      .metallicFactor(.25)
      .roughnessFactor(1)
  );
  // TODO: Respect Render Settings
  // Create Parent Node
  const parentModel = new Node();
  parentModel.scale(model.scaleX, model.scaleY, model.scaleZ)
  parentModel.translation(model.posX + model.scaleX, model.posY, model.posZ);
  // build Model
  for (const modelPart of model.modelParts) {
    switch (modelPart.modelType) {
      case ModelType.PrimCube:
        // TODO: Handle this
        const cubeNode = new Node();
        const squarePrimitive = new Primitive().position(
          // TODO: Determine a cleaner way to build this, maybe take a look at threejs
          // TODO: Consider if we want things centered on origin or centered on corner
          buildVec3Accessor([
            // Face 1
            [-1.5, .5, .5], // triangle #1
            [-.5, -.5, .5],
            [-.5, .5, .5],
            [-1.5, .5, .5], // triangle #2
            [-1.5, -.5, .5],
            [-.5, -.5, .5],
            // Face 2
            [-.5, -.5, -.5], // triangle #1
            [-1.5, .5, -.5], 
            [-.5, .5, -.5],
            [-1.5, -.5, -.5], // triangle #2
            [-1.5, .5, -.5], 
            [-.5, -.5, -.5],
            // Face 3
            [-1.5, -.5, .5], // triangle #1
            [-1.5, .5, .5], 
            [-1.5, .5, -.5],
            [-1.5, .5, -.5],  // triangle #2
            [-1.5, -.5, -.5],
            [-1.5, -.5, .5],
            // Face 4
            [-.5, .5, .5], // triangle #1
            [-.5, -.5, .5], 
            [-.5, .5, -.5],
            [-.5, -.5, -.5], // triangle #2
            [-.5, .5, -.5],  
            [-.5, -.5, .5],
            // Face 5
            [-1.5, .5, .5], // triangle #1
            [-.5, .5, .5], 
            [-.5, .5, -.5],
            [-.5, .5, -.5], // triangle #2
            [-1.5, .5, -.5], 
            [-1.5, .5, .5],
            // Face 6
            [-.5, -.5, .5], // triangle #1
            [-1.5, -.5, .5], 
            [-.5, -.5, -.5],
            [-1.5, -.5, -.5], // triangle #2 
            [-.5, -.5, -.5], 
            [-1.5, -.5, .5],
          ])
        ).material(baseMaterial);
        const cubeMesh = new Mesh();
        cubeMesh.addPrimitive(squarePrimitive);
        cubeNode.mesh(cubeMesh);
        parentModel.addChild(cubeNode);
        break;
      case ModelType.PrimSphere:
        // TODO: Handle this
        break;
      case ModelType.ModelRef:
        // TODO: Handle this
        break;
      default:
        throw new Error('Error: Invalid Model Type At buildModel');
    }
  }
  // Return Model
  return parentModel;
}
const buildScene = (modelStore: DataStore<Model>) => {
  const scene = new Scene();
  // For each model
  for (const model of modelStore.values()) {
    scene.addNode(buildModel(model, modelStore));
  }
  return new Asset().addScene(scene).build();
}
// The main interface
export default (setScene: Dispatch<SetStateAction<THREE.Object3D[]>>) => {
  // Clear Scene
  setScene([]);
  // Our Render Tree
  const sketchMap: DataStore<Sketch> = new Map();
  const modelMap: DataStore<Model> = new Map();
  // API
  return {
    // Sketch Functions
    Sketch: {

    },
    // Primitive Functions
    Primitive: {
      createCube: (scaleX: number, scaleY: number, scaleZ: number) => {
        // Create Model
        const model = createModel(scaleX, scaleY, scaleZ);
        // Add Cube
        model.modelParts.push(<ModelElmPrimCube>{
          modelType: ModelType.PrimCube
        });
        // Add To DataStore
        writeData(model.modelID, model, modelMap)
        // Return id
        return model.modelID;
      },
      createSphere: (scaleX: number, scaleY: number, scaleZ: number) => {
        // Create Model
        const model = createModel(scaleX, scaleY, scaleZ);
        // Add Cube
        model.modelParts.push(<ModelElmPrimSphere>{
          modelType: ModelType.PrimSphere
        });
        // Add To DataStore
        writeData(model.modelID, model, modelMap)
        // Return id
        return model.modelID;
      },
    },
    // Model Functions
    Model: {
      setPosition: (x: number, y: number, z: number, uid: number) => {
        const model = getModel(uid, modelMap);
        model.posX = x;
        model.posY = y;
        model.posZ = z;
        writeData(model.modelID, model, modelMap);
      },
      setScale: (scaleX: number, scaleY: number, scaleZ: number, uid: number) => {
        const model = getModel(uid, modelMap);
        model.scaleX = scaleX;
        model.scaleY = scaleY;
        model.scaleZ = scaleZ;
        writeData(model.modelID, model, modelMap);
      },
      addChild: (childUID: number, uid: number) => {
        const model = getModel(uid, modelMap);
        // Ensure child exists
        const child = getModel(childUID, modelMap);
        model.modelParts.push(<ModelElmRef>{
          modelType: ModelType.ModelRef,
          refID: child.modelID,
        });
        writeData(model.modelID, model, modelMap);
      }
      // TODO: Consider an add scene to add models to the export list and render list instead of rendering each individually
    },
    // Viewport Functions
    // TODO: Consider just rendering everything at the end and removing this
    // TODO: render from model
    Viewport: {
      render: () => {
        const scene = buildScene(modelMap);
        console.log(scene);
        // Instantiate a loader
        // TODO: Do not instantiate this every time
        const loader = new GLTFLoader();
        // TODO: look into draco loader I think it might be faster but lets figure out the advantage
        loader.parse(JSON.stringify(scene), './', (gltf) => {
          setScene((oldScene) => {
            return [...oldScene, gltf.scene]
          })
        }, (err) => {
          console.log(err);
        })
      },
      renderModel: (modelID: number) => {
        const modelMaterial = new THREE.MeshLambertMaterial({
          color: 0x6ed3cf
        });
        const model = getModel(modelID, modelMap);
        // Create Parent Model
        const sceneModel = new THREE.Object3D();
        sceneModel.position.set(model.posX, model.posY, model.posZ);
        sceneModel.scale.set(model.scaleX, model.scaleY, model.scaleZ);
        // Render The Model Tree
        for (const modelElm of model.modelParts) {
          switch (modelElm.modelType) {
            case ModelType.PrimCube:
              // TODO: handle material
              // TODO: This needs improvement
              // TODO: Consider Using this from a pool for better instancing
              const cubeGeometry = new THREE.BoxGeometry(1,1,1);
              console.log(cubeGeometry);
              const cube = new THREE.Mesh(cubeGeometry, modelMaterial); 
              sceneModel.add(cube);
              break;
            case ModelType.PrimSphere:
              // TODO: handle material
              // TODO: Consider Using this from a pool for better instancing
              // TODO: Autosize this based on scale
              const sphereGeometry = new THREE.SphereBufferGeometry(1, 100, 100);
              const sphere = new THREE.Mesh(sphereGeometry, modelMaterial); 
              sceneModel.add(sphere);
              break;
            case ModelType.ModelRef:
              // TODO: handle this
              break;
            default:
              throw new Error('Error: Invalid Model Type At renderModel');
          }
        }
        // Render to scene
        setScene((oldScene: THREE.Object3D[]) => {
          return [...oldScene, sceneModel]
        })
      },
    }
  }
}