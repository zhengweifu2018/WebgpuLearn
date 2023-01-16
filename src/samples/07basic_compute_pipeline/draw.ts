import { InitGPU, CreateVertexBuffer, CreateIndexBuffer } from "../common";
import { mat4, vec3 } from "gl-matrix";

import ComputeShader from "./compute_shader.wgsl?raw";

// 设置计算个数
const NUM = 1000;

const InitComputePipeline = async (
    device: GPUDevice,
    modelViewMatrix: Float32Array,
    projectionMatrix: Float32Array
) => {
    const descriptor: GPUComputePipelineDescriptor = {
        layout: 'auto',
        compute: {
            module: device.createShaderModule({
                code: ComputeShader
            }),
            entryPoint: 'main'
        }
    };
    const pipeline = await device.createComputePipelineAsync(descriptor);

    const modelViewBuffer = device.createBuffer({
        size: modelViewMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(modelViewBuffer, 0, modelViewMatrix);

    const projectionBuffer = device.createBuffer({
        size: projectionMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(projectionBuffer, 0, projectionMatrix);

    // 可读写的 buffer， usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    const mvpBuffer = device.createBuffer({
        size: modelViewMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    const countBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(countBuffer, 0, new Float32Array([NUM]));

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: modelViewBuffer
            }
        }, {
            binding: 1,
            resource:{
                buffer: projectionBuffer
            } 
        }, {
            binding: 2,
            resource:{
                buffer: mvpBuffer
            } 
        }, {
            binding: 3,
            resource:{
                buffer: countBuffer
            } 
        }]
    });

    return {pipeline, bindGroup, mvpBuffer};
}

export const CreateBasicComputePipeline = async (canvasName: string) => { 
    const { device, context, size, format, canvas } = await InitGPU(canvasName);

    let tempMatrix = mat4.create();
    mat4.identity(tempMatrix);
    const mvMatrix = new Float32Array(NUM * 4 * 4);
    const projectionMatrix = tempMatrix as Float32Array;
    for(let i = 0; i < NUM; i++)
    {
        mvMatrix.set(tempMatrix, i * 4 * 4);
    }
    const { pipeline , bindGroup, mvpBuffer } = await InitComputePipeline(device, mvMatrix, projectionMatrix);

    const readBuffer = device.createBuffer({
        size: mvMatrix.byteLength,
        usage:GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });

    const commandEncoder = device.createCommandEncoder();

    for(let i = 0; i < 300; i++)
    {
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(pipeline);
        computePass.setBindGroup(0, bindGroup);
        computePass.dispatchWorkgroups(Math.ceil(NUM / 128));
        computePass.end();
    }
    commandEncoder.copyBufferToBuffer(mvpBuffer, 0, readBuffer, 0, mvMatrix.byteLength);

    device.queue.submit([commandEncoder.finish()]);

    console.time('gpu multiply x300')

    await readBuffer.mapAsync(GPUMapMode.READ);

    const result = new Float32Array(readBuffer.getMappedRange());

    console.log(result);

    readBuffer.unmap();
}