import { useEffect } from 'react';
import { useThree } from "@react-three/fiber";
import * as THREE from 'three'
export default (props) => {
  const { scene } = useThree();
  useEffect(() => {
    for (const element of props.scene) {
      element.renderOrder = 1;
      scene.add(element);
    }
    return () => {
      for (const element of props.scene) {
        scene.remove(element);
      }
    }
  }, [props.scene])
  // Return The Orientation Cube
  return (
    <></>
  )
}