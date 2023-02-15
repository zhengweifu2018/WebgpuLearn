import { IRendererApi } from "../../Render/RendererApi";
import { WebGPUApi } from "./WebGPUApi";
import { EGraphicsAPI } from "../../Render/DataTypes";

export class WebGPURendererApi extends IRendererApi {
    constructor(api: EGraphicsAPI) {
        super(api);
    }
    
    async Init(canvasName: string) {
        await WebGPUApi.Instance.InitGPU(canvasName);
    }
}