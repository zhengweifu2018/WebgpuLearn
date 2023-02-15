import { 
    GPUBlendOperationFrom,
    GPUBlendFactorFrom,
    GPUPrimitiveTopologyFrom,
    GPUFrontFaceFrom,
    GPUCullModeFrom,
    GPUCompareFunctionFrom,
    GPUStencilOperationFrom,
    GPUVertexFormatFrom,
    GPUTextureFormatFrom
} from "./WebGPUDataTypesConverter";

import { CBufferLayout } from "../../Render/BufferLayout";
import { WebGPUApi } from "./WebGPUApi";
import { CGraphicsPipelineDesc, IGraphicsPipeline } from "../../Render/GraphicsPipeline";

export class WebGPUGraphicsPipeline extends IGraphicsPipeline {
    constructor(desc: CGraphicsPipelineDesc) {
        super();
        this.m_GraphicsPipelineDesc = desc;

        this.m_RenderPipeline = WebGPUApi.Instance.Device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: WebGPUApi.Instance.Device.createShaderModule({
                    code: desc.VertexShader.Source
                }),
                entryPoint: desc.VertexShader.EntryPoint,
                buffers: [this.CreateBufferLayout(desc.Layout)]
            },
            fragment: {
                module: WebGPUApi.Instance.Device.createShaderModule({
                    code: desc.FragmentShader.Source
                }),
                entryPoint: desc.FragmentShader.EntryPoint,
                targets: this.GetRenderTargets()
            },
            primitive: {
                topology: GPUPrimitiveTopologyFrom(desc.PrimitiveTopology),
                //stripIndexFormat: desc.RenderState.RasterState.
                frontFace: GPUFrontFaceFrom(desc.RenderState.RasterState.FrontFace),
                cullMode: GPUCullModeFrom(desc.RenderState.RasterState.CullMode)
            },
            depthStencil: {
                format: GPUTextureFormatFrom(desc.RenderState.DepthStencilState.Format),
                depthWriteEnabled: desc.RenderState.DepthStencilState.DepthTestEnable,
                depthCompare: GPUCompareFunctionFrom(desc.RenderState.DepthStencilState.DepthFunc),
                // stencilFront: {
                //     compare: GPUCompareFunctionFrom(desc.RenderState.DepthStencilState.FrontFaceStencil.StencilFunc),
                //     failOp: GPUStencilOperationFrom(desc.RenderState.DepthStencilState.FrontFaceStencil.FailOp),
                //     depthFailOp: GPUStencilOperationFrom(desc.RenderState.DepthStencilState.FrontFaceStencil.DepthFailOp),
                //     passOp: GPUStencilOperationFrom(desc.RenderState.DepthStencilState.FrontFaceStencil.PassOp)
                // },
                // stencilBack: {
                //     compare: GPUCompareFunctionFrom(desc.RenderState.DepthStencilState.BackFaceStencil.StencilFunc),
                //     failOp: GPUStencilOperationFrom(desc.RenderState.DepthStencilState.BackFaceStencil.FailOp),
                //     depthFailOp: GPUStencilOperationFrom(desc.RenderState.DepthStencilState.BackFaceStencil.DepthFailOp),
                //     passOp: GPUStencilOperationFrom(desc.RenderState.DepthStencilState.BackFaceStencil.PassOp)
                // }
            }
        });
    }

    get RenderPipeline(): any {
        return this.m_RenderPipeline;
    }

    private GetRenderTargets(): Array<GPUColorTargetState | null> {
        let renderTargets: Array<GPUColorTargetState> = [];
        for(const rt of this.m_GraphicsPipelineDesc.RenderState.RenderTargets)
        {
            const renderTarget: GPUColorTargetState = {
                format: GPUTextureFormatFrom(rt.Format),
                writeMask: rt.ColorWriteMask,
                blend: {
                    color: {
                        operation: GPUBlendOperationFrom(rt.BlendState.BlendOp),
                        srcFactor: GPUBlendFactorFrom(rt.BlendState.SrcBlend),
                        dstFactor: GPUBlendFactorFrom(rt.BlendState.DestBlend)
                    },
                    alpha: {
                        operation: GPUBlendOperationFrom(rt.BlendState.BlendOpAlpha),
                        srcFactor: GPUBlendFactorFrom(rt.BlendState.SrcBlendAlpha),
                        dstFactor: GPUBlendFactorFrom(rt.BlendState.DestBlendAlpha)
                    }
                }
            };
            renderTargets.push(renderTarget);
        }
        return renderTargets;
    }

    private CreateBufferLayout(bufferLayout: CBufferLayout) : GPUVertexBufferLayout
    {
        let attributes: Array<GPUVertexAttribute> = [];
        let elementIndex: number = 0;
        for(let element of bufferLayout.BufferElements)
        {
            const attribute: GPUVertexAttribute = {
                shaderLocation: elementIndex,
                format: GPUVertexFormatFrom(element.ShaderDataType),
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