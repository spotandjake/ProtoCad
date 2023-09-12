import { type Dispatch, type SetStateAction } from 'react'
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
// Types
type DataStore<T> = Map<number, T>;
// TODO: Check Against Maps to verify no overlap, consider tagging models with 1 bit so we can better inform users of errors
const genUID = (): number => crypto.getRandomValues(new Uint16Array(1))[0];
const getModel = (modelID: number, modelStore: DataStore<THREE.Mesh>): THREE.Mesh => {
  const model = modelStore.get(modelID);
  if (model == undefined) throw new Error('Error: Invalid Model Reference');
  return model;
}
// The main interface
export default (setScene: Dispatch<SetStateAction<THREE.Object3D[]>>) => {
  // Clear Scene
  setScene([]);
  // Our Render Tree
  const objectStore: DataStore<THREE.Mesh> = new Map();
  // Create Our Instanced Geometry an Mats
  const cubeGeometry = new THREE.BoxGeometry(1,1,1);
  // TODO: Look into autoscaling the number of sides
  const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);

  const baseMat = new THREE.MeshLambertMaterial({
    color: 0x6ed3cf,
    emissive: 0x072534
  });
  // API
  return {
    // Primitive Functions
    Primitive: {
      createCube: () => {
        const modelID = genUID();
        // Create Our Cube
        const cube = new THREE.Mesh(cubeGeometry, baseMat);
        // Add Our Cube To Store
        objectStore.set(modelID, cube);
        // Return UID
        return modelID;
      },
      createSphere: () => {
        const modelID = genUID();
        // Create Our Sphere
        const sphere = new THREE.Mesh(sphereGeometry, baseMat);
        // Add Our Sphere To Store
        objectStore.set(modelID, sphere);
        // Return UID
        return modelID;
      }
    },
    // Model Functions
    Model: {
      // Create
      // createModel: () => {
      //   const modelID = genUID();
      //   // Create Our Model
      //   const model = new THREE.Object3D();
      //   // Add Our Model To Store
      //   objectStore.set(modelID, model);
      //   // Return UID
      //   return modelID;
      // },
      // Transformations
      setPosition: (x: number, y: number, z: number, id: number) => {
        const model = getModel(id, objectStore);
        model.position.set(x,y,z);
      },
      setScale: (x: number, y: number, z: number, id: number) => {
        const model = getModel(id, objectStore);
        model.scale.set(x,y,z);
      },
      setRotation: (x: number, y: number, z: number, id: number) => {
        const model = getModel(id, objectStore);
        // TODO: Consider If we want rot in degrees or radians
        model.rotation.set(x,y,z);
      },
      // Boolean Operations
      join: (model1: number, model2: number) => {
        // Merge Model 1 and 2
        const model1Obj = getModel(model1, objectStore);
        const model2Obj = getModel(model2, objectStore);
        // Merge Models
        model1Obj.updateMatrix();
        model2Obj.updateMatrix();
        const newModel = CSG.union(model1Obj, model2Obj);
        // Replace Old Model
        objectStore.set(model1, newModel);
      },
      subtract: (model1: number, model2: number) => {
        // Merge Model 1 and 2
        const model1Obj = getModel(model1, objectStore);
        const model2Obj = getModel(model2, objectStore);
        // Merge Models
        model1Obj.updateMatrix();
        model2Obj.updateMatrix();
        const newModel = CSG.subtract(model1Obj, model2Obj);
        // Replace Old Model
        objectStore.set(model1, newModel);
      },
      intersect: (model1: number, model2: number) => {
        // Merge Model 1 and 2
        const model1Obj = getModel(model1, objectStore);
        const model2Obj = getModel(model2, objectStore);
        // Merge Models
        model1Obj.updateMatrix();
        model2Obj.updateMatrix();
        const newModel = CSG.intersect(model1Obj, model2Obj);
       // Replace Old Model
       objectStore.set(model1, newModel);
      },
      // Remove
      removeModel: (id: number) => {
        objectStore.delete(id);
      }
    },
    // Viewport Functions
    Viewport: {
      // TODO: Replace Model.remove with Viewport.remove and Viewport.add, we will probably need a secondary dataStore for this
      render: () => {
        setScene([...objectStore.values()])
      }
    }
  }
}