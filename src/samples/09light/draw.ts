import { DragonGeometry } from "../../meshes/DtanfordDragon"
import { PlaneGeometry } from "../../meshes/Plane"

import { CMesh } from "../../meshes/Mesh";
import { DirectionalLight, Renderer } from "./Renderer";
import { vec3 } from "gl-matrix";

export const LightRenderer = async (canvasName: string) => {
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
        Position : vec3.fromValues(0, 50, 0),
        Target : vec3.fromValues(0, 0, 0),
        Color : vec3.fromValues(1, 1, 0),
        ShadowMapSize : 1024,
        ShadowNear: -200,
        ShadowFar: 500
    }

    const canvas = document.getElementById(canvasName) as HTMLCanvasElement;
    const renderer = new Renderer(canvas);
    await renderer.initGPU();
    renderer.render(meshes, light);
}