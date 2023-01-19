import { CGeometryComponent, CMaterialComponent, CTransformComponent } from "./Game/Component";
import { CScene } from "./Game/Scene";
import { CreateFactory } from "./Render/CreateFactory";
import { CRendererApi } from "./Render/RendererApi";

export const Test = async (canvaseName: string) => {
    let scene = new CScene();
    let entity = scene.CreateEnitity();

    let transfrom = new CTransformComponent();
    let geometry = new CGeometryComponent();
    let material = new CMaterialComponent();

    entity.AddComponent(transfrom, geometry, material);
    
    const rendererApi : CRendererApi = CreateFactory.GetRendererApi();
    await rendererApi.Init(canvaseName);
}