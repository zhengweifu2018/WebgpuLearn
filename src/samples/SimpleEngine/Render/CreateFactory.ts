import { CVertexBuffer, CIndexBuffer } from "./Buffer";
import { WebGPUVextexBuffer, WebGPUIndexBuffer } from "../Platform/WebGPU/WebGPUBuffer";
import { WebGPURendererApi } from "../Platform/WebGPU/WebGPURendererApi";
import { CRendererApi } from "./RendererApi";
import { CShader, EShaderType } from "./Shader";
import { WebGPUShader } from "../Platform/WebGPU/WebGPUShader";
import { CPipelineStateObject } from "./PipelineStateObject";
import { WebGPUPipelineStateObject } from "../Platform/WebGPU/WebGPUPipelineStateObject";

export namespace CreateFactory {
    let m_RenderApi : CRendererApi | null = null;

    export const GetRendererApi = () => {
        if(m_RenderApi === null) {
            m_RenderApi = new WebGPURendererApi();
        }
        return m_RenderApi;
    }

    export const CreateVertexBuffer = (data: Float32Array) : CVertexBuffer => {
        return new WebGPUVextexBuffer(data);
    }

    export const CreateIndexBuffer = (data: Uint32Array, count: number) : CIndexBuffer => {
        return new WebGPUIndexBuffer(data, count);
    }

    export const CreateShader = (source: string, entryPoint: string, type: EShaderType): CShader => {
        return new WebGPUShader(source, entryPoint, type);
    }

    export const CreatePipelineStateObject = (vertexBuffer: CVertexBuffer, vShader: CShader, pShader: CShader): CPipelineStateObject => {
        return new WebGPUPipelineStateObject(vertexBuffer, vShader, pShader);
    } 
}