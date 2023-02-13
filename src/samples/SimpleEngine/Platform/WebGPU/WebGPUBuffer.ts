import { WebGPUApi } from "./WebGPUApi"
import { CVertexBuffer, CIndexBuffer, CTextureBuffer } from "../../Render/Buffer"

class WebGPUVextexBuffer extends CVertexBuffer {
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

class WebGPUIndexBuffer extends CIndexBuffer {
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

class WebGPUTextureBuffer extends CTextureBuffer {
    constructor() {
        super();
    }

    Bind() : void {

    }

    Unbind() : void {
        
    }

    private m_Buffer : GPUBuffer;
}

export { WebGPUVextexBuffer, WebGPUIndexBuffer, WebGPUTextureBuffer }