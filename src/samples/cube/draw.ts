import { InitGPU, CreateVertexBuffer, CreateIndexBuffer } from "../common";
import { mat4, vec3 } from "gl-matrix";

import VertexShader from "./vertex_shader.wgsl";
import FragmentShader from "./fragment_shader.wgsl";

export const CreateCube = async (canvasName: string) => { 
    const { device, context, presentationSize, presentationFormat } = await InitGPU(canvasName);
    
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
                format: presentationFormat
            }]
        },
        primitive: {
            topology: "triangle-list"
        },
        depthStencil:{
            format: "depth24plus",
            depthWriteEnabled: true,
            depthCompare: "less"
        }
    });

    // 创建相机
    const cameraRatio : number = presentationSize[0] / presentationSize[1];
    const cameraFov : number = 2.0 * Math.PI / 5.0;
    const cameraNearClip : number = 0.1;
    const cameraFarClip: number = 100.0;
    const cameraPosition: vec3 = vec3.fromValues(2, 2, 4);
    const lookDir: vec3 = vec3.fromValues(0, 0, 0);
    const upDir: vec3 = vec3.fromValues(0, 1, 0);

    // 投影矩阵
    let projectionMatrix: mat4 = mat4.create();
    mat4.perspective(projectionMatrix, cameraFov, cameraRatio, cameraNearClip, cameraFarClip);

    // 相机矩阵
    let viewMatrix: mat4 = mat4.create();
    mat4.lookAt(viewMatrix, cameraPosition, lookDir, upDir);

    let viewProjectionMatrix: mat4 = mat4.create();
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewProjectionMatrix);

    // 模型矩阵
    const modelMatrix: mat4 = mat4.create();

    // mvp矩阵
    let mvpMatrix: mat4 = mat4.create();
    mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);
    
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

    const depthTexture = device.createTexture({
        size: [presentationSize[0], presentationSize[1], 1],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
    const textureView: GPUTextureView = context.getCurrentTexture().createView();
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            loadValue: {
                r: 0, g: 0, b: 0, a: 1.0
            },
            storeOp: 'store'
        }],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthLoadValue: 1.0,
            depthStoreOp: "store",
            stencilLoadValue: 0,
            stencilStoreOp: "store"
        }
    };

    device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);

    // 创建RenderPass
    const renderPass: GPURenderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline);

    renderPass.setVertexBuffer(0, vertexBuffer);
    
    // 创建IndexBuffer并设置到RenderPass中
    {
        let indexBuffer: GPUBuffer = CreateIndexBuffer(device, indexData, GPUBufferUsage.INDEX);
        renderPass.setIndexBuffer(indexBuffer, "uint32");
    }
    renderPass.setBindGroup(0, uniformBindGroup);
    renderPass.drawIndexed(36, 1, 0, 0, 0);
    renderPass.endPass();

    device.queue.submit([commandEncoder.finish()]);
}