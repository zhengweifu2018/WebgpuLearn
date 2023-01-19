export class WebGPUApi {
    private constructor() {}

    public async InitGPU(canvasName: string) {
        this.m_Canvas = document.getElementById(canvasName) as HTMLCanvasElement;
        this.m_Adapter = await navigator.gpu.requestAdapter({powerPreference:"high-performance"}) as GPUAdapter;
        this.m_Device = await this.m_Adapter.requestDevice() as GPUDevice;
        this.m_Context = this.m_Canvas.getContext('webgpu') as unknown as GPUCanvasContext;
        console.log("xxxxxxxxxxx");
        const devicePixelRatio = window.devicePixelRatio || 1;
        const size = {width: this.m_Canvas.clientWidth * devicePixelRatio, height: this.m_Canvas.clientHeight * devicePixelRatio};
        this.m_Canvas.width = size.width;
        this.m_Canvas.height = size.height;
        this.m_Format = navigator.gpu.getPreferredCanvasFormat();
        this.m_Context.configure({
            device: this.m_Device,
            format: this.m_Format,
            alphaMode: 'opaque'
        });
    }

    public get Device() : GPUDevice {
        return this.m_Device;
    }
    public get Adapter() : GPUAdapter {
        return this.m_Adapter;
    }
    public get Canvas() : HTMLCanvasElement {
        return this.m_Canvas;
    }
    public get Context() : GPUCanvasContext {
        return this.m_Context;
    }
    public get Format() : GPUTextureFormat {
        return this.m_Format;
    }

    private m_Device: GPUDevice;
    private m_Adapter: GPUAdapter;
    private m_Canvas: HTMLCanvasElement;
    private m_Context: GPUCanvasContext;
    private m_Format: GPUTextureFormat;

    public static get Instance() : WebGPUApi {
        if(WebGPUApi.s_Instance === null )
        {
            WebGPUApi.s_Instance = new WebGPUApi();
        }
        return WebGPUApi.s_Instance;
    }

    private static s_Instance : WebGPUApi | null = null;
}