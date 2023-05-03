import dragonRawData from 'stanford-dragon/3';
import { CGeometryBuffer } from './GeometryBuffer';

export let DragonGeometry =  new CGeometryBuffer();

DragonGeometry.Positions = new Float32Array(dragonRawData.positions.length * 3);
for(let pi = 0, i = 0; i < DragonGeometry.Positions.length; pi ++, i += 3)
{
    DragonGeometry.Positions[i+0] = dragonRawData.positions[pi][0];
    DragonGeometry.Positions[i+1] = dragonRawData.positions[pi][1];
    DragonGeometry.Positions[i+2] = dragonRawData.positions[pi][2];
}

DragonGeometry.Triangles = new Uint32Array(dragonRawData.cells.length * 3);
for(let fi = 0, i = 0; i < DragonGeometry.Triangles.length; fi ++, i += 3)
{
    DragonGeometry.Triangles[i+0] = dragonRawData.cells[fi][0];
    DragonGeometry.Triangles[i+1] = dragonRawData.cells[fi][1];
    DragonGeometry.Triangles[i+2] = dragonRawData.cells[fi][2];
}

DragonGeometry.ComputeNormals();
DragonGeometry.ComputeProjectedPlaneUVs('xy');