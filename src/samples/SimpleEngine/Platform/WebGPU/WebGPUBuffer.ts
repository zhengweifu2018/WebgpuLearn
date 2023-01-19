import { WebGPUApi } from "./WebGPUApi"
import { CVertexBuffer, CIndexBuffer } from "../../Render/Buffer"

class WebGPUVextexBuffer extends CVertexBuffer {
    constructor() {
        super();
    }
    
    Bind() : void {

    }

    Unbind() : void {
        
    }

    Create(data: Uint32Array) : void {
        this.m_Buffer = WebGPUApi.Instance.Device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(this.m_Buffer.getMappedRange()).set(data);
        this.m_Buffer.unmap();
    }

    private m_Buffer : GPUBuffer;
}

class WebGPUIndexBuffer extends CIndexBuffer {
    constructor() {
        super();
    }

    Bind() : void {

    }

    Unbind() : void {
        
    }

    Create(data: Uint32Array) : void {
        this.m_Buffer = WebGPUApi.Instance.Device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(this.m_Buffer.getMappedRange()).set(data);
        this.m_Buffer.unmap();
    }

    get Count() : Number {
        return this.m_Count;
    }

    private m_Buffer : GPUBuffer;
    private m_Count : Number;
}

export { WebGPUVextexBuffer, WebGPUIndexBuffer }