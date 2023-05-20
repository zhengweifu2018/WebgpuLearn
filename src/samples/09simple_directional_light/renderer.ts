import { CMesh } from "../../meshes/Mesh";

const createCamera = require("3d-view-controls");

import mainShader from "./shaders/main.wgsl?raw";
import shadowShader from "./shaders/shadow.wgsl?raw";

import { vec3, mat4 } from "gl-matrix";

import Stats from "stats.js";

interface RenderObject {
    VertexBuffer: GPUBuffer;
    IndexBuffer: GPUBuffer;
    WorldMatrix: mat4;
}

interface PerspectiveCamera {
    Ratio: number;
    Fov: number;
    Near: number;
    Far: number;
    Position: vec3;
    Target: vec3;
}

class ViewData { // 视口缓冲区，包含 viewMatrix, projectionMatrix
    public ViewMatrix: mat4 = mat4.create();
    public ProjectionMatrix: mat4 = mat4.create();

    private getLength() : number {
        return this.ViewMatrix.length + this.ProjectionMatrix.length;
    }

    public GetSize() : number {
        return this.getLength() * 4;
    }

    public GetData() : Float32Array {
        let data = new Float32Array(this.getLength());
        data.set(this.ViewMatrix as Float32Array, 0);
        data.set(this.ProjectionMatrix as Float32Array, this.ViewMatrix.length);
        return data;
    }
}

class LightData {
    public ViewProjectionMatrix: mat4 = mat4.create();
    public Position: vec3 = vec3.create();
    public Target: vec3 = vec3.create();
    public Color: vec3 = vec3.create();
    public ShadowBias: number = 0;
    public ShadowSamples: number = 1;

    private getLength() : number {
        return this.ViewProjectionMatrix.length 
            + this.Position.length 
            + this.Target.length 
            + this.Color.length 
            + 3;
    }

    public GetSize() : number {
        return this.getLength() * 4;
    }

    public GetData() : Float32Array {
        let data = new Float32Array(this.getLength());
        let offset = 0;
        data.set(this.ViewProjectionMatrix as Float32Array, 0);
        
        offset += this.ViewProjectionMatrix.length;
        data.set(this.Position as Float32Array, offset);
        
        offset += this.Position.length;
        data.set(this.Target as Float32Array, offset);
        
        offset += this.Target.length;
        data.set(this.Color as Float32Array, offset);

        offset += this.Color.length;
        data[offset] = this.ShadowBias;

        offset += 1;
        data[offset] = this.ShadowSamples;

        return data;
    }
}

export interface DirectionalLight {
    Position: vec3;
    Target: vec3;
    Color: vec3;
    ShadowMapSize: number;
    ShadowRadius: number;
    ShadowDistance: number;
    ShadowBias: number;
    ShadowSamples: number; // 值为 1, 2, 4, 9, 16
}

export class Renderer {
    private m_canvas: HTMLCanvasElement;
    private m_context: GPUCanvasContext;
    private m_adapter: GPUAdapter;
    private m_device: GPUDevice;
    private m_format: GPUTextureFormat;
    private m_width: number;
    private m_height: number;

    private m_meshes: Array<CMesh> = [];
    private m_renderObjects: Array<RenderObject> = [];
    private m_meshMatrixBuffer : GPUBuffer;

    private m_directionalLight: DirectionalLight;
    private m_lightData: LightData;
    private m_lightBuffer : GPUBuffer;

    private m_camera : PerspectiveCamera;
    private m_cameraController: any;
    private m_viewData : ViewData; 
    private m_viewBuffer : GPUBuffer;


    private m_shadowDepthTexture: GPUTexture;
    private m_shadowDepthTextureView: GPUTextureView;
    private m_mainDepthTexture: GPUTexture;

