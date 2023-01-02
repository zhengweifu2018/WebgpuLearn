import { InitGPU, CreateVertexBuffer, CreateIndexBuffer } from "../common";

import QuadVertexShader from "./vertex_shader.wgsl";
import QuadFragmentShader from "./fragment_shader.wgsl";

export const CreateBufferQuadrangle = async (canvasName: string) => { 
    const { device, context, presentationSize, presentationFormat } = await InitGPU(canvasName);
    
    const vertexData = new Float32Array([
        -0.5,  0.5,
         0.5,  0.5,
         0.5, -0.5,
        -0.5, -0.5,
    ]);

    const colorData = new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
        1, 1, 1
    ]);
        
    let vertexBuffer = CreateVertexBuffer(device, vertexData, GPUBufferUsage.VERTEX);
    let colorBuffer = CreateVertexBuffer(device, colorData, GPUBufferUsage.VERTEX);

    

    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: device.createShaderModule({
                code: QuadVertexShader
            }),
            entryPoint: "main",
            buffers: [{
                arrayStride: 8,
                attributes: [{shaderLocation: 0, format: "float32x2", offset: 0}]
            }, {
                arrayStride: 12,
                attributes: [{shaderLocation: 1, format: "float32x3", offset: 0}]
            }]
        },
        fragment: {
            module: device.createShaderModule({
                code: QuadFragmentShader
            }),
            entryPoint: "main",
            targets: [{
                format: presentationFormat
            }]
        },
        primitive: {
            topology: "triangle-list"
        }
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            clearValue: {
                r: 0, g: 0, b: 0, a: 1.0
            },
            loadOp: "clear",
            storeOp: 'store'
        }]
    } as GPURenderPassDescriptor;

    // 创建RenderPass
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline);

    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setVertexBuffer(1, colorBuffer);
    
    // 创建IndexBuffer并设置到RenderPass中
    {
        const indexData = new Uint32Array([
            0, 2, 1,
            0, 3, 2
        ]);
        let indexBuffer = CreateIndexBuffer(device, indexData, GPUBufferUsage.INDEX);
        renderPass.setIndexBuffer(indexBuffer, "uint32");
    }

    renderPass.drawIndexed(6, 1, 0, 0, 0);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}