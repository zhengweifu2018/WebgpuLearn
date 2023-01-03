import FragmentShader from "../shader/fragment_shader.wgsl?raw";

export class CMaterial { 
    public createFragmentState(
        device: GPUDevice,
        textureFormat: GPUTextureFormat
    ): GPUFragmentState { 
        let fragmentState: GPUFragmentState = {
            module: device.createShaderModule({
                code: FragmentShader
            }),
            entryPoint: "main",
            targets: [{
                format: textureFormat
            }]
        } as GPUFragmentState;

        return fragmentState;
    }
}