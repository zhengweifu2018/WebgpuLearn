import { ETextureFormat, ETextureViewDimension, ELoadOp, EStoreOp, ETextureDimension } from "./DataTypes";
import { vec4 } from "gl-matrix";

abstract class IBuffer {
}

export abstract class IVertexBuffer extends IBuffer {
    abstract Bind() : void;
    abstract Unbind() : void; 
    abstract get Buffer() : any;
}

export abstract class IIndexBuffer extends IBuffer {
    abstract Bind() : void;
    abstract Unbind() : void;
    abstract get Buffer() : any;
    abstract get Count() : number; 
}


///////////////////////////////////////////////////////////////
// TextureExtent
///////////////////////////////////////////////////////////////
export interface TextureExtent {
    Width: number;
    Height: number;
    Depth: number;
}

///////////////////////////////////////////////////////////////
// Texture
///////////////////////////////////////////////////////////////
export interface CTextureDesc {
    Extent: TextureExtent
    Format: ETextureFormat;
    Dimension: ETextureDimension;
    MipLevelCount: number; //default value = 1;
    SampleCount: number; //default value = 1;
}

export abstract class ITexture {
    private m_Descriptor: CTextureDesc;

    constructor(desc: CTextureDesc) {
        this.m_Descriptor = desc;
    }

    get Descriptor() {
        return this.m_Descriptor;
    }
}

///////////////////////////////////////////////////////////////
// TextureView
///////////////////////////////////////////////////////////////
export interface CTextureViewDesc {
    Extent: TextureExtent
    Format: ETextureFormat;
    Dimension: ETextureViewDimension;
    BaseMipLevel: number;
    MipLevelCount: number;
    BaseArrayLayer: number;
    ArrayLayerCount: number;
}

export abstract class ITextureView {
    private m_Descriptor: CTextureViewDesc;

    constructor(desc: CTextureViewDesc) {
        this.m_Descriptor = desc;
    }

    get Descriptor() {
        return this.m_Descriptor;
    }
}


///////////////////////////////////////////////////////////////
// FrameBuffer 
///////////////////////////////////////////////////////////////
export interface CFrameColorAttachmentDesc {
    TextureView?: ITextureView; // default value = undefined, WebGPU use context.getCurrentTexture().createView();
    ClearColor: vec4;
    LoadOp: ELoadOp;
    StoreOp: EStoreOp;
}

export interface CFrameDepthStencilAttachmentDesc {
    TextureView: ITextureView;
    DepthClearValue: number;
    DepthLoadOp: ELoadOp;
    DepthStoreOp: EStoreOp;
    DepthReadOnly: boolean;

    StencilClearValue: number;
    StencilLoadOp: ELoadOp;
    StencilStoreOp: EStoreOp;
    StencilReadOnly: boolean;
}

export interface CFrameBufferDesc {
    ColorAttachments?: Array<CFrameColorAttachmentDesc>; // default value = undefine
    DepthAttachment: CFrameDepthStencilAttachmentDesc;
}

export abstract class IFrameBuffer {
    protected m_FrameBufferDesc: CFrameBufferDesc;

    constructor(desc: CFrameBufferDesc) {
        this.m_FrameBufferDesc = desc;
    }

    get FrameBufferDesc() {
        return this.m_FrameBufferDesc;
    }
}