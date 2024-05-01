# ProtoCad
TODO: Write a description here
# Backend API
TODO: Write a description here


# Design 2.0 Documentation
The goal of v2 is to provide a more portable and open implementation that allows for any operation to be performed the suggestion for this is we create a standardized tree to implement this, as I don't want to handle all the polygon calculations myself I might look into basing the tree on this [CSG Library](https://www.npmjs.com/package/csg), or rewriting this. The operations I'm thinking are.

It might make sense to build this library and tree in a webassembly model or component of it's own that way this work is portable and can be reused by other platforms. It also might make sense to have the sdk output a bytecode of instructions that the library runs, which helps with further portability, and then it could return the model as a gltf or step file. Another benefit of the bytecode approach is it allows an implementing language to just malloc a buffer, and return a pointer and length which we can just read the contents of from memory, helping to keep the host interface simple.

For v2, I also want to move away from three.js as it has a specific rendering interface and we are not using the three.js scene setup it makes sense to just do things myself this also helps with portability. I also want to design this program in a semi functional way, where things are built on top of each other to help further separation. 

The advantages of cad as code, is that your model is parametric by default in a much more concise and predictable way then traditional 3d modelling, The other advantage is being a bytecode, we could theoretically reduce the size of the model for transport. Another advantage is as the engine is based on a bytecode we could better guarantee consistency across platforms.

- Viewport
  - renderBody
  - renderSketch
  - exportObject : (Do we want this done through code, how does our scene relate to the renderer, if not?)
- Object (Base type of sketches, Body, Construction, sketch Component)
  - setPosition
  - setRotation
  - setScale
- Body
  - setPosition
  - setRotation
  - setScale
  - createCube
  - createCylinder
  - createSphere
  - createModel: (This would be used to import external files into the system)
  - subtract
  - intersect
  - join
  - splitAtPlane
  - split (If you were to do a subtraction right through the center you would end up with a body that holds multiple unconnected bodys, the split function will let you split these into seperate bodys). (Need some predictable way to describe each body, maybe the solution is any function which subtracts or intersects returns multiple bodies, would still need some sort of predictable ordering system, alterantively maybe we add a Model type).
- Construction
  - setPosition
  - setRotation
  - setScale
  - createPlane
- Sketch
  - addCircle : (radius?, sketch) -> Sketch Component Reference
  - addSquare : (radius?, sketch) -> Sketch Component Reference
  - addLine : (radius?, sketch) -> Sketch Component Reference
  - addPoint : (radius?, sketch) -> Sketch Component Reference
- Sketch Component
  - mirror
  - trim
  - extend
- Sketch & Sketch Component
  - setPosition: (x, y, z) -> sketch
  - setRotation: (x, y, z, sketch) -> sketch
  - setScale: (x, y, z, sketch) -> sketch
  - loft: (sketch, sketch) -> Body
  - extrude: (sketch, distance) -> Body
  - sweep: (sketch, sketchComponent(PathLike)) -> Body