    private m_shadowBindGroupLayout: GPUBindGroupLayout;
    private m_mainBindGroupLayout: GPUBindGroupLayout;
    private m_shadowBindGroup: GPUBindGroup;
    private m_mainBindGroup: GPUBindGroup;
    private m_shadowRenderPipelines: Array<GPURenderPipeline> = [];
    private m_mainRenderPipelines: Array<GPURenderPipeline> = [];

    private m_stats: Stats;
    
    constructor(canvas: HTMLCanvasElement) {
        this.m_canvas = canvas;
    }

    public async initGPU() {
        this.m_adapter = await navigator.gpu.requestAdapter({powerPreference:"high-performance"}) as GPUAdapter;
        this.m_device = await this.m_adapter.requestDevice() as GPUDevice;
        this.m_context = this.m_canvas.getContext('webgpu') as unknown as GPUCanvasContext;
    
        const devicePixelRatio = window.devicePixelRatio || 1;
        this.m_width = this.m_canvas.clientWidth * devicePixelRatio;
        this.m_height = this.m_canvas.clientHeight * devicePixelRatio;
        this.m_canvas.width = this.m_width;
        this.m_canvas.height = this.m_height;
        this.m_format = navigator.gpu.getPreferredCanvasFormat();
        this.m_context.configure({
            device: this.m_device,
            format: this.m_format,
            alphaMode: 'opaque'
        });
    }

    // 创建相机
    private MakeCamera() {
        // 创建相机
        this.m_camera = {
            Ratio: this.m_width / this.m_height,
            Fov: 2.0 * Math.PI / 5.0,
            Near: 0.1,
            Far: 10000.0,
            Position : vec3.fromValues(0, 200, 100),
            Target: vec3.fromValues(0, 0, 0),
        };
        
        this.m_cameraController = createCamera(this.m_canvas, {
            eye: this.m_camera.Position,
            center: this.m_camera.Target,
            zoomMax: 500
        });

        this.m_viewData = new ViewData();
        this.UpdateCamera();
    }

    // 更新相机矩阵
    private UpdateCamera() {
        if(this.m_cameraController) {
            this.m_viewData.ViewMatrix = this.m_cameraController.matrix;
        }

        mat4.perspective(
            this.m_viewData.ProjectionMatrix, 
            this.m_camera.Fov, 
            this.m_camera.Ratio, 
            this.m_camera.Near, 
            this.m_camera.Far);
    }

    private MakeLightData() {
        this.m_lightData = new LightData();
        this.UpdateLightData()
    }

    private UpdateLightData() {
        this.m_lightData.Position = this.m_directionalLight.Position;
        this.m_lightData.Target = this.m_directionalLight.Target;
        this.m_lightData.Color = this.m_directionalLight.Color;
        this.m_lightData.ShadowBias = this.m_directionalLight.ShadowBias;
        this.m_lightData.ShadowSamples = this.m_directionalLight.ShadowSamples;
        const upVector: vec3 = vec3.fromValues(0,1,0);
        let lightViewMatrix = mat4.create();

        // gl-matrix mat4.lookAt 得到的是 WorldToCameraMatrix, 这里就不需要再进行反转相机矩阵了。
        mat4.lookAt(lightViewMatrix, this.m_lightData.Position, this.m_lightData.Target, upVector);
        
        const lightProjectionMatrix = mat4.create();
        {
            const shadowDistance = this.m_directionalLight.ShadowRadius;
            const left = -shadowDistance;
            const right = shadowDistance;
            const bottom = -shadowDistance;
            const top = shadowDistance;
            const near = 0;
            const far = this.m_directionalLight.ShadowDistance;
            mat4.orthoZO(lightProjectionMatrix, left, right, bottom, top, near, far);
        }
        
        mat4.multiply(this.m_lightData.ViewProjectionMatrix, lightProjectionMatrix, lightViewMatrix);
    }

