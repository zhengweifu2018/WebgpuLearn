// 初始化GPU
export const InitGPU = async (CanvasName: string) => {
    const canvas = document.getElementById(CanvasName) as HTMLCanvasElement;
    const adapter = await navigator.gpu.requestAdapter({powerPreference:"high-performance"}) as GPUAdapter;
    const device = await adapter.requestDevice() as GPUDevice;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const size = {width: canvas.clientWidth * devicePixelRatio, height: canvas.clientHeight * devicePixelRatio};
    canvas.width = size.width;
    canvas.height = size.height;
    const format = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : context.getPreferredFormat(adapter);
    context.configure({
        device,
        format,
        alphaMode: 'opaque'
    });

    return { device, context, size, format, canvas };
}

// 创建GPU Vertex Buffer
export const CreateVertexBuffer  = (
    device: GPUDevice,
    data: Float32Array,
    usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST) => { 
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
export const CreateIndexBuffer = (
    device: GPUDevice,
    data: Uint32Array,
    usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST) => { 
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: usageFlag,
        mappedAtCreation: true,
    });
    new Uint32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}

// 创建GPU 2D Texture
export const CreateTexture2D = async (
    device: GPUDevice,
    imgUrl: string,
    addressModeU: GPUAddressMode = "repeat",
    addressModeV: GPUAddressMode = "repeat",
    minFilter: GPUFilterMode = "linear",
    magFilter: GPUFilterMode = "linear",
    format: GPUTextureFormat = "rgba8unorm"
) => { 
    let img = document.createElement("img");
    img.src = imgUrl;
    await img.decode();

    const imgBitmap = await createImageBitmap(img);

    const texture = device.createTexture({
        size: [imgBitmap.width, imgBitmap.height, 1],
        format: format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });

    const sampler = device.createSampler({
        minFilter: minFilter,
        magFilter: magFilter,
        addressModeU: addressModeU,
        addressModeV: addressModeV
    });

    device.queue.copyExternalImageToTexture({ source: imgBitmap }, { texture: texture }, [imgBitmap.width, imgBitmap.height]);
    
    return { texture, sampler };
}