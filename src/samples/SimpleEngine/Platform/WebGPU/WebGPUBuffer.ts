import { WebGPUApi } from "./WebGPUApi"
import { IVertexBuffer, IIndexBuffer, ITexture, IFrameBuffer, CFrameBufferDesc, CTextureDesc, ITextureView, CTextureViewDesc } from "../../Render/Buffer"
import { GPULoadOpFrom, GPUStoreOpFrom, GPUTextureFormatFrom } from "./WebGPUDataTypesConverter";
import { ELoadOp, EStoreOp } from "../../Render/DataTypes";

export class WebGPUVextexBuffer extends IVertexBuffer {
    constructor(data: Float32Array) {
        super();
        this.m_Buffer = WebGPUApi.Instance.Device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.m_Buffer.getMappedRange()).set(data);
        this.m_Buffer.unmap();
    }
    
    Bind() : void {

    }

    Unbind() : void {
        
    }

    get Buffer() : GPUBuffer {
        return this.m_Buffer;
    }

    private m_Buffer : GPUBuffer;
}

export class WebGPUIndexBuffer extends IIndexBuffer {
    constructor(data: Uint32Array, count: number) {
        super();
        this.m_Buffer = WebGPUApi.Instance.Device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(this.m_Buffer.getMappedRange()).set(data);
        this.m_Buffer.unmap();

        this.m_Count = count;
    }

    Bind() : void {

    }

    Unbind() : void {
        
    }

    get Buffer() : GPUBuffer {
        return this.m_Buffer;
    }

    get Count() : number {
        return this.m_Count;
    }

    private m_Buffer : GPUBuffer;
    private m_Count : number;
}

///////////////////////////////////////////////////////////////
// WebGPUTexture 
///////////////////////////////////////////////////////////////
export class WebGPUTexture extends ITexture {
    private m_Texture : GPUTexture;
    
    constructor(desc: CTextureDesc) {
        super(desc);
        this.m_Texture = WebGPUApi.Instance.Device.createTexture({
            size: [desc.Extent.Width, desc.Extent.Height],
            format: GPUTextureFormatFrom(desc.Format),
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    }

    get Texture() {
        return this.m_Texture;
    }
}

///////////////////////////////////////////////////////////////
// WebGPUTextureView 
///////////////////////////////////////////////////////////////
export class WebGPUTextureView extends ITextureView {
    private m_TextureView : GPUTextureView;
    
    constructor(desc: CTextureViewDesc) {
        super(desc);

        //this.m_TextureView = ;
    }

    get TextureView() {
        return this.m_TextureView;
    }
}

///////////////////////////////////////////////////////////////
// WebGPUFrameBuffer 
///////////////////////////////////////////////////////////////
export class WebGPUFrameBuffer extends IFrameBuffer {
    private m_RenderPassDesc: GPURenderPassDescriptor;
    constructor(desc: CFrameBufferDesc) {
        super(desc);
        const textureViewDesc = desc.DepthAttachment.TextureView.Descriptor;
        const depthTexture: GPUTexture = WebGPUApi.Instance.Device.createTexture({
            size: [
                textureViewDesc.Extent.Width, 
                textureViewDesc.Extent.Height, 
                textureViewDesc.Extent.Depth
            ],
            format: GPUTextureFormatFrom(textureViewDesc.Format),
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        const depthTextureView: GPUTextureView = depthTexture.createView();

        this.m_RenderPassDesc = {
            colorAttachments: this.GetColorAttachments(),
            depthStencilAttachment: {
                view: depthTextureView,
                depthClearValue: desc.DepthAttachment.DepthClearValue,
                depthLoadOp: GPULoadOpFrom(desc.DepthAttachment.DepthLoadOp),
                depthStoreOp: GPUStoreOpFrom(desc.DepthAttachment.DepthStoreOp)
            }
        };
    }

    private GetColorAttachments() {
        if(this.m_FrameBufferDesc.ColorAttachments == undefined) {
            return [];
        } else {
            let attachments: Array<GPURenderPassColorAttachment> = [];
            for(const attachment of this.m_FrameBufferDesc.ColorAttachments) {
                let textureView: GPUTextureView;
                
                if(attachment.TextureView == undefined) {
                    textureView = WebGPUApi.Instance.Context.getCurrentTexture().createView();
                } else {
                    const texture: GPUTexture = WebGPUApi.Instance.Device.createTexture({
                        size: [
                            attachment.TextureView.Descriptor.Extent.Width, 
                            attachment.TextureView.Descriptor.Extent.Height,
                            attachment.TextureView.Descriptor.Extent.Depth
                        ],
                        format: GPUTextureFormatFrom(attachment.TextureView.Descriptor.Format),
                        usage: GPUTextureUsage.RENDER_ATTACHMENT
                    });
                    
                    textureView = texture.createView();
                }

                attachments.push({
                    view: textureView,
                    clearValue: {
                        r: attachment.ClearColor[0], 
                        g: attachment.ClearColor[1], 
                        b: attachment.ClearColor[2], 
                        a: attachment.ClearColor[3]
                    },
                    loadOp: GPULoadOpFrom(attachment.LoadOp),
                    storeOp: GPUStoreOpFrom(attachment.StoreOp)
                }); 
            }
            return attachments;
        }
    }

    get RenderPassDesc() {
        return this.m_RenderPassDesc;
    }
}