    // 创建视图缓冲区
    private MakeViewBuffer() {
        this.m_viewBuffer = this.m_device.createBuffer({
            size: this.m_viewData.GetSize(),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    // 更新视图缓冲区
    private UpdateViewBuffer() {
        if(!this.m_viewBuffer) {
            this.MakeViewBuffer();
        }
        this.m_device.queue.writeBuffer(this.m_viewBuffer, 0, this.m_viewData.GetData());
    }

    // 创建模型uniform缓冲区
    private MakeMeshUniformBuffer() {
        this.m_meshMatrixBuffer = this.m_device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    // 更新模型uniform缓冲区
    private UpdateMeshUniformBuffer(data: Float32Array) {
        if(!this.m_meshMatrixBuffer) {
            this.MakeMeshUniformBuffer();
        }
        this.m_device.queue.writeBuffer(this.m_meshMatrixBuffer, 0, data);
    }

    // 创建灯光uniform缓冲区
    private MakeLightUniformBuffer() {
        this.m_lightBuffer = this.m_device.createBuffer({
            size: this.m_lightData.GetSize(),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    // 更新模型uniform缓冲区
    private UpdateLightUniformBuffer() {
        if(!this.m_lightBuffer) {
            this.MakeLightUniformBuffer();
        }
        this.m_device.queue.writeBuffer(this.m_lightBuffer, 0, this.m_lightData.GetData());
    }

    // 创建性能监视器
    private MakeStats() {
        this.m_stats = new Stats();
        this.m_stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.m_stats.dom );     
    }

    // 开始性能测试
    private BeginStats() {
        if(this.m_stats) {
            this.m_stats.begin();
        }
    }

    // 结束性能测试
    private EndStats() {
        if(this.m_stats) {
            this.m_stats.end();
        }
    }

    // 创建GPU Vertex Buffer
    private createVertexBuffer(
        device: GPUDevice,
        data: Float32Array,
        usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST){ 
        const buffer = device.createBuffer({
            size: data.byteLength,
            usage: usageFlag,
            mappedAtCreation: true,
        });
        new Float32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }

    // 创建GPU Index Buffer
    private createIndexBuffer(
        device: GPUDevice,
        data: Uint32Array,
        usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST) { 
        const buffer = device.createBuffer({
            size: data.byteLength,
            usage: usageFlag,
            mappedAtCreation: true,
        });
        new Uint32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }

    private createTextures(bIncludeShadow: boolean = true, bIncludeMain: boolean = true) {
        if(bIncludeShadow) {
            this.m_shadowDepthTexture = this.m_device.createTexture({
                size: [this.m_directionalLight.ShadowMapSize, this.m_directionalLight.ShadowMapSize, 1],
                format: "depth32float",
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            });

            this.m_shadowDepthTextureView = this.m_shadowDepthTexture.createView();
        }
        if(bIncludeMain) {
            this.m_mainDepthTexture = this.m_device.createTexture({
                size: [this.m_width, this.m_height, 1],
                format: "depth24plus",
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING 
            });
        }
    }

    private createRenderObjects() {
        for(let i = 0; i < this.m_meshes.length; i++) {
            const mesh = this.m_meshes[i];
            const indexBuffer: GPUBuffer = this.createIndexBuffer(this.m_device, mesh.Geometry.Triangles, GPUBufferUsage.INDEX);
            const vertexBuffer: GPUBuffer = this.createVertexBuffer(this.m_device, mesh.Geometry.GetBufferArray(), GPUBufferUsage.VERTEX);
    
            // 模型矩阵
            const worldMatrix: mat4 = mat4.create();
    
            // 更新模型矩阵
            mat4.translate(worldMatrix, worldMatrix, mesh.Position);
            mat4.rotateX(worldMatrix, worldMatrix, mesh.Rotation[0]);
            mat4.rotateY(worldMatrix, worldMatrix, mesh.Rotation[1]);
            mat4.rotateZ(worldMatrix, worldMatrix, mesh.Rotation[2]);
            mat4.scale(worldMatrix, worldMatrix, mesh.Scale);
    
            this.m_renderObjects.push({
                VertexBuffer: vertexBuffer,
                IndexBuffer: indexBuffer,
                WorldMatrix: worldMatrix
            });
        }
    }

    private makeBindGroupLayouts() {
        this.m_shadowBindGroupLayout = this.m_device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform"
                }
            }, {
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform"
                }
            }]
        });

        this.m_mainBindGroupLayout = this.m_device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform"
                }
            }, {
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform"
                }
            }, {
                binding: 2,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            }, {
                binding: 3,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                texture: {
                    sampleType: "depth"
                }
            }, {
                binding: 4,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "comparison"
                }
            }]
        });
    }
    private makeBindGroups() {
        this.m_shadowBindGroup = this.m_device.createBindGroup({
            layout: this.m_shadowBindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.m_meshMatrixBuffer
                }
            }, {
                binding: 1,
                resource: {
                    buffer: this.m_lightBuffer
                }
            }]
        });

        this.m_mainBindGroup = this.m_device.createBindGroup({
            layout: this.m_mainBindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.m_viewBuffer
                }
            }, {
                binding: 1,
                resource: {
                    buffer: this.m_meshMatrixBuffer
                }
            }, {
                binding: 2,
                resource: {
                    buffer: this.m_lightBuffer
                }
            }, {
                binding: 3,
                resource: this.m_shadowDepthTextureView
            }, {
                binding: 4,
                resource: this.m_device.createSampler({
                    compare: "less"
                })
            }]
        });
    }
    
    private makePipelines() {
        const numMeshes: number = this.m_meshes.length;
        for(let i = 0; i < numMeshes; i++) {
            const shadowPipelineLayout = this.m_device.createPipelineLayout({
                bindGroupLayouts: [this.m_shadowBindGroupLayout]
            });
            // create shadow pso
            this.m_shadowRenderPipelines.push(this.m_device.createRenderPipeline({
                layout: shadowPipelineLayout,
                vertex: {
                    module: this.m_device.createShaderModule({
                        code: shadowShader
                    }),
                    entryPoint: "vs_main",
                    buffers: [{
                        arrayStride: this.m_meshes[i].Geometry.GetNumStrides(),
                        attributes: this.m_meshes[i].Geometry.GetAttributes() as GPUVertexAttribute[]
                    }]
                },
                // // shadow debug begin
                // fragment: {
                //     module: this.m_device.createShaderModule({
                //         code: shadowShader
                //     }),
                //     entryPoint: "fs_main",
                //     targets: [{
                //         format: this.m_format
                //     }]
                // },
                // // shadow debug end
                primitive: {
                    topology: "triangle-list",
                    cullMode: "back"
                },
                depthStencil:{ // 深度模板
                    format: "depth32float",
                    depthWriteEnabled: true,
                    depthCompare: "less"
                }
            }));

            const mainPipelineLayout = this.m_device.createPipelineLayout({
                bindGroupLayouts: [this.m_mainBindGroupLayout]
            });
            // create mian pso
            this.m_mainRenderPipelines.push(this.m_device.createRenderPipeline({
                layout: mainPipelineLayout,
                vertex: {
                    module: this.m_device.createShaderModule({
                        code: mainShader
                    }),
                    entryPoint: "vs_main",
                    buffers: [{
                        arrayStride: this.m_meshes[i].Geometry.GetNumStrides(),
                        attributes: this.m_meshes[i].Geometry.GetAttributes() as GPUVertexAttribute[]
                    }]
                },
                fragment: {
                    module: this.m_device.createShaderModule({
                        code: mainShader
                    }),
                    entryPoint: "fs_main",
                    targets: [{
                        format: this.m_format
                    }]
                },
                primitive: {
                    topology: "triangle-list",
                    cullMode: "back"
                },
                depthStencil:{ // 深度模板
                    format: "depth24plus",
                    depthWriteEnabled: true,
                    depthCompare: "less"
                }
            }));
        }
    }

    private renderInternal() {
        this.BeginStats();
        
        this.UpdateCamera();

        this.UpdateViewBuffer();

        // this.UpdateLightUniformBuffer();

        const commandEncoder : GPUCommandEncoder = this.m_device.createCommandEncoder();

        const numMeshes = this.m_meshes.length;
        // shadow pass
        {
            const shadowPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [],
                // // shadow debug begin
                // colorAttachments: [{
                //     view: this.m_context.getCurrentTexture().createView(),
                //     clearValue: { r: 0.3, g: 0.3, b: 0.7, a: 1.0 },
                //     loadOp: 'clear',
                //     storeOp: 'store',
                // }],
                // // shadow debug end
                depthStencilAttachment: {
                    view: this.m_shadowDepthTextureView,//this.m_shadowDepthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store'
                }
            };

            const shadowPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(shadowPassDescriptor);
            for(let i = 0; i < numMeshes; i++)
            {
                this.UpdateMeshUniformBuffer(this.m_renderObjects[i].WorldMatrix as Float32Array);

                shadowPass.setPipeline(this.m_shadowRenderPipelines[i]);
                shadowPass.setVertexBuffer(0, this.m_renderObjects[i].VertexBuffer);
                
                // 设置IndexBuffer到RenderPass中
                shadowPass.setIndexBuffer(this.m_renderObjects[i].IndexBuffer, "uint32");
    
                shadowPass.setBindGroup(0, this.m_shadowBindGroup);
    
                shadowPass.drawIndexed(this.m_renderObjects[i].IndexBuffer.size / 4, 1, 0, 0, 0);
            }
            shadowPass.end();
        }

        // main pass
        {
            const targetTexture = this.m_context.getCurrentTexture();
            const mainPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: targetTexture.createView(),
                    clearValue: { r: 0.3, g: 0.3, b: 0.7, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
                depthStencilAttachment: {
                    view: this.m_mainDepthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: "store"
                }
            };

            const mainPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(mainPassDescriptor);
            for(let i = 0; i < numMeshes; i++)
            {
                this.UpdateMeshUniformBuffer(this.m_renderObjects[i].WorldMatrix as Float32Array);

                mainPass.setPipeline(this.m_mainRenderPipelines[i]);
                mainPass.setVertexBuffer(0, this.m_renderObjects[i].VertexBuffer);
                
                // 设置IndexBuffer到RenderPass中
                mainPass.setIndexBuffer(this.m_renderObjects[i].IndexBuffer, "uint32");
    
                mainPass.setBindGroup(0, this.m_mainBindGroup);
    
                mainPass.drawIndexed(this.m_renderObjects[i].IndexBuffer.size / 4, 1, 0, 0, 0);
            }
            mainPass.end();
        }

        this.m_device.queue.submit([commandEncoder.finish()]);

        this.EndStats();
        requestAnimationFrame(this.renderInternal.bind(this));
    }

    public render(meshes: Array<CMesh>, light: DirectionalLight) {
        this.m_meshes = meshes;
        this.m_directionalLight = light;
        this.MakeStats();
        this.MakeCamera();
        this.MakeLightData()
        this.createRenderObjects();
        this.MakeViewBuffer();
        this.MakeMeshUniformBuffer();
        this.MakeLightUniformBuffer();
        this.createTextures();
        this.makeBindGroupLayouts();
        this.makeBindGroups();
        this.makePipelines();
        this.UpdateLightUniformBuffer();
        this.renderInternal();

        window.addEventListener('resize', () => {  
            const devicePixelRatio = window.devicePixelRatio || 1;
            const newWidth = this.m_canvas.clientWidth * devicePixelRatio;
            const newHeight= this.m_canvas.clientHeight * devicePixelRatio;
            if(this.m_width === newWidth && this.m_height === newHeight) return;
            this.m_width = this.m_canvas.width = newWidth
            this.m_height = this.m_canvas.height = newHeight;
            
            this.m_camera.Ratio = this.m_width / this.m_height;
            
            this.m_mainDepthTexture.destroy();
            this.createTextures(false, true);
        });
    }
}