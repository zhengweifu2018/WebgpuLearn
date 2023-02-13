import { CVertexBuffer } from "../../Render/Buffer";
import { CBufferLayout, CBufferElement, EShaderDataType } from "../../Render/BufferLayout";
import { WebGPUApi } from "./WebGPUApi";
import { CPipelineStateObject } from "../../Render/PipelineStateObject";
import { CShader } from "../../Render/Shader";

const ShaderDataTypeToGPUVertexFormat = (shaderDataType: EShaderDataType) : GPUVertexFormat | null => {
    switch(shaderDataType) {
        case EShaderDataType.Float:     return "float32";
        case EShaderDataType.Float2:    return "float32x2";
        case EShaderDataType.Float3:    return "float32x3";
        case EShaderDataType.Float4:    return "float32x4";
        case EShaderDataType.Int:       return "uint32";
        case EShaderDataType.Int2:      return "uint32x2";
        case EShaderDataType.Int3:      return "uint32x3";
        case EShaderDataType.Int4:      return "uint32x4";
        default:                        return null;
    }
}

export class WebGPUPipelineStateObject extends CPipelineStateObject {
    constructor(vertexBuffer: CVertexBuffer, vShader: CShader, pShader: CShader) {
        super();

        this.m_RenderPipeline = WebGPUApi.Instance.Device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: WebGPUApi.Instance.Device.createShaderModule({
                    code: vShader.Source
                }),
                entryPoint: vShader.EntryPoint,
                buffers: [this.CreateBufferLayout(vertexBuffer.Layout)]
            },
            fragment: {
                module: WebGPUApi.Instance.Device.createShaderModule({
                    code: pShader.Source
                }),
                entryPoint: pShader.EntryPoint,
                targets: [{
                    format: WebGPUApi.Instance.Format
                }]
            },
            primitive: {
                topology: "triangle-list"
            }
        });
    }

    get RenderPipeline(): any {
        return this.m_RenderPipeline;
    }

    private CreateBufferLayout(bufferLayout: CBufferLayout) : GPUVertexBufferLayout
    {
        let attributes: Array<GPUVertexAttribute> = [];
        let elementIndex: number = 0;
        for(let element of bufferLayout.BufferElements)
        {
            const attribute: GPUVertexAttribute = {
                shaderLocation: elementIndex,
                format: ShaderDataTypeToGPUVertexFormat(element.ShaderDataType),
                offset: element.Offset
            } as GPUVertexAttribute;
            attributes.push(attribute);
            elementIndex++;
        }
        
        let layout: GPUVertexBufferLayout = {arrayStride : bufferLayout.Stride, attributes: attributes} as GPUVertexBufferLayout;

        return layout;
    }

    private m_RenderPipeline: GPURenderPipeline;
}