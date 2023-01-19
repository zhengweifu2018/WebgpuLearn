import { WebGPURendererApi } from "../Platform/WebGPU/WebGPURendererApi";
import { CRendererApi } from "./RendererApi";

export namespace CreateFactory {
    let m_RenderApi : CRendererApi | null = null;

    export const GetRendererApi = () => {
        if(m_RenderApi === null) {
            m_RenderApi = new WebGPURendererApi();
        }
        return m_RenderApi;
    }
}