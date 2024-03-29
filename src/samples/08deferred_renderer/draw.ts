import { InitGPU, CreateVertexBuffer, CreateIndexBuffer } from "../common";
import { DragonGeometry } from "../../meshes/DtanfordDragon"
import { PlaneGeometry } from "../../meshes/Plane"
import { mat4, vec3 } from "gl-matrix";
import Stats from "stats.js";

const createCamera = require("3d-view-controls");

import commonVertexShader from "./common_vertex.wgsl?raw";
import gBufferFragmentShader from "./gbuffer_fragment.wgsl?raw";
import quadVertexShader from "./quad_vertex.wgsl?raw";
import deferredFragmentShader from "./deferred_fragment.wgsl?raw";

// 设置实例的个数
const NUM_INSTANCES = 1;

const GMeshes = [{
    geo: DragonGeometry, 
    position: {x:0, y:0, z:0}, 
    rotation: {x:0, y:0, z:0}, 
    scale: {x:1, y:1, z:1}
}, {
    geo: PlaneGeometry, 
    position: {x:0, y:0, z:0}, 
    rotation: {x:0, y:0, z:0}, 
    scale: {x:1, y:1, z:1}
}];

interface RenderObject {
    VertexBuffer: GPUBuffer;
    IndexBuffer: GPUBuffer;
    WorldMatrix: mat4;
    RenderPipeline: GPURenderPipeline;
}

const CreateRenderObjects = (device: GPUDevice) : Array<RenderObject> => {
    let RenderObjects: Array<RenderObject> = [];
    for(let i = 0; i < GMeshes.length; i++) {
        const mesh = GMeshes[i];

        const indexBuffer: GPUBuffer = CreateIndexBuffer(device, mesh.geo.Triangles, GPUBufferUsage.INDEX);
        const vertexBuffer: GPUBuffer = CreateVertexBuffer(device, mesh.geo.GetBufferArray(), GPUBufferUsage.VERTEX);
        const renderPipeline: GPURenderPipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: device.createShaderModule({
                    code: commonVertexShader
                }),
                entryPoint: "main",
                buffers: [{
                    arrayStride: mesh.geo.GetNumStrides(),
                    attributes: mesh.geo.GetAttributes() as GPUVertexAttribute[]
                }]
            },
            fragment: {
                module: device.createShaderModule({
                    code: gBufferFragmentShader
                }),
                entryPoint: "main",
                targets: [{
                    format: "bgra8unorm" // albedo
                }, {
                    format: "rgba32float" // position
                }, {
                    format: "rgba16float" // normal
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
        });

        // 模型矩阵
        const worldMatrix: mat4 = mat4.create();

        // 更新模型矩阵
        mat4.translate(worldMatrix, worldMatrix, vec3.fromValues(mesh.position.x, mesh.position.y, mesh.position.z));
        mat4.rotateX(worldMatrix, worldMatrix, mesh.rotation.x);
        mat4.rotateY(worldMatrix, worldMatrix, mesh.rotation.y);
        mat4.rotateZ(worldMatrix, worldMatrix, mesh.rotation.z);
        mat4.scale(worldMatrix, worldMatrix, vec3.fromValues(mesh.scale.x, mesh.scale.y, mesh.scale.z));

        RenderObjects.push({
            VertexBuffer: vertexBuffer,
            IndexBuffer: indexBuffer,
            WorldMatrix: worldMatrix,
            RenderPipeline: renderPipeline
        });
    }
    return RenderObjects;
}

