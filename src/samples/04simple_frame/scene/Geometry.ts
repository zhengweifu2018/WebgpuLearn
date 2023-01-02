import VertexShader from "../shader/vertex_shader.wgsl";

export class CGeometry { 
    public vertexData: Array<number>;
    public normalData: Array<number>;
    public uvData: Array<number>;
    public indexData: Array<number>;

    private _vertexBuffer: { location: number, buffer: GPUBuffer | null};
    private _normalBuffer: { location: number, buffer: GPUBuffer | null};
    private _uvBuffer: { location: number, buffer: GPUBuffer | null};
    private _indexBuffer: GPUBuffer | null ;

    constructor() { 
        this.vertexData = new Array();
        this.normalData = new Array();
        this.uvData = new Array();
        this.indexData = new Array();

        this._vertexBuffer = { location: -1, buffer: null };
        this._normalBuffer = { location: -1, buffer: null };
        this._uvBuffer = { location: -1, buffer: null };
        this._indexBuffer = null;
    }

    private createVertexBuffer(
        device: GPUDevice,
        data: Float32Array,
        usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    ) : GPUBuffer { 
        const buffer = device.createBuffer({
            size: data.byteLength,
            usage: usageFlag,
            mappedAtCreation: true,
        });
        new Float32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }

    private createIndexBuffer(
        device: GPUDevice,
        data: Uint32Array,
        usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    ): GPUBuffer { 
        const buffer = device.createBuffer({
            size: data.byteLength,
            usage: usageFlag,
            mappedAtCreation: true,
        });
        new Uint32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }

    public createBuffers(device: GPUDevice) :Array<GPUVertexBufferLayout> {
        let bufferLayouts: Array<GPUVertexBufferLayout> = [];
        let location: number = -1;
        if (this.vertexData.length >= 3) {
            location++;
            this._vertexBuffer.location = location;
            this._vertexBuffer.buffer = this.createVertexBuffer(device, new Float32Array(this.vertexData));
            bufferLayouts.push({
                arrayStride: 12,
                attributes: [{ shaderLocation: location, format: "float32x3", offset: 0}]
            });
        } else { 
            throw Error("Data Error!");
        }

        if (this.normalData.length == this.vertexData.length) { 
            location++;
            this._normalBuffer.location = location;
            this._normalBuffer.buffer = this.createVertexBuffer(device, new Float32Array(this.normalData));
            bufferLayouts.push({
                arrayStride: 12,
                attributes: [{ shaderLocation: location, format: "float32x3", offset: 0}]
            });
        }

        if (this.uvData.length > 0) { 
            location++;
            this._uvBuffer.location = location;
            this._uvBuffer.buffer = this.createVertexBuffer(device, new Float32Array(this.uvData));
            bufferLayouts.push({
                arrayStride: 12,
                attributes: [{ shaderLocation: location, format: "float32x3", offset: 0}]
            });
        }

        if (this.indexData.length >= 3) { 
            this._indexBuffer = this.createIndexBuffer(device, new Uint32Array(this.indexData));
        }

        return bufferLayouts;
    }

    public createVertexState(device: GPUDevice) : GPUVertexState { 
        return {
            module: device.createShaderModule({
                code: VertexShader
            }),
            entryPoint: "main",
            buffers: this.createBuffers(device)
        } as GPUVertexState;
    }

    public setBuffers(renderPass: GPURenderPassEncoder) { 
        if (this._vertexBuffer.buffer) { 
            renderPass.setVertexBuffer(this._vertexBuffer.location, this._vertexBuffer.buffer);
        }

        if (this._normalBuffer.buffer) { 
            renderPass.setVertexBuffer(this._normalBuffer.location, this._normalBuffer.buffer);
        }

        if (this._uvBuffer.buffer) { 
            renderPass.setVertexBuffer(this._uvBuffer.location, this._uvBuffer.buffer);
        }

        if (this._indexBuffer) { 
            renderPass.setIndexBuffer(this._indexBuffer, "uint32");
        }
    }

    public getIndexCount(): number { 
        return this.indexData.length;
    }

}