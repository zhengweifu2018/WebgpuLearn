import { CMesh } from "../scene/Mesh";
import { CCamera } from "../camera/Camera";
import { render } from "react-dom";

export class CRenderer { 
    private _device: GPUDevice;
    private _adapter: GPUAdapter;
    private _canvas: HTMLCanvasElement;
    private _context: GPUCanvasContext;
    private _presentationSize: number[];
    private _presentationFormat: GPUTextureFormat;

    public constructor(canvasName: string) { 
        this._canvas = document.getElementById(canvasName) as HTMLCanvasElement;
    }

    public async initGpu() { 
        this._adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
        this._device = await this._adapter.requestDevice() as GPUDevice;
        this._context = this._canvas.getContext('webgpu') as unknown as GPUCanvasContext;

        const devicePixelRatio = window.devicePixelRatio || 1;
        this._presentationSize = [this._canvas.clientWidth * devicePixelRatio, this._canvas.clientHeight * devicePixelRatio];
        this._presentationFormat = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : this._context.getPreferredFormat(this._adapter);
        this._context.configure({
            device: this._device,
            format: this._presentationFormat,
            size: this._presentationSize
        });
    }

    public get device() :GPUDevice { 
        return this._device;
    }

    public get canvas() :HTMLCanvasElement { 
        return this._canvas;
    }

    public createRenderPass()
        : {renderPass: GPURenderPassEncoder, commandEncoder: GPUCommandEncoder} { 
        const depthTexture = this.device.createTexture({
            size: [this._presentationSize[0], this._presentationSize[1], 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();
        const textureView: GPUTextureView = this._context.getCurrentTexture().createView();
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: {
                    r: 0, g: 0, b: 0.5, a: 1.0
                },
                loadOp: 'clear',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthStoreOp: "store",
                stencilClearValue: 0,
                stencilStoreOp: "store"
            }
        };
        const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        
        return { renderPass, commandEncoder};
    }

    public draw(meshes: Array<CMesh>, camera: CCamera) { 
        let { renderPass, commandEncoder } = this.createRenderPass();
        meshes.forEach(mesh => {
            let pipeline: GPURenderPipeline = mesh.createPSO(this.device, this._presentationFormat);
            renderPass.setPipeline(pipeline);
            mesh.setBuffers(renderPass);
            mesh.draw(renderPass);
        });
        renderPass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }
}