import { CRenderer } from "./render/Renderer";
import { CMesh } from "./scene/Mesh";
import { CCamera } from "./camera/Camera";
import { CGeometry } from "./scene/Geometry";
import { CMaterial } from "./scene/Material";

export const Draw = async (canvasName: string) => { 
    let renderer: CRenderer = new CRenderer(canvasName);
    await renderer.initGpu();

    let meshes: CMesh[] = new Array();

    let geo: CGeometry = new CGeometry();

    geo.vertexData.push(
        -1, -1, 1,
        1, -1, 1,
        1, 1, 1,
        -1, 1, 1,
        -1, -1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, 1, -1
    );
    geo.indexData.push(
        // front
        0, 1, 2, 2, 3, 0,

        // right
        1, 5, 6, 6, 2, 1,

        // back
        4, 7, 6, 6, 5, 4,

        // left
        0, 3, 7, 7, 4, 0,

        // top
        3, 2, 6, 6, 7, 3,

        // bottom
        0, 4, 5, 5, 1, 0
    );

    let mat: CMaterial = new CMaterial();

    let mesh: CMesh = new CMesh(geo, mat);

    meshes.push(mesh);

    let camera: CCamera = new CCamera();

    renderer.draw(meshes, camera);
    
}