import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
// Enums
enum Axis {
  ZX = 0,
  YZ = 1,
  XY = 2
}
// Sketch Types
enum SketchType {
  Line,
}
interface SketchLine {
  sketchType: SketchType.Line,
  start: THREE.Vector2,
  end: THREE.Vector2,
}
type SketchElement = SketchLine;
interface SketchData {
  sketchAxis: Axis;
  sketchDepth: number;
  elements: number[]; // TODO: Remove use of this
  sketchData: SketchElement[];
}
// Helpers
const generateID = () => crypto.getRandomValues(new Uint16Array(1))[0];
const getSketch = (sketchID: number, sketchMap: Map<number, SketchData>): SketchData => {
  const sketch = sketchMap.get(sketchID);
  if (sketch == undefined) throw new Error('Error: Invalid Sketch Reference');
  return sketch;
}
const getModel = (modelID: number, modelMap: Map<number, number[]>): number[] => {
  const model = modelMap.get(modelID);
  if (model == undefined) throw new Error('Error: Invalid Model Reference');
  return model;
}
const getObject = (objectID: number, objectMap: Map<number, THREE.Object3D>): THREE.Object3D => {
  const obj = objectMap.get(objectID);
  if (obj == undefined) throw new Error('Error: Invalid Object Reference');
  return obj;
}
// Sketch Vector Helpers
const getAxis = (axisIndex: number): Axis => {
  // Ensure Axis is within axis
  if (!Object.values(Axis).includes(axisIndex)) throw new Error('Error: Invalid Axis');
  // Cast The Axis
  return <Axis>axisIndex;
}
const getVectorAxis = (axis: Axis, vec: THREE.Vector2, axisDepth: number): THREE.Vector3 => {
  // Map The Number Based On The Axis
  if (axis == Axis.YZ) {
    return new THREE.Vector3(axisDepth, vec.x, vec.y);
  } else if (axis == Axis.ZX) {
    return new THREE.Vector3(vec.y, axisDepth, vec.x);
  } else {
    return new THREE.Vector3(vec.x, vec.y, axisDepth);
  }
}
// Config
const sketchLineMaterial = new MeshLineMaterial({
	color: new THREE.Color(0, 0, 0),
  sizeAttenuation: true,
  lineWidth: 0.075
});
// TODO: Customizable material
const modelMaterial = new THREE.MeshBasicMaterial( {color: new THREE.Color(0, 1, 0)} );
// Create Api Instance
export default (setScene) => {
  // Name Maps
  const sketchName = new Map<string, number>();
  const modelName = new Map<string, number>();
  // Global Stores
  const sketchData = new Map<number, SketchData>();
  const modelData = new Map<number, number[]>();
  const objectMap = new Map<number, THREE.Object3D>();
  // API
  return {
    // This is the api for building Sketches
    Sketch: {
      // TODO: We cannot accept, a string as the name so we need to figure out a way to define this
      createSketch: (name: string, axisIndex: number, axisDepth: number): number => {
        // Ensure Sketch Does Not Already Exist
        if (sketchName.has(name)) throw new Error(`Error: Sketch By Name ${name} Already Exists`);
        // Generate Sketch ID
        const sketchID = generateID();
        // Store In Maps
        sketchName.set(name, sketchID);
        sketchData.set(sketchID, {
          sketchAxis: getAxis(axisIndex),
          sketchDepth: axisDepth,
          elements: [], // TODO: Remove use of this
          sketchData: [], // TODO: Design Sketch Data
        });
        // Return Sketch ID
        return sketchID;
      },
      createLine: (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        sketchID: number
      ): number => {
        // Get Sketch
        const sketch = getSketch(sketchID, sketchData);
        // Map The Vectors
        const vec1 = getVectorAxis(sketch.sketchAxis, new THREE.Vector2(x1, y1), sketch.sketchDepth);
        const vec2 = getVectorAxis(sketch.sketchAxis, new THREE.Vector2(x2, y2), sketch.sketchDepth);
        // Build The Line
        const geometry = new THREE.BufferGeometry().setFromPoints([
          vec1,
          vec2,
        ]);
        const linePath = new MeshLine();
        linePath.setGeometry(geometry);
        const line = new THREE.Mesh(linePath, sketchLineMaterial);
        // Add The Sketch To Maps
        const objectID = generateID();
        objectMap.set(objectID, line);
        sketch.elements.push(objectID);
        // Return object ID
        return objectID;
      }
    },
    // This is the api for building Models
    Model: {
      // TODO: We cannot accept, a string as the name so we need to figure out a way to define this
      createModel: (name: string): number => {
        // Ensure Sketch Does Not Already Exist
        if (modelName.has(name)) throw new Error(`Error: Model By Name ${name} Already Exists`);
        // Generate Sketch ID
        const modelID = generateID();
        // Store In Maps
        modelName.set(name, modelID);
        modelData.set(modelID, []);
        // Return Sketch ID
        return modelID;
      },
      createCube: (
        x: number,
        y: number,
        z: number,
        modelID: number
      ): number => {
        // Get Model
        const model = getModel(modelID, modelData);
        // Build The Line
        const geometry = new THREE.BoxGeometry(x,y,z);
        const cube = new THREE.Mesh( geometry, modelMaterial ); 
        // Add The Model To Maps
        const objectID = generateID();
        objectMap.set(objectID, cube);
        model.push(objectID);
        // Return object ID
        return objectID;
      },
    },
    // This is the api for Modifying Objects
    Object: {
      setPosition: (x: number, y: number, z: number, objectID: number): void => {
        // Get The Object
        const obj = getObject(objectID, objectMap);
        // Set The Position
        obj.position.set(x, y, z);
      },
      setScale: (x: number, y: number, z: number, objectID: number): void => {
        // Get The Object
        const obj = getObject(objectID, objectMap);
        // Set The Position
        obj.scale.set(x, y, z);
      }
    },
    // ViewPort NameSpace
    ViewPort: {
      render: (): void => {
        // TODO: Render The Sketches Individually if they are added to the viewport
        // TODO: Render The Models Individually if they are added to the viewport
        // Add To The Scene
        setScene((oldScene: THREE.Object3D[]) => [
          ...objectMap.values()
        ]);
      }
    }
  }
}