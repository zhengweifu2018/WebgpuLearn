import { CGeometry } from "./Geometry";
import { CMaterial } from "./Material";
import { CObject } from "./Object";

export class CMesh extends CObject { 
    geometry: CGeometry;
    material: CMaterial;

    constructor(geometry: CGeometry, material: CMaterial) { 
        super();
        this.geometry = geometry;
        this.material = material;
    }

    public createPSO(
        device: GPUDevice,
        textureFormat: GPUTextureFormat
    ): GPURenderPipeline { 
        const pipeline: GPURenderPipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: this.geometry.createVertexState(device),
            fragment: this.material.createFragmentState(device, textureFormat),
            primitive: {
                topology: "triangle-list"
            },
            depthStencil:{ // 深度模板
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            }
        });
        return pipeline;
    }

    public createBuffer(device: GPUDevice) :GPUBuffer {
        const modelBuffer : GPUBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(modelBuffer, 0, this.worldMatrix as ArrayBuffer);

        return modelBuffer;
     }

    public setBuffers(renderPass: GPURenderPassEncoder) { 
        this.geometry.setBuffers(renderPass);
    }

    public draw(renderPass: GPURenderPassEncoder) { 
        renderPass.drawIndexed(this.geometry.getIndexCount(), 1, 0, 0, 0);
    }
}