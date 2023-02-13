import { CShader, EShaderType } from "../../Render/Shader";

export class WebGPUShader extends CShader
{
    constructor(source: string, entryPoint: string, type: EShaderType) {
        super(source, entryPoint, type);
    }
}