import { WebGPUFrameBuffer, WebGPUIndexBuffer, WebGPUTextureView, WebGPUVextexBuffer } from "../Platform/WebGPU/WebGPUBuffer";
import { WebGPUCommandList } from "../Platform/WebGPU/WebGPUCommandList";
import { WebGPUGraphicsPipeline } from "../Platform/WebGPU/WebGPUGraphicsPipeline";
import { WebGPUShader } from "../Platform/WebGPU/WebGPUShader";
import { CFrameBufferDesc, CTextureViewDesc, IFrameBuffer, IIndexBuffer, ITextureView, IVertexBuffer } from "./Buffer";
import { ICommandList } from "./CommandList";
import { EGraphicsAPI } from "./DataTypes";
import { CGraphicsPipelineDesc, IGraphicsPipeline } from "./GraphicsPipeline";
import { IShader, EShaderType } from "./Shader";

export abstract class IRendererApi {
    private s_Api: EGraphicsAPI;
    private m_Init: boolean = false;

    constructor(api: EGraphicsAPI)
    {
        this.s_Api = EGraphicsAPI.WEBGPU;
    }

    async Init(canvasName: string) {
        this.m_Init = true;
    }

    get API() {
        return this.s_Api;
    }

    CreateCommandList() : ICommandList {
        return new WebGPUCommandList();
    }

    CreateVertexBuffer(data: Float32Array) : IVertexBuffer {
        return new WebGPUVextexBuffer(data);
    }

    CreateIndexBuffer(data: Uint32Array, count: number) : IIndexBuffer {
        return new WebGPUIndexBuffer(data, count);
    }

    CreateShader(source: string, entryPoint: string, type: EShaderType): IShader {
        return new WebGPUShader(source, entryPoint, type);
    }

    CreateRenderPipeline(desc: CGraphicsPipelineDesc): IGraphicsPipeline {
        return new WebGPUGraphicsPipeline(desc);
    }

    CreateTextureView(desc: CTextureViewDesc) : ITextureView {
        return new WebGPUTextureView(desc)
    }

    CreateFrameBuffer(desc: CFrameBufferDesc) : IFrameBuffer {
        return new WebGPUFrameBuffer(desc);
    }
}
