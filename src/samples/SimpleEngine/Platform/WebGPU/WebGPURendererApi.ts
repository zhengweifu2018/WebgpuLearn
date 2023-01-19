import { CRendererApi } from "../../Render/RendererApi";
import { WebGPUApi } from "./WebGPUApi";
import { vec4 } from "gl-matrix";

export class WebGPURendererApi extends CRendererApi {
    async Init(canvasName: string) {
        await WebGPUApi.Instance.InitGPU(canvasName);
    }

    SetViewport(x : number, y : number, width: number, height: number) : void {

    }

    SetClearColor(color: vec4) : void {

    }
}