// 创建 GBuffer Texture
const CreateGBufferTexture = (device: GPUDevice, width: number, height: number) => {
    const albedoTexture = device.createTexture({
        size: [width, height, 1],
        format: "bgra8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    const positionTexture = device.createTexture({
        size: [width, height, 1],
        format: "rgba32float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    const normalTexture = device.createTexture({
        size: [width, height, 1],
        format: "rgba16float",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    return { albedoTexture, positionTexture, normalTexture };
}

export const DeferredRenderer = async (canvasName: string) => { 
    const { device, context, size, format, canvas } = await InitGPU(canvasName);

    const renderObjects = CreateRenderObjects(device);

    // 创建相机
    let cameraRatio : number = size.width / size.height;
    const cameraFov : number = 2.0 * Math.PI / 5.0;
    const cameraNearClip : number = 0.1;
    const cameraFarClip: number = 1000.0;

    let camera = createCamera(canvas, {
        eye: [0, 200, 100],
        center: [0, 0, 0],
        zoomMax: 500
    });
    
    let depthTexture = device.createTexture({
        size: [size.width, size.height, 1],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    let depthView = depthTexture.createView();

    // 创建性能监视器
    const stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    // 相机矩阵
    let viewMatrix: mat4 = camera.matrix;

    // 视口缓冲区，包含 worldMatrix, viewMatrix, projectionMatrix
    const viewBuffer: GPUBuffer = device.createBuffer({
        size: 64 * 3,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    // 创建 GBuffer TextureView
    let { albedoTexture, positionTexture, normalTexture } = CreateGBufferTexture(device, size.width, size.height);
    let albedoTextureView = albedoTexture.createView();
    let positionTextureView = positionTexture.createView();
    let normalTextureView = normalTexture.createView();

    // 创建 GBufferTextures 绑定组布局
    const gBufferTexturesBindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {
                sampleType: 'unfilterable-float',
            }
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {
                sampleType: 'unfilterable-float',
            },
        }, {
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {
                sampleType: 'unfilterable-float',
            }
        }],
    });

    // 创建 DeferredRenderer 渲染管线
    const deferredRenderPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [
                gBufferTexturesBindGroupLayout,
            ]
        }),
        vertex: {
            module: device.createShaderModule({
                code: quadVertexShader,
            }),
            entryPoint: 'main'
        },
        fragment: {
            module: device.createShaderModule({
                code: deferredFragmentShader,
            }),
            entryPoint: 'main',
            targets: [{
                format: format
            }],
            constants: {
                CanvasWidth: size.width,
                CanvasHeight: size.height,
            },
        },
        primitive: {
            topology: "triangle-list",
            cullMode: "back"
        },
    });
    
    function renderLoop() {
        stats.begin();

        // 投影矩阵
        let projectionMatrix: mat4 = mat4.create();
        mat4.perspective(projectionMatrix, cameraFov, cameraRatio, cameraNearClip, cameraFarClip);

        if(camera.tick()) {
            viewMatrix = camera.matrix;
        }

        const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();

        { // gbuffer rendering
            const gbufferPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: albedoTextureView,
                    clearValue: {
                        r: 0, g: 0, b: 0.0, a: 1.0
                    },
                    loadOp: 'clear',
                    storeOp: 'store'
                }, {
                    view: positionTextureView,
                    clearValue: {
                        r: Number.MAX_VALUE, g: Number.MAX_VALUE, b: Number.MAX_VALUE, a: 1.0
                    },
                    loadOp: 'clear',
                    storeOp: 'store'
                }, {
                    view: normalTextureView,
                    clearValue: {
                        r: 0, g: 0, b: 1.0, a: 1.0
                    },
                    loadOp: 'clear',
                    storeOp: 'store'
                }],
                depthStencilAttachment: {
                    view: depthView,
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: "store"
                }
            };
            // 创建 GBuffer RenderPass
            const gbufferPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(gbufferPassDescriptor);
            
            const viewBufferValues = new Float32Array(viewBuffer.size / 4);
            
            for (let i = 0; i < renderObjects.length; i++)
            {
                const renderObject = renderObjects[i]; 
                
                // 更新视口缓冲区数据
                viewBufferValues.set(renderObject.WorldMatrix as Float32Array, 0*16);
                viewBufferValues.set(viewMatrix as Float32Array, 1*16);
                viewBufferValues.set(projectionMatrix as Float32Array, 2*16);

                const renderObjectMatrixBindGroup: GPUBindGroup = device.createBindGroup({
                    layout: renderObject.RenderPipeline.getBindGroupLayout(0),
                    entries: [{
                        binding: 0,
                        resource: {
                            buffer: viewBuffer,
                            offset: 0,
                            size: viewBuffer.size
                        }
                    }]
                });
                
                // 视口缓冲区数据 传给 gpu
                device.queue.writeBuffer(viewBuffer, 0, viewBufferValues);
                
                gbufferPass.setPipeline(renderObject.RenderPipeline);
    
                gbufferPass.setVertexBuffer(0, renderObject.VertexBuffer);
                
                // 设置IndexBuffer到RenderPass中
                gbufferPass.setIndexBuffer(renderObject.IndexBuffer, "uint32");
    
                gbufferPass.setBindGroup(0, renderObjectMatrixBindGroup);
    
                gbufferPass.drawIndexed(renderObject.IndexBuffer.size / 4, NUM_INSTANCES, 0, 0, 0);
            }
            gbufferPass.end();
        }
        // 创建 GBufferTextures 绑定组
        const gBufferTexturesBindGroup = device.createBindGroup({
            layout: gBufferTexturesBindGroupLayout,
            entries: [{
                binding: 0,
                resource: albedoTextureView
            }, {
                binding: 1,
                resource: positionTextureView
            }, {
                binding: 2,
                resource: normalTextureView
            }]
        });

        { // light rendering
            // todo ...    
        }
    
        { // deferred rendering
            const textureQuadPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: context.getCurrentTexture().createView(),
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            };
            const deferredPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(textureQuadPassDescriptor);
            deferredPass.setPipeline(deferredRenderPipeline);
            deferredPass.setBindGroup(0, gBufferTexturesBindGroup);
            deferredPass.draw(6);
            deferredPass.end();
        }
    
        device.queue.submit([commandEncoder.finish()]);        

        stats.end();
        requestAnimationFrame(renderLoop);
    }

    renderLoop();

    window.addEventListener('resize', () => { 
        //if(canvas.width === size.width && canvas.height === size.height) return;

        size.width = canvas.width = canvas.clientWidth * devicePixelRatio;
        size.height = canvas.height = canvas.clientHeight * devicePixelRatio;
        
        cameraRatio = size.width / size.height;

        albedoTexture.destroy();
        positionTexture.destroy();
        normalTexture.destroy();
        const gbufferTextures = CreateGBufferTexture(device, size.width, size.height);
        albedoTexture = gbufferTextures.albedoTexture;
        positionTexture = gbufferTextures.positionTexture;
        normalTexture = gbufferTextures.normalTexture;
        albedoTextureView = albedoTexture.createView();
        positionTextureView = positionTexture.createView();
        normalTextureView = normalTexture.createView();
 
        depthTexture.destroy();
        depthTexture = device.createTexture({
            size: [size.width, size.height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        depthView = depthTexture.createView();
    });
}