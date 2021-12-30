import { buffer } from "stream/consumers";

// 创建设备
export const CreateDevice = async (CanvasName: string) => {
    const canvas = document.getElementById(CanvasName) as HTMLCanvasElement;
    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
    const device = await adapter.requestDevice() as GPUDevice;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [canvas.clientWidth * devicePixelRatio, canvas.clientHeight * devicePixelRatio];
    const presentationFormat = context.getPreferredFormat(adapter);
    context.configure({
        device,
        format: presentationFormat,
        size: presentationSize
    });

    return { device, context, presentationSize, presentationFormat };
}

// 创建GPU Buffer
export const CreateGPUBuffer = (
    device: GPUDevice,
    data: Float32Array,
    usageFlag: GPUBufferUsageFlags) => { 
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}

// 创建GPU 2D Texture
export const CreateTexture2D = () => { }