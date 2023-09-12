import { Canvas, useThree } from "@react-three/fiber";
import Grid from './ViewerModels/Grid';
import Orientation from './ViewerModels/Orientation';
import styles from './styles/Viewer.module.scss'
import Controls from './ViewerModels/Controls';
import { OrbitControls } from '@react-three/drei';
import { Color } from 'three';
import Scene from './ViewerModels/Scene';
import { useRef, type MutableRefObject } from 'react';
interface Props {
  scene: any[];
}
export default (props: Props) => {
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  return (
    <section className={styles.container}>
      <Canvas
        ref={canvasRef}
        shadows={true}
        className={styles.canvas}
        camera={{
          position: [-6, 7, 7],
          far: 10000
        }}
      >
        <ambientLight color={"white"} intensity={0.5} />
        <Scene scene={props.scene} />
        <Grid color={new Color(10, 10, 10)} />
        <Orientation/>
        <OrbitControls />
        <Controls CanvasRef={canvasRef}/>
      </Canvas>
    </section>
  )
}