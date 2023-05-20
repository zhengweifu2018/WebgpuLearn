import { DragonGeometry } from "../../meshes/DtanfordDragon"
import { PlaneGeometry } from "../../meshes/Plane"

import { CMesh } from "../../meshes/Mesh";
import { DirectionalLight, Renderer } from "./Renderer";
import { vec3 } from "gl-matrix";

export const SimpleDirectionalLightRenderer = async (canvasName: string) => {
    const meshes : Array<CMesh> = [{
        Geometry: DragonGeometry,
        Position: vec3.fromValues(0, 0, 0),
        Rotation: vec3.fromValues(0, 0, 0),
        Scale: vec3.fromValues(1, 1, 1)
    }, {
        Geometry: PlaneGeometry,
        Position: vec3.fromValues(0, 0, 0),
        Rotation: vec3.fromValues(0, 0, 0),
        Scale: vec3.fromValues(1, 1, 1)
    }];

    const light : DirectionalLight = {
        Position : vec3.fromValues(200, 200, 200),
        Target : vec3.fromValues(0, 0, 0),
        Color : vec3.fromValues(1, 1, 0),
        ShadowMapSize : 1024,
        ShadowRadius : 200,
        ShadowDistance: 3000,
        ShadowBias: 0.0007
    }

    const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
    const renderer = new Renderer(canvas);
    await renderer.initGPU();
    renderer.render(meshes, light);
}