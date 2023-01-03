import { InitGPU, CreateVertexBuffer, CreateIndexBuffer } from "../common";
import { mat4, vec3 } from "gl-matrix";

import VertexShader from "./vertex_shader.wgsl?raw";
import FragmentShader from "./fragment_shader.wgsl?raw";

const Draw = (
    device: GPUDevice, 
    context: GPUCanvasContext, 
    pipeline: GPURenderPipeline,
    textureView: GPUTextureView,
    depthView: GPUTextureView,
    vertexBuffer: GPUBuffer,
    indexBuffer: GPUBuffer,
    uniformBindGroup: GPUBindGroup
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
    renderPass.setPipeline(pipeline);

    renderPass.setVertexBuffer(0, vertexBuffer);
    
    // 设置IndexBuffer到RenderPass中
    renderPass.setIndexBuffer(indexBuffer, "uint32");

    renderPass.setBindGroup(0, uniformBindGroup);
    renderPass.drawIndexed(36, 1, 0, 0, 0);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}

export const CreateMovedCube = async (canvasName: string) => { 
    const { device, context, size, format, canvas } = await InitGPU(canvasName);
    
    const vertexData = new Float32Array([
        // position,   color
        -1, -1,  1,    0, 0, 1,     // vertex a, index 0
         1, -1,  1,    1, 0, 1,     // vertex b, index 1
         1,  1,  1,    1, 1, 1,     // vertex c, index 2
        -1,  1,  1,    0, 1, 1,     // vertex d, index 3
        -1, -1, -1,    0, 0, 0,     // vertex e, index 4
         1, -1, -1,    1, 0, 0,     // vertex f, index 5
         1,  1, -1,    1, 1, 0,     // vertex g, index 6
        -1,  1, -1,    0, 1, 0      // vertex h, index 7 
    ]);

    const indexData = new Uint32Array([
        // front
        0, 1, 2, 2, 3, 0,

        // right
        1, 5, 6, 6, 2, 1,

        // back
        4, 7, 6, 6, 5, 4,

        // left
        0, 3, 7, 7, 4, 0,

        // top
        3, 2, 6, 6, 7, 3,

        // bottom
        0, 4, 5, 5, 1, 0
    ]);
  
    let vertexBuffer: GPUBuffer = CreateVertexBuffer(device, vertexData, GPUBufferUsage.VERTEX);

    const pipeline: GPURenderPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: device.createShaderModule({
                code: VertexShader
            }),
            entryPoint: "main",
            buffers: [{
                arrayStride: 24,
                attributes: [{
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0
                }, {
                    shaderLocation: 1,
                    format: "float32x3",
                    offset: 12
                }]
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

    // 创建相机
    let cameraRatio : number = size.width / size.height;
    const cameraFov : number = 2.0 * Math.PI / 5.0;
    const cameraNearClip : number = 0.1;
    const cameraFarClip: number = 100.0;
    const cameraPosition: vec3 = vec3.fromValues(2, 2, 4);
    const lookDir: vec3 = vec3.fromValues(0, 0, 0);
    const upDir: vec3 = vec3.fromValues(0, 1, 0);

    const uniformBuffer: GPUBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const uniformBindGroup: GPUBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer,
                offset: 0,
                size: 64
            }
        }]
    });

    let depthTexture = device.createTexture({
        size: [size.width, size.height, 1],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    let depthView = depthTexture.createView();

    // 创建IndexBuffer并设置到RenderPass中
    const indexBuffer: GPUBuffer = CreateIndexBuffer(device, indexData, GPUBufferUsage.INDEX);


    const rotation = {x: 0, y: 0, z: 0};
    function renderLoop() {
        const rot =  5 * Math.PI / 180;
        rotation.x += rot;
        rotation.y += rot;

        // 投影矩阵
        let projectionMatrix: mat4 = mat4.create();
        mat4.perspective(projectionMatrix, cameraFov, cameraRatio, cameraNearClip, cameraFarClip);

        // 相机矩阵
        let viewMatrix: mat4 = mat4.create();
        mat4.lookAt(viewMatrix, cameraPosition, lookDir, upDir);

        let viewProjectionMatrix: mat4 = mat4.create();
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

        // 模型矩阵
        const modelMatrix: mat4 = mat4.create();

        // 更新模型矩阵
        mat4.rotateX(modelMatrix, modelMatrix, rotation.x)
        mat4.rotateY(modelMatrix, modelMatrix, rotation.y)
        mat4.rotateZ(modelMatrix, modelMatrix, rotation.z)

        // mvp矩阵
        let mvpMatrix: mat4 = mat4.create();
        
        // 更新mvp矩阵
        mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);

        // mvp uniform buffer 传给 gpu
        device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);

        const textureView: GPUTextureView = context.getCurrentTexture().createView();
        Draw(device, context, pipeline, textureView, depthView, vertexBuffer, indexBuffer, uniformBindGroup);
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