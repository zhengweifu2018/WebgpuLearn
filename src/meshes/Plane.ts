import { CGeometryBuffer } from './GeometryBuffer';

export let PlaneGeometry =  new CGeometryBuffer();

PlaneGeometry.Positions = new Float32Array([
  -100, 20, -100, 
   100, 20,  100, 
  -100, 20,  100, 
   100, 20, -100
]);

PlaneGeometry.Normals = new Float32Array([
   0, 1, 0, 
   0, 1, 0, 
   0, 1, 0, 
   0, 1, 0
]);

PlaneGeometry.Triangles = new Uint32Array([
    0, 2, 1,
    0, 1, 3
]);

PlaneGeometry.UVs = new Float32Array([
  0, 0,
  1, 1, 
  0, 1, 
  1, 0
]);