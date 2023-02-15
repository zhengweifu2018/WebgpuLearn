
import { WebGPUApi } from "./WebGPUApi"
import { ICommandList } from "../../Render/CommandList"
import { IRenderPass } from "../../Render/RenderPass"
import { IFrameBuffer } from "../../Render/Buffer";
import { WebGPURenderPass } from "./WebGPURenderPass";


export class WebGPUCommandList extends ICommandList {
    private m_CommandEncoder: GPUCommandEncoder;   
 
    constructor() {
        super();
        this.m_CommandEncoder = WebGPUApi.Instance.Device.createCommandEncoder();
    }

    Open(): void {
    }
    
    Close(): void {
        
    }

    CreateRenderPass(frameBuffer: IFrameBuffer) : IRenderPass {
        let renderPass = new WebGPURenderPass(this.m_CommandEncoder, frameBuffer);
        return renderPass;
    }

    Submit(): void {
        WebGPUApi.Instance.Device.queue.submit([this.m_CommandEncoder.finish()]);
    }
}