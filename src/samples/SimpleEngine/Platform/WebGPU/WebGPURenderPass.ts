
import { WebGPUApi } from "./WebGPUApi"
import { IRenderPass } from "../../Render/RenderPass"
import { CDrawArguments, CDrawIndexedArguments } from "../../Render/DrawArguments"
import { CGraphicsState } from "../../Render/States/GraphicsState"
import { WebGPUGraphicsPipeline } from "./WebGPUGraphicsPipeline";
import { IFrameBuffer } from "../../Render/Buffer";
import { WebGPUFrameBuffer, WebGPUIndexBuffer, WebGPUVextexBuffer } from "./WebGPUBuffer";

export class WebGPURenderPass extends IRenderPass {
    private m_CommandEncoder: GPUCommandEncoder;
    private m_RenderPass: GPURenderPassEncoder;
    private bActivated: boolean = false;
    
    constructor(commandEncoder: GPUCommandEncoder, frameBuffer: IFrameBuffer) {
        super();
        this.m_CommandEncoder = commandEncoder;
        const gpuFrameBuffer: WebGPUFrameBuffer = frameBuffer as WebGPUFrameBuffer;
        this.m_RenderPass = this.m_CommandEncoder.beginRenderPass(gpuFrameBuffer.RenderPassDesc);
    }

    Begin(): void {
        if(!this.bActivated)
        {
            this.bActivated = true;
        }
    }

    End(): void {
        if(this.bActivated)
        {
            this.m_RenderPass.end();
            this.bActivated = false;
        }
    }

    SetGraphicsState(state: CGraphicsState): void {
        const pipeline: WebGPUGraphicsPipeline = state.GraphicsPipeline as WebGPUGraphicsPipeline;
        this.m_RenderPass.setPipeline(pipeline.RenderPipeline);

        const vertexBuffer = state.VertexBuffer as WebGPUVextexBuffer;
        this.m_RenderPass.setVertexBuffer(0, vertexBuffer.Buffer);

        const indexBuffer = state.IndexBuffer as WebGPUIndexBuffer;
        this.m_RenderPass.setIndexBuffer(indexBuffer.Buffer, "uint32");

        this.m_GraphicsState = state;
    }
    
    Draw(drawArguments: CDrawArguments): void {
        //this.m_RenderPass.draw();
    }
    
    DrawIndexed(drawArguments: CDrawIndexedArguments): void {
        this.m_RenderPass.drawIndexed(
            drawArguments.IndexCount, 
            drawArguments.InstanceCount,
            drawArguments.FirstIndex, 
            drawArguments.BaseVertex,
            drawArguments.InstanceCount);
    }
}