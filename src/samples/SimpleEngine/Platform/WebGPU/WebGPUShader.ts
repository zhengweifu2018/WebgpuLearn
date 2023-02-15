import { IShader, EShaderType } from "../../Render/Shader";

export class WebGPUShader extends IShader
{
    constructor(source: string, entryPoint: string, type: EShaderType) {
        super(source, entryPoint, type);
    }
}