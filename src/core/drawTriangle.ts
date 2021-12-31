import { InitGPU } from "./common";

import TriangleVertexShader from "../shaders/triangle/vertex_shader.wgsl";
import TriangleFragmentShader from "../shaders/triangle/fragment_shader.wgsl";

export const CreateTrangle = async (canvasName: string) => { 
    const { device, context, presentationSize, presentationFormat } = await InitGPU(canvasName);
    const pipeline = device.createRenderPipeline({
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
            loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            storeOp: 'store'
        }]
    } as GPURenderPassDescriptor;

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();

    device.queue.submit([commandEncoder.finish()]);
}