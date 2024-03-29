import { InitGPU } from "../common";

import TriangleVertexShader from "./vertex_shader.wgsl?raw";
import TriangleFragmentShader from "./fragment_shader.wgsl?raw";

export const CreateTrangle = async (canvasName: string) => { 
    const { device, context, size, format } = await InitGPU(canvasName);
    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: device.createShaderModule({
                code: TriangleVertexShader
            }),
            entryPoint: "main"
        },
        fragment: {
            module: device.createShaderModule({
                code: TriangleFragmentShader
            }),
            entryPoint: "main",
            targets: [{
                format: format
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

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
}