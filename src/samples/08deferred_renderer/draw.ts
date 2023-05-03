import { InitGPU, CreateVertexBuffer, CreateIndexBuffer } from "../common";
import { DragonGeometry } from "../../meshes/DtanfordDragon"
import { PlaneGeometry } from "../../meshes/Plane"
import { mat4, vec3 } from "gl-matrix";
import Stats from "stats.js";

const createCamera = require("3d-view-controls");

import VertexShader from "./vertex_shader.wgsl?raw";
import FragmentShader from "./fragment_shader.wgsl?raw";

// 设置实例的个数
const NUM_INSTANCES = 1;

 const Meshes = [{
    geo: DragonGeometry, 
    position: {x:0, y:0, z:0}, 
    rotation: {x:0, y:0, z:0}, 
    scale: {x:1, y:1, z:1},
    fragmentShader: FragmentShader
}, {
    geo: PlaneGeometry, 
    position: {x:0, y:0, z:0}, 
    rotation: {x:0, y:0, z:0}, 
    scale: {x:1, y:1, z:1},
    fragmentShader: FragmentShader
}];

const Draws = (
    device: GPUDevice, 
    context: GPUCanvasContext, 
    textureView: GPUTextureView,
    depthView: GPUTextureView,
    viewProjectionMatrix: mat4,
    renderDatas: []
) => {
    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
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
            view: depthView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: "store"
        }
    };

    // 创建RenderPass
    const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    for (let i = 0; i < renderDatas.length; i++)
    {
        const { pipeline, vertexBuffer, indexBuffer, mvpBuffer, mvpBindGroup, modelMatrix } = renderDatas[i];

        // mvp矩阵
        let mvpMatrix: mat4 = mat4.create();
                    
        // 更新mvp矩阵
        mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);

        // mvp uniform buffer 传给 gpu
        device.queue.writeBuffer(mvpBuffer, 0, mvpMatrix as Float32Array);

        
        renderPass.setPipeline(pipeline);

        renderPass.setVertexBuffer(0, vertexBuffer);
        
        // 设置IndexBuffer到RenderPass中
        renderPass.setIndexBuffer(indexBuffer, "uint32");

        renderPass.setBindGroup(0, mvpBindGroup);

        renderPass.drawIndexed(indexBuffer.size / 4, NUM_INSTANCES, 0, 0, 0);
    }
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}

const CreateRenderDatas = (
    device: GPUDevice,
    format: GPUTextureFormat
) => {
    let renderDatas = [];
    for(let i = 0; i < Meshes.length; i++) {
        const mesh = Meshes[i];
        
        const vertexBuffer: GPUBuffer = CreateVertexBuffer(device, mesh.geo.GetBufferArray(), GPUBufferUsage.VERTEX);
        // console.log(mesh.geo.GetBufferArray());
        const pipeline: GPURenderPipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: device.createShaderModule({
                    code: VertexShader
                }),
                entryPoint: "main",
                buffers: [{
                    arrayStride: mesh.geo.GetNumStrides(),
                    attributes: mesh.geo.GetAttributes() as GPUVertexAttribute[]
                }]
            },
            fragment: {
                module: device.createShaderModule({
                    code: FragmentShader
                }),
                entryPoint: "main",
                targets: [{
                    format: format
                }]
            },
            primitive: {
                topology: "triangle-list"
            },
            depthStencil:{ // 深度模板
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            }
        });

        // 创建IndexBuffer并设置到RenderPass中
        const indexBuffer: GPUBuffer = CreateIndexBuffer(device, mesh.geo.Triangles, GPUBufferUsage.INDEX);

        // 模型矩阵
        const modelMatrix: mat4 = mat4.create();

        // 更新模型矩阵
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(mesh.position.x, mesh.position.y, mesh.position.z));
        mat4.rotateX(modelMatrix, modelMatrix, mesh.rotation.x);
        mat4.rotateY(modelMatrix, modelMatrix, mesh.rotation.y);
        mat4.rotateZ(modelMatrix, modelMatrix, mesh.rotation.z);
        mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(mesh.scale.x, mesh.scale.y, mesh.scale.z));

        const mvpBuffer: GPUBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const mvpBindGroup: GPUBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: mvpBuffer,
                    offset: 0,
                    size: 64
                }
            }]
        });

        renderDatas.push({vertexBuffer, indexBuffer, pipeline, mvpBuffer, mvpBindGroup, modelMatrix});
    }

    return renderDatas;
}

export const DeferredRenderer = async (canvasName: string) => { 
    const { device, context, size, format, canvas } = await InitGPU(canvasName);
  
    let renderDatas = CreateRenderDatas(device, format);

    // 创建相机
    let cameraRatio : number = size.width / size.height;
    const cameraFov : number = 2.0 * Math.PI / 5.0;
    const cameraNearClip : number = 0.1;
    const cameraFarClip: number = 1000.0;

    let camera = createCamera(canvas, {
        eye: [0, 100, 300],
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
    

    function renderLoop() {
        stats.begin();

        // 投影矩阵
        let projectionMatrix: mat4 = mat4.create();
        mat4.perspective(projectionMatrix, cameraFov, cameraRatio, cameraNearClip, cameraFarClip);

        if(camera.tick())
        {
            viewMatrix = camera.matrix;
        }

        let viewProjectionMatrix: mat4 = mat4.create();
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

        const textureView: GPUTextureView = context.getCurrentTexture().createView();
        
        Draws(device, context, textureView, depthView, viewProjectionMatrix, renderDatas);
        

        stats.end();

        requestAnimationFrame(renderLoop);
    }

    renderLoop();

    window.addEventListener('resize', () => { 
        size.width = canvas.width = canvas.clientWidth * devicePixelRatio;
        size.height = canvas.height = canvas.clientHeight * devicePixelRatio;
        
        cameraRatio = size.width / size.height;
        
        depthTexture.destroy();
        depthTexture = device.createTexture({
            size: [size.width, size.height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        depthView = depthTexture.createView();
    });
}