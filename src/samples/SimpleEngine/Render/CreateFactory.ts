import { WebGPURendererApi } from "../Platform/WebGPU/WebGPURendererApi";
import { IRendererApi } from "./RendererApi";
import { EGraphicsAPI } from "./DataTypes";

export namespace CreateFactory {
    let m_RenderApi : IRendererApi | null = null;

    export const GetRendererApi = () => {
        if(m_RenderApi === null) {
            m_RenderApi = new WebGPURendererApi(EGraphicsAPI.WEBGPU);
        }
        return m_RenderApi;
    }
}