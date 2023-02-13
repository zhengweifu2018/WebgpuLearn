import { CVertexBuffer } from "./Buffer"
import { CShader } from "./Shader"

export class CPipelineStateObject {

    get RenderPipeline(): any {
        return null;
    }

    get VertexBuffer() {
        return this.m_VertexBuffer;
    }

    get VertexShader() {
        return this.m_VertexShader;
    }

    get FragmentShader() {
        return this.m_FragmentShader;
    }

    private m_VertexBuffer: CVertexBuffer | null;
    private m_VertexShader: CShader | null;
    private m_FragmentShader: CShader | null;
}