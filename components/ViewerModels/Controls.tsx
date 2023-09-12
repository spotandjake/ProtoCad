import { useRef, useEffect } from 'react';
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from 'three'

import { type MutableRefObject } from 'react';

interface Props {
  CanvasRef: MutableRefObject<HTMLCanvasElement | null>
}
export default ({ CanvasRef }: Props) => {
  const keys = useRef<{ [key: string]: boolean}>({});
  const { camera } = useThree()
  // TODO: Implement Controls, remove orbit controls, replace with a mix of first person and regular cad controls
  useEffect(() => {
    // Event Listener
    if (CanvasRef.current != null) {
      window.addEventListener('keydown', (event: KeyboardEvent) => keys.current[event.code] = true);
      window.addEventListener('keyup', (event: KeyboardEvent) => keys.current[event.code] = false);
    }
    // frame
  }, [CanvasRef]);
  useFrame((state, delta, xrFrame) => {
    const forward = keys.current['KeyW'] ? -0.25 : 0;
    const backward = keys.current['KeyS'] ? 0.25 : 0;
    const left = keys.current['KeyA'] ? -0.25 : 0;
    const right = keys.current['KeyD'] ? 0.25 : 0;
    state.camera.translateZ(forward + backward);
    state.camera.translateX(left + right);
  })
  // Return The Orientation Cube
  return (
    <></>
  